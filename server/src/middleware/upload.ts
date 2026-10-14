import multer from 'multer';
import path from 'path';
import fs from 'fs';

const UPLOAD_BASE = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOAD_BASE)) {
  fs.mkdirSync(UPLOAD_BASE, { recursive: true });
}

const licenseStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(UPLOAD_BASE, 'licenses');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `license-${uniqueSuffix}${ext}`);
  }
});

const cvStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(UPLOAD_BASE, 'resumes');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `resume-${uniqueSuffix}${ext}`);
  }
});

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(UPLOAD_BASE, 'avatars');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  }
});

export const uploadLicense = multer({
  storage: licenseStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowedExts = ['.jpg', '.jpeg', '.png', '.pdf'];
    const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedExts.includes(ext) && allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận tệp ảnh JPG, PNG hoặc PDF cho Giấy phép kinh doanh (Tối đa 5MB)'));
    }
  }
});

export const uploadResume = multer({
  storage: cvStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowedExts = ['.pdf', '.doc', '.docx'];
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/octet-stream' // sometimes sent by windows browsers for docx
    ];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedExts.includes(ext) && (allowedMimes.includes(file.mimetype) || ext === '.pdf' || ext === '.doc' || ext === '.docx')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận định dạng PDF hoặc Word (.doc, .docx) cho CV (Tối đa 5MB)'));
    }
  }
});

export const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (_req, file, cb) => {
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedExts.includes(ext) && allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận tệp ảnh JPG, PNG, WEBP cho ảnh đại diện (Tối đa 2MB)'));
    }
  }
});
