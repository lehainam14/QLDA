import { Response } from 'express';
import prisma from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

// ================= EMPLOYERS REVIEW =================
export const getPendingEmployers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const q = (req.query.q as string)?.trim();
    const where: any = {};

    if (q) {
      where.OR = [
        { companyName: { contains: q } },
        { taxId: { contains: q } },
        { phone: { contains: q } }
      ];
    }

    const employers = await prisma.employerProfile.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true, createdAt: true } }
      }
    });

    res.json({ employers });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi khi tải danh sách nhà tuyển dụng: ' + error.message });
  }
};

export const reviewEmployer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { action, rejectReason } = req.body; // action: 'APPROVE' | 'REJECT'

    if (!action || (action !== 'APPROVE' && action !== 'REJECT')) {
      res.status(400).json({ message: 'Hành động không hợp lệ (APPROVE hoặc REJECT)' });
      return;
    }

    const employer = await prisma.employerProfile.findUnique({ where: { id } });
    if (!employer) {
      res.status(404).json({ message: 'Không tìm thấy nhà tuyển dụng' });
      return;
    }

    const isApprove = action === 'APPROVE';
    const updated = await prisma.employerProfile.update({
      where: { id },
      data: {
        isVerified: isApprove,
        verificationStatus: isApprove ? 'VERIFIED' : 'REJECTED',
        rejectReason: isApprove ? null : (rejectReason || 'Hồ sơ giấy phép kinh doanh không đạt yêu cầu')
      }
    });

    res.json({
      message: isApprove ? 'Đã duyệt tài khoản doanh nghiệp thành công' : 'Đã từ chối tài khoản doanh nghiệp',
      employer: updated
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi khi duyệt nhà tuyển dụng: ' + error.message });
  }
};

// ================= JOBS REVIEW =================
export const getPendingJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const jobs = await prisma.job.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: {
        employer: {
          select: {
            id: true,
            companyName: true,
            isVerified: true,
            taxId: true,
            phone: true
          }
        },
        category: true,
        province: true,
        district: true
      }
    });

    res.json({ jobs });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi khi tải danh sách tin chờ duyệt: ' + error.message });
  }
};

export const reviewJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { action, rejectReason } = req.body; // action: 'APPROVE' | 'REJECT'

    if (!action || (action !== 'APPROVE' && action !== 'REJECT')) {
      res.status(400).json({ message: 'Hành động không hợp lệ (APPROVE hoặc REJECT)' });
      return;
    }

    if (action === 'REJECT' && (!rejectReason || !rejectReason.trim())) {
      res.status(400).json({ message: 'Lý do từ chối là bắt buộc để nhà tuyển dụng có thể chỉnh sửa' });
      return;
    }

    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) {
      res.status(404).json({ message: 'Không tìm thấy tin tuyển dụng' });
      return;
    }

    const isApprove = action === 'APPROVE';
    const updated = await prisma.job.update({
      where: { id },
      data: {
        status: isApprove ? 'PUBLISHED' : 'REJECTED',
        rejectReason: isApprove ? null : rejectReason.trim()
      }
    });

    res.json({
      message: isApprove ? 'Đã phê duyệt tin tuyển dụng thành công. Tin đang hiển thị công khai.' : 'Đã từ chối tin tuyển dụng kèm lý do',
      job: updated
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi khi duyệt tin: ' + error.message });
  }
};

// ================= CATEGORIES & LOCATIONS =================
export const getCategories = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { jobs: true } }
      }
    });
    res.json({ categories });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi khi lấy danh mục ngành nghề: ' + error.message });
  }
};

export const addCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ message: 'Tên ngành nghề không được để trống' });
      return;
    }

    const existing = await prisma.category.findUnique({ where: { name: name.trim() } });
    if (existing) {
      res.status(400).json({ message: 'Ngành nghề này đã tồn tại' });
      return;
    }

    const category = await prisma.category.create({
      data: { name: name.trim() }
    });

    res.status(201).json({ message: 'Thêm ngành nghề thành công', category });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi khi thêm ngành nghề: ' + error.message });
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    res.json({ message: 'Đã xóa ngành nghề thành công' });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi khi xóa ngành nghề: ' + error.message });
  }
};

export const getLocations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { parentId, type } = req.query;
    const where: any = {};
    if (parentId) where.parentId = String(parentId);
    if (type) where.type = String(type).toUpperCase();

    // If hierarchy is requested or no specific type/parent requested, return cities with their districts
    if (req.query.hierarchy === 'true' || (!parentId && !type)) {
      const cities = await prisma.location.findMany({
        where: { type: 'CITY' },
        orderBy: { name: 'asc' },
        include: {
          children: {
            orderBy: { name: 'asc' },
            include: {
              _count: { select: { districtJobs: true } }
            }
          },
          _count: { select: { provinceJobs: true } }
        }
      });
      res.json({ locations: cities, cities });
      return;
    }

    const locations = await prisma.location.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        parent: true,
        children: true,
        _count: { select: { districtJobs: true, provinceJobs: true } }
      }
    });
    res.json({ locations });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách địa điểm: ' + error.message });
  }
};

export const addLocation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, type, parentId } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ message: 'Tên địa điểm không được để trống' });
      return;
    }

    const locType = type ? type.toUpperCase() : (parentId ? 'DISTRICT' : 'CITY');

    const location = await prisma.location.create({
      data: {
        name: name.trim(),
        type: locType,
        parentId: parentId || null
      }
    });

    res.status(201).json({ message: 'Thêm địa điểm thành công', location });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi khi thêm địa điểm: ' + error.message });
  }
};

export const deleteLocation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.location.delete({ where: { id } });
    res.json({ message: 'Đã xóa địa điểm thành công' });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi khi xóa địa điểm: ' + error.message });
  }
};

// ================= JOB REPORTS =================
export const getReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reports = await prisma.jobReport.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            status: true,
            employer: { select: { companyName: true } }
          }
        }
      }
    });

    res.json({ reports });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách báo cáo: ' + error.message });
  }
};

export const handleReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'HIDE_JOB' (ẩn tin) | 'DISMISS' (bỏ qua)

    const report = await prisma.jobReport.findUnique({
      where: { id },
      include: { job: true }
    });

    if (!report) {
      res.status(404).json({ message: 'Không tìm thấy báo cáo' });
      return;
    }

    if (action === 'HIDE_JOB') {
      await prisma.$transaction([
        prisma.job.update({
          where: { id: report.jobId },
          data: {
            status: 'REJECTED',
            rejectReason: `Tin bị ẩn do phản ánh vi phạm an toàn: ${report.reason}`
          }
        }),
        prisma.jobReport.update({
          where: { id },
          data: { status: 'RESOLVED' }
        })
      ]);

      res.json({ message: 'Đã ẩn tin tuyển dụng và đánh dấu báo cáo đã xử lý' });
    } else {
      await prisma.jobReport.update({
        where: { id },
        data: { status: 'DISMISSED' }
      });

      res.json({ message: 'Đã bỏ qua báo cáo tin' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi khi xử lý báo cáo: ' + error.message });
  }
};
