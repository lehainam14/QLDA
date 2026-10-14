import { Request, Response } from 'express';
import prisma from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

export const getJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(10, Math.max(1, parseInt(req.query.limit as string) || 10)); // max 10
    const skip = (page - 1) * limit;

    const q = (req.query.q as string)?.trim();
    const provinceId = (req.query.provinceId as string)?.trim();
    const districtId = (req.query.districtId as string)?.trim();
    const provinceName = (req.query.province as string)?.trim();
    const districtName = (req.query.district as string)?.trim();
    const location = (req.query.location as string)?.trim();
    const category = (req.query.category as string)?.trim();
    const wageType = (req.query.wageType as string)?.trim();
    const shifts = req.query.shifts as string; // e.g. "Ca sáng,Ca gãy"

    const where: any = {
      status: 'PUBLISHED',
      deadline: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)) // Not expired
      }
    };

    const andConditions: any[] = [];

    if (q) {
      andConditions.push({
        OR: [
          { title: { contains: q } },
          { description: { contains: q } },
          { requirements: { contains: q } },
          { employer: { companyName: { contains: q } } }
        ]
      });
    }

    // Specific District filter takes highest priority
    if (districtId && districtId !== 'all' && districtId !== 'Tất cả Quận/Huyện') {
      andConditions.push({ districtId });
    } else if (districtName && districtName !== 'all' && districtName !== 'Tất cả Quận/Huyện') {
      andConditions.push({ district: { name: districtName } });
    }

    // Province filter: if district is not set or set to all, filter by province
    if (provinceId && provinceId !== 'all' && provinceId !== 'Tất cả Thành phố/Tỉnh') {
      andConditions.push({ provinceId });
    } else if (provinceName && provinceName !== 'all' && provinceName !== 'Tất cả Thành phố/Tỉnh') {
      andConditions.push({ province: { name: provinceName } });
    }

    // Backward compatibility for legacy location string
    if (
      location &&
      location !== 'Tất cả Quận/Huyện' &&
      location !== 'all' &&
      !provinceId &&
      !districtId &&
      !provinceName &&
      !districtName
    ) {
      andConditions.push({
        OR: [
          { address: { contains: location } },
          { province: { name: { contains: location } } },
          { district: { name: { contains: location } } }
        ]
      });
    }

    if (category && category !== 'all') {
      andConditions.push({ category: { name: { contains: category } } });
    }

    if (wageType && wageType !== 'all') {
      andConditions.push({ wageType: wageType.toUpperCase() });
    }

    if (shifts) {
      const shiftList = shifts.split(',').map((s) => s.trim()).filter(Boolean);
      if (shiftList.length > 0) {
        shiftList.forEach((shift) => {
          andConditions.push({ shiftTypes: { contains: shift } });
        });
      }
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const [total, jobs] = await Promise.all([
      prisma.job.count({ where }),
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          employer: {
            select: {
              id: true,
              companyName: true,
              isVerified: true
            }
          },
          category: true,
          province: true,
          district: true
        }
      })
    ]);

    // Check saved status and application status for current student if logged in
    let savedJobIds: Set<string> = new Set();
    let appliedJobIds: Set<string> = new Set();

    if (req.user && req.user.role === 'STUDENT') {
      const student = await prisma.studentProfile.findUnique({
        where: { userId: req.user.id },
        include: {
          savedJobs: { select: { jobId: true } },
          applications: { select: { jobId: true } }
        }
      });

      if (student) {
        savedJobIds = new Set(student.savedJobs.map((s) => s.jobId));
        appliedJobIds = new Set(student.applications.map((a) => a.jobId));
      }
    }

    const formattedJobs = jobs.map((job) => {
      const formattedLocation = job.district && job.province
        ? `${job.district.name}, ${job.province.name}`
        : (job.province?.name || job.district?.name || job.address);

      return {
        ...job,
        formattedLocation,
        isSaved: savedJobIds.has(job.id),
        hasApplied: appliedJobIds.has(job.id)
      };
    });

    res.json({
      jobs: formattedJobs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('getJobs error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách việc làm: ' + error.message });
  }
};

