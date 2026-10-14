import { Response } from 'express';
import prisma from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

export const getStudentProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Vui lòng đăng nhập' });
      return;
    }

    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        user: { select: { email: true, role: true } }
      }
    });

    if (!student) {
      res.status(404).json({ message: 'Không tìm thấy hồ sơ sinh viên' });
      return;
    }

    res.json({ profile: student });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi khi tải hồ sơ sinh viên: ' + error.message });
  }
};

export const updateStudentProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Vui lòng đăng nhập' });
      return;
    }

    const { fullname, birthday, university, skills, experience } = req.body;

    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!student) {
      res.status(404).json({ message: 'Không tìm thấy hồ sơ sinh viên' });
      return;
    }

    let cvUrl = student.cvUrl;
    let avatarUrl = student.avatarUrl;

    if (req.file) {
      // Could be cv or avatar depending on fieldname
      if (req.file.fieldname === 'cv_file') {
        cvUrl = `/uploads/resumes/${req.file.filename}`;
      } else if (req.file.fieldname === 'avatar') {
        avatarUrl = `/uploads/avatars/${req.file.filename}`;
      }
    }

    // Calculate profile completion percentage
    let score = 20; // base for email + role
    if (fullname || student.fullName) score += 20;
    if (birthday || student.birthday) score += 15;
    if (university || student.university) score += 15;
    if (skills || student.skills) score += 15;
    if (experience || student.experience) score += 15;
    if (cvUrl) score = Math.min(100, score + 10);
    const completionPercent = Math.min(100, score);

    const updated = await prisma.studentProfile.update({
      where: { id: student.id },
      data: {
        fullName: fullname !== undefined ? fullname.trim() : student.fullName,
        birthday: birthday !== undefined ? birthday : student.birthday,
        university: university !== undefined ? university.trim() : student.university,
        skills: skills !== undefined ? skills.trim() : student.skills,
        experience: experience !== undefined ? experience.trim() : student.experience,
        cvUrl,
        avatarUrl,
        completionPercent
      }
    });

    res.json({
      message: 'Cập nhật hồ sơ sinh viên thành công',
      profile: updated
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi khi cập nhật hồ sơ: ' + error.message });
  }
};

export const applyJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'STUDENT') {
      res.status(403).json({ message: 'Chỉ tài khoản sinh viên mới có thể nộp đơn ứng tuyển' });
      return;
    }

    const { jobId, resumeType, cover } = req.body;

    if (!jobId) {
      res.status(400).json({ message: 'Thiếu mã công việc ứng tuyển' });
      return;
    }

    // Verify word limit on cover letter (<= 500 words)
    if (cover) {
      const wordCount = cover.trim().split(/\s+/).filter(Boolean).length;
      if (wordCount > 500) {
        res.status(400).json({
          message: `Thư giới thiệu vượt quá 500 từ (hiện tại: ${wordCount} từ). Vui lòng rút gọn.`
        });
        return;
      }
    }

    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!student) {
      res.status(404).json({ message: 'Không tìm thấy hồ sơ sinh viên' });
      return;
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { employer: true }
    });

    if (!job) {
      res.status(404).json({ message: 'Công việc không tồn tại' });
      return;
    }

    if (job.status !== 'PUBLISHED') {
      res.status(400).json({ message: 'Tin tuyển dụng này hiện không mở nhận hồ sơ' });
      return;
    }

    // Check duplicate application
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_studentId: {
          jobId: job.id,
          studentId: student.id
        }
      }
    });

    if (existingApplication) {
      res.status(400).json({ message: 'Bạn đã nộp đơn cho công việc này rồi. Vui lòng theo dõi trạng thái tại mục Ứng tuyển của tôi.' });
      return;
    }

    let resumeFileUrl = student.cvUrl || null;
    if (resumeType === 'upload') {
      if (req.file) {
        resumeFileUrl = `/uploads/resumes/${req.file.filename}`;
      } else {
        res.status(400).json({ message: 'Vui lòng chọn tệp CV từ thiết bị (PDF hoặc Word)' });
        return;
      }
    }

    const application = await prisma.application.create({
      data: {
        jobId: job.id,
        studentId: student.id,
        resumeType: resumeType === 'upload' ? 'UPLOAD' : 'PROFILE',
        resumeFileUrl,
        coverLetter: cover?.trim() || null,
        status: 'SUBMITTED',
        statusHistories: {
          create: {
            status: 'SUBMITTED',
            note: 'Ứng viên đã gửi hồ sơ ứng tuyển'
          }
        }
      }
    });

    res.status(201).json({
      message: 'Nộp hồ sơ ứng tuyển thành công!',
      application
    });
  } catch (error: any) {
    console.error('applyJob error:', error);
    res.status(500).json({ message: 'Lỗi khi ứng tuyển: ' + error.message });
  }
};

export const getStudentApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'STUDENT') {
      res.status(403).json({ message: 'Chỉ tài khoản sinh viên mới có lịch sử ứng tuyển' });
      return;
    }

    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!student) {
      res.status(404).json({ message: 'Không tìm thấy hồ sơ sinh viên' });
      return;
    }

    const applications = await prisma.application.findMany({
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
            district: true
          }
        },
        statusHistories: {
          orderBy: { changedAt: 'asc' }
        }
      }
    });

    res.json({ applications });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi khi tải danh sách ứng tuyển: ' + error.message });
  }
};
