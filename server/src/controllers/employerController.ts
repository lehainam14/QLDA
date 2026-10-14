import { Response } from 'express';
import prisma from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { NotificationService } from '../services/notificationService.js';

export const getEmployerDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'EMPLOYER') {
      res.status(403).json({ message: 'Chỉ nhà tuyển dụng mới có quyền truy cập bảng điều khiển' });
      return;
    }

    const employer = await prisma.employerProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!employer) {
      res.status(404).json({ message: 'Không tìm thấy hồ sơ nhà tuyển dụng' });
      return;
    }

    const jobs = await prisma.job.findMany({
      where: { employerId: employer.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { applications: true }
        },
        province: true,
        district: true,
        category: true
      }
    });

    // Check expiration on jobs
    const now = new Date();
    const updatedJobs = jobs.map((job) => {
      let currentStatus = job.status;
      if (job.status === 'PUBLISHED' && new Date(job.deadline) < now) {
        currentStatus = 'EXPIRED';
      }
      return {
        ...job,
        displayStatus: currentStatus,
        applicantCount: job._count.applications
      };
    });

    res.json({
      employer,
      jobs: updatedJobs
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi khi tải bảng điều khiển: ' + error.message });
  }
};

export const createJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'EMPLOYER') {
      res.status(403).json({ message: 'Chỉ nhà tuyển dụng mới có quyền đăng tin' });
      return;
    }

    const employer = await prisma.employerProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!employer) {
      res.status(404).json({ message: 'Không tìm thấy thông tin doanh nghiệp' });
      return;
    }

    // Must be verified by Admin
    if (!employer.isVerified) {
      res.status(403).json({
        message: 'Tài khoản doanh nghiệp của bạn đang chờ Quản trị viên duyệt hồ sơ Giấy phép kinh doanh. Bạn chưa thể đăng tin tuyển dụng.'
      });
      return;
    }

    const {
      title,
      job_type,
      deadline,
      wage_min,
      wage_max,
      wage_type,
      address,
      description,
      requirements,
      category_id,
      province_id,
      district_id,
      location_id,
      is_draft
    } = req.body;

    // Validation rules
    if (!title || title.trim().length === 0) {
      res.status(400).json({ message: 'Tiêu đề công việc là bắt buộc' });
      return;
    }

    if (title.trim().length > 100) {
      res.status(400).json({ message: 'Tiêu đề công việc không được vượt quá 100 ký tự' });
      return;
    }

    const numWageMin = Number(wage_min);
    const numWageMax = Number(wage_max);
    if (isNaN(numWageMin) || isNaN(numWageMax) || numWageMin < 0 || numWageMax < numWageMin) {
      res.status(400).json({ message: 'Mức lương phải là số hợp lệ và lương tối đa không nhỏ hơn lương tối thiểu' });
      return;
    }

    if (!deadline) {
      res.status(400).json({ message: 'Vui lòng chọn hạn chót nhận hồ sơ' });
      return;
    }

    const deadlineDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (deadlineDate <= today) {
      res.status(400).json({ message: 'Hạn chót nhận hồ sơ phải sau ngày hiện tại' });
      return;
    }

    if (!address || !address.trim()) {
      res.status(400).json({ message: 'Địa chỉ làm việc là bắt buộc' });
      return;
    }

    if (!description || !description.trim()) {
      res.status(400).json({ message: 'Mô tả công việc là bắt buộc' });
      return;
    }

    if (!requirements || !requirements.trim()) {
      res.status(400).json({ message: 'Yêu cầu ứng viên là bắt buộc' });
      return;
    }

    const status = is_draft ? 'DRAFT' : 'PENDING';

    let provinceId = province_id || null;
    let districtId = district_id || location_id || null;
    if (districtId && !provinceId) {
      const dist = await prisma.location.findUnique({ where: { id: districtId } });
      if (dist && dist.parentId) provinceId = dist.parentId;
    }

    const job = await prisma.job.create({
      data: {
        employerId: employer.id,
        title: title.trim(),
        jobType: job_type || 'Part-time',
        deadline: deadlineDate,
        wageMin: numWageMin,
        wageMax: numWageMax,
        wageType: wage_type || 'HOURLY',
        address: address.trim(),
        description: description.trim(),
        requirements: requirements.trim(),
        shiftTypes: job_type || 'Part-time',
        status,
        categoryId: category_id || null,
        provinceId: provinceId || null,
        districtId: districtId || null
      }
    });

    res.status(201).json({
      message: status === 'DRAFT' ? 'Đã lưu bản nháp tin tuyển dụng' : 'Tin tuyển dụng đã gửi thành công và đang chờ Admin duyệt',
      job
    });
  } catch (error: any) {
    console.error('createJob error:', error);
    res.status(500).json({ message: 'Lỗi khi tạo tin tuyển dụng: ' + error.message });
  }
};