export const getJobById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    let job;
    if (id === 'seed-job-1' || id === 'sample' || id === 'demo') {
      job = await prisma.job.findFirst({
        where: { status: 'PUBLISHED' },
        include: {
          employer: {
            select: {
              id: true,
              companyName: true,
              isVerified: true,
              phone: true
            }
          },
          category: true,
          province: true,
          district: true
        }
      });
    } else {
      job = await prisma.job.findUnique({
        where: { id },
        include: {
          employer: {
            select: {
              id: true,
              companyName: true,
              isVerified: true,
              phone: true
            }
          },
          category: true,
          province: true,
          district: true
        }
      });
    }

    if (!job) {
      res.status(404).json({ message: 'Không tìm thấy tin tuyển dụng' });
      return;
    }

    let isSaved = false;
    let hasApplied = false;
    let application = null;

    if (req.user && req.user.role === 'STUDENT') {
      const student = await prisma.studentProfile.findUnique({
        where: { userId: req.user.id }
      });

      if (student) {
        const [saved, app] = await Promise.all([
          prisma.savedJob.findUnique({
            where: {
              studentId_jobId: {
                studentId: student.id,
                jobId: job.id
              }
            }
          }),
          prisma.application.findUnique({
            where: {
              jobId_studentId: {
                jobId: job.id,
                studentId: student.id
              }
            }
          })
        ]);

        isSaved = !!saved;
        hasApplied = !!app;
        application = app;
      }
    }

    const formattedLocation = job.district && job.province
      ? `${job.district.name}, ${job.province.name}`
      : (job.province?.name || job.district?.name || job.address);

    res.json({
      job: {
        ...job,
        formattedLocation,
        isSaved,
        hasApplied,
        application
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi khi tải chi tiết việc làm: ' + error.message });
  }
};

export const toggleSaveJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Vui lòng đăng nhập để lưu tin' });
      return;
    }

    const { jobId } = req.body;
    if (!jobId) {
      res.status(400).json({ message: 'Thiếu mã công việc (jobId)' });
      return;
    }

    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!student) {
      res.status(403).json({ message: 'Chỉ tài khoản sinh viên mới có thể lưu tin' });
      return;
    }

    const existing = await prisma.savedJob.findUnique({
      where: {
        studentId_jobId: {
          studentId: student.id,
          jobId
        }
      }
    });

    if (existing) {
      await prisma.savedJob.delete({
        where: { id: existing.id }
      });
      res.json({ saved: false, message: 'Đã xóa việc làm khỏi danh sách đã lưu' });
    } else {
      await prisma.savedJob.create({
        data: {
          studentId: student.id,
          jobId
        }
      });
      res.json({ saved: true, message: 'Đã lưu việc làm vào danh sách yêu thích' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi khi lưu/bỏ lưu tin: ' + error.message });
  }
};

export const getSavedJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Vui lòng đăng nhập' });
      return;
    }

    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!student) {
      res.status(403).json({ message: 'Chỉ tài khoản sinh viên mới có danh sách đã lưu' });
      return;
    }

    const savedJobs = await prisma.savedJob.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' },
      include: {
        job: {
          include: {
            employer: {
              select: {
                id: true,
                companyName: true,
                isVerified: true
              }
            },
            province: true,
            district: true,
            category: true
          }
        }
      }
    });

    res.json({ savedJobs });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách việc làm đã lưu: ' + error.message });
  }
};

export const reportJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { jobId, reason, description } = req.body;

    if (!jobId || !reason) {
      res.status(400).json({ message: 'Vui lòng chọn lý do báo cáo' });
      return;
    }

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      res.status(404).json({ message: 'Tin tuyển dụng không tồn tại' });
      return;
    }

    let reporterEmail = req.user?.email || req.body.email || 'anonymous@jobstudent.vn';

    const report = await prisma.jobReport.create({
      data: {
        jobId,
        reason,
        description: description?.trim() || null,
        reporterId: req.user?.id || null,
        reporterEmail,
        status: 'PENDING'
      }
    });

    res.status(201).json({
      message: 'Cảm ơn bạn đã gửi báo cáo. Quản trị viên sẽ kiểm tra tin này trong thời gian sớm nhất.',
      report
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi khi gửi báo cáo: ' + error.message });
  }
};
