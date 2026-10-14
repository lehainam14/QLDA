import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'jobstudent_jwt_secret_key_development_2026';

// Password validation: min 8 characters, at least 1 uppercase, at least 1 digit
export const validatePassword = (password: string): boolean => {
  return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
};

// Phone validation: exactly 10 digits
export const validatePhone = (phone: string): boolean => {
  return /^\d{10}$/.test(phone);
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = req.body;

    if (!role || (role !== 'STUDENT' && role !== 'EMPLOYER')) {
      res.status(400).json({ message: 'Vai trò người dùng không hợp lệ (STUDENT hoặc EMPLOYER)' });
      return;
    }

    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
      res.status(400).json({ message: 'Vui lòng điền đầy đủ email và mật khẩu' });
      return;
    }

    if (!validatePassword(password)) {
      res.status(400).json({
        message: 'Mật khẩu phải có tối thiểu 8 ký tự, bao gồm ít nhất một chữ hoa và một chữ số'
      });
      return;
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(400).json({ message: 'Email này đã được sử dụng trên hệ thống' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === 'STUDENT') {
      const { fullname, university } = req.body;
      if (!fullname || !fullname.trim()) {
        res.status(400).json({ message: 'Vui lòng nhập họ và tên sinh viên' });
        return;
      }
      if (!university || !university.trim()) {
        res.status(400).json({ message: 'Vui lòng nhập trường đại học đang theo học' });
        return;
      }

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'STUDENT',
          studentProfile: {
            create: {
              fullName: fullname.trim(),
              university: university.trim(),
              completionPercent: 60
            }
          }
        },
        include: { studentProfile: true }
      });

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'Đăng ký tài khoản sinh viên thành công',
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          studentProfile: user.studentProfile
        }
      });
      return;
    }

    if (role === 'EMPLOYER') {
      const { company_name, phone, tax_id } = req.body;

      if (!company_name || !company_name.trim()) {
        res.status(400).json({ message: 'Vui lòng nhập tên công ty / doanh nghiệp' });
        return;
      }
      if (!phone || !validatePhone(phone.trim())) {
        res.status(400).json({ message: 'Số điện thoại người liên hệ phải gồm đúng 10 chữ số' });
        return;
      }
      if (!tax_id || !tax_id.trim()) {
        res.status(400).json({ message: 'Vui lòng nhập mã số thuế doanh nghiệp' });
        return;
      }

      let licenseFileUrl = '';
      if (req.file) {
        licenseFileUrl = `/uploads/licenses/${req.file.filename}`;
      } else {
        res.status(400).json({ message: 'Vui lòng tải lên Giấy phép kinh doanh (Ảnh JPG, PNG hoặc PDF)' });
        return;
      }

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'EMPLOYER',
          employerProfile: {
            create: {
              companyName: company_name.trim(),
              phone: phone.trim(),
              taxId: tax_id.trim(),
              licenseFileUrl,
              verificationStatus: 'PENDING',
              isVerified: false
            }
          }
        },
        include: { employerProfile: true }
      });

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'Đăng ký tài khoản doanh nghiệp thành công. Tài khoản đang chờ Quản trị viên duyệt hồ sơ.',
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          employerProfile: user.employerProfile
        }
      });
      return;
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi đăng ký tài khoản: ' + error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: 'Vui lòng cung cấp email và mật khẩu' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      include: {
        studentProfile: true,
        employerProfile: true
      }
    });

    if (!user) {
      res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        studentProfile: user.studentProfile,
        employerProfile: user.employerProfile
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi đăng nhập: ' + error.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Chưa đăng nhập' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        studentProfile: true,
        employerProfile: true
      }
    });

    if (!user) {
      res.status(404).json({ message: 'Không tìm thấy người dùng' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        studentProfile: user.studentProfile,
        employerProfile: user.employerProfile
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin người dùng: ' + error.message });
  }
};