export const updateJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'EMPLOYER') {
      res.status(403).json({ message: 'Không có quyền sửa tin' });
      return;
    }

    const { id } = req.params;
    const employer = await prisma.employerProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!employer) {
      res.status(404).json({ message: 'Không tìm thấy nhà tuyển dụng' });
      return;
    }

    const job = await prisma.job.findUnique({ where: { id } });
    if (!job || job.employerId !== employer.id) {
      res.status(404).json({ message: 'Không tìm thấy tin tuyển dụng của bạn' });
      return;
    }

    const {
      title,
      job_type,
      deadline,
      wage_min,
      wage_max,
      wage_type,
      address,
      description,
      requirements,
      category_id,
      province_id,
      district_id,
      location_id,
      is_draft
    } = req.body;

    if (title && title.trim().length > 100) {
      res.status(400).json({ message: 'Tiêu đề không được quá 100 ký tự' });
      return;
    }

    let deadlineDate = job.deadline;
    if (deadline) {
      deadlineDate = new Date(deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deadlineDate <= today) {
        res.status(400).json({ message: 'Hạn nhận hồ sơ phải sau ngày hiện tại' });
        return;
      }
    }

    let status = job.status;
    if (is_draft !== undefined) {
      status = is_draft ? 'DRAFT' : 'PENDING';
    } else if (job.status === 'REJECTED') {
      // If editing a rejected job, resubmit to PENDING
      status = 'PENDING';
    }

    let provinceId = province_id !== undefined ? province_id : undefined;
    let districtId = district_id !== undefined ? district_id : (location_id !== undefined ? location_id : undefined);
    if (districtId && !provinceId) {
      const dist = await prisma.location.findUnique({ where: { id: districtId } });
      if (dist && dist.parentId) provinceId = dist.parentId;
    }

    const updated = await prisma.job.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : job.title,
        jobType: job_type !== undefined ? job_type : job.jobType,
        deadline: deadlineDate,
        wageMin: wage_min !== undefined ? Number(wage_min) : job.wageMin,
        wageMax: wage_max !== undefined ? Number(wage_max) : job.wageMax,
        wageType: wage_type !== undefined ? wage_type : job.wageType,
        address: address !== undefined ? address.trim() : job.address,
        description: description !== undefined ? description.trim() : job.description,
        requirements: requirements !== undefined ? requirements.trim() : job.requirements,
        categoryId: category_id !== undefined ? category_id : job.categoryId,
        provinceId: provinceId !== undefined ? provinceId : job.provinceId,
        districtId: districtId !== undefined ? districtId : job.districtId,
        status,
        rejectReason: status === 'PENDING' ? null : job.rejectReason
      }
    });

    res.json({
      message: 'Cập nhật tin tuyển dụng thành công',
      job: updated
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi khi cập nhật tin tuyển dụng: ' + error.message });
  }
};

export const getJobApplicants = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'EMPLOYER') {
      res.status(403).json({ message: 'Chỉ nhà tuyển dụng mới có quyền xem ứng viên' });
      return;
    }

    const employer = await prisma.employerProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!employer) {
      res.status(404).json({ message: 'Không tìm thấy nhà tuyển dụng' });
      return;
    }

    const jobId = req.query.jobId as string;
    const whereCondition: any = {
      job: { employerId: employer.id }
    };

    if (jobId) {
      whereCondition.jobId = jobId;
    }

    const applications = await prisma.application.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      include: {
        job: { select: { id: true, title: true } },
        student: {
          select: {
            id: true,
            fullName: true,
            university: true,
            skills: true,
            experience: true,
            cvUrl: true,
            avatarUrl: true,
            user: { select: { email: true } }
          }
        },
        statusHistories: {
          orderBy: { changedAt: 'asc' }
        }
      }
    });

    res.json({ applications });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi khi tải danh sách ứng viên: ' + error.message });
  }
};

export const markApplicationViewed = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const employer = await prisma.employerProfile.findUnique({
      where: { userId: req.user!.id }
    });

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: true,
        student: { include: { user: true } }
      }
    });

    if (!application || application.job.employerId !== employer?.id) {
      res.status(404).json({ message: 'Không tìm thấy hồ sơ ứng tuyển' });
      return;
    }

    if (application.status === 'SUBMITTED') {
      const updated = await prisma.application.update({
        where: { id },
        data: {
          status: 'VIEWED',
          statusHistories: {
            create: {
              status: 'VIEWED',
              note: 'Nhà tuyển dụng đã mở xem hồ sơ'
            }
          }
        }
      });

      // Notification
      await NotificationService.sendApplicationStatusNotification(
        application.student.user.email,
        application.student.fullName,
        application.job.title,
        employer.companyName,
        'VIEWED'
      );

      res.json({ application: updated });
      return;
    }

    res.json({ application });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái đã xem: ' + error.message });
  }
};

export const updateApplicantStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'EMPLOYER') {
      res.status(403).json({ message: 'Chỉ nhà tuyển dụng mới có thể cập nhật trạng thái ứng viên' });
      return;
    }

    const { id } = req.params;
    const { status, note } = req.body;

    const allowedStatuses = ['SHORTLISTED', 'REJECTED'];
    if (!allowedStatuses.includes(status)) {
      res.status(400).json({ message: 'Trạng thái không hợp lệ. Chỉ chấp nhận SHORTLISTED (Phù hợp) hoặc REJECTED (Từ chối).' });
      return;
    }

    const employer = await prisma.employerProfile.findUnique({
      where: { userId: req.user.id }
    });

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: true,
        student: { include: { user: true } }
      }
    });

    if (!application || application.job.employerId !== employer?.id) {
      res.status(404).json({ message: 'Không tìm thấy hồ sơ ứng tuyển' });
      return;
    }

    const updated = await prisma.application.update({
      where: { id },
      data: {
        status,
        statusHistories: {
          create: {
            status,
            note: note || (status === 'SHORTLISTED' ? 'Hồ sơ phù hợp, chuyển sang phỏng vấn' : 'Nhà tuyển dụng từ chối hồ sơ')
          }
        }
      }
    });

    // Send/log notification
    const notificationResult = await NotificationService.sendApplicationStatusNotification(
      application.student.user.email,
      application.student.fullName,
      application.job.title,
      employer.companyName,
      status
    );

    res.json({
      message: `Đã cập nhật trạng thái ứng viên thành công (${status === 'SHORTLISTED' ? 'Phù hợp' : 'Từ chối'})`,
      application: updated,
      notification: notificationResult
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái ứng viên: ' + error.message });
  }
};
