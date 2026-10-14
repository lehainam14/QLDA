# Hệ Sinh Thái Việc Làm Sinh Viên – JobStudent (Full-stack React & Node.js)

Dự án website việc làm sinh viên được chuyển đổi hoàn chỉnh từ toàn bộ giao diện HTML/CSS mẫu sang ứng dụng Single Page Application (SPA) với **React (TypeScript + Vite)** ở Frontend và **Node.js (Express + Prisma ORM)** ở Backend.

---

## 1. Công nghệ sử dụng

- **Frontend:** React 18, TypeScript, Vite, React Router v6.
- **Backend:** Node.js, Express, TypeScript, Multer, Bcryptjs, JsonWebToken, Express Rate Limit, Morgan.
- **Cơ sở dữ liệu & ORM:** Prisma ORM.
  - *Môi trường phát triển mặc định:* SQLite (`dev.db`) giúp hệ thống khởi chạy ngay lập tức mà không cần cài đặt thêm dịch vụ máy chủ DB cục bộ.
  - *Môi trường Production:* Dễ dàng chuyển sang PostgreSQL bằng cách đổi `provider = "postgresql"` trong `server/prisma/schema.prisma` và thiết lập `DATABASE_URL` trong file `.env`.
- **Giao diện & Thiết kế:** Tái sử dụng 100% tokens màu, typography (Plus Jakarta Sans), biểu tượng (Material Symbols Outlined), responsive breakpoints và layout cards từ `docs/DESIGN.md` và mã nguồn CSS gốc.

---

## 2. Danh mục màn hình & Tuyến đường React (Routes)

Toàn bộ các file HTML ban đầu đã được chuyển thành các Route React tương ứng, kèm theo điều hướng tương thích ngược (Redirect):

### Khu vực công khai & Xác thực:
| Trang gốc | Route React | Mô tả |
| :--- | :--- | :--- |
| `index.html` | `/` | Trang chủ, thanh tìm kiếm đa chiều, bộ lọc động (lương, ca làm, ngành nghề), danh sách thẻ việc làm, phân trang tối đa 10 tin/trang, trạng thái trống "Xóa bộ lọc". |
| `job-detail.html` | `/jobs/:id` | Chi tiết việc làm, thông tin công ty xác thực, cảnh báo an toàn sinh viên, bản đồ Google Maps, modal Ứng tuyển nhanh (`#apply`), modal Báo cáo tin xấu (`#report`). |
| `login.html` | `/login` | Đăng nhập với kiểm tra hợp lệ, hiển thị lỗi màu đỏ dưới từng trường, hỗ trợ tự động chuyển hướng quay lại trang trước đó (`returnPath`). |
| `register.html` | `/register` | Đăng ký theo 2 vai trò: Sinh viên & Nhà tuyển dụng (tải lên Giấy phép kinh doanh JPG/PNG/PDF <= 5MB, kiểm tra SĐT 10 số, mật khẩu chuẩn bảo mật). |

### Khu vực Sinh viên (Role: `STUDENT`):
| Trang gốc | Route React | Mô tả |
| :--- | :--- | :--- |
| `student/profile.html` | `/student/profile` | Xem và cập nhật hồ sơ cá nhân, đo lường độ hoàn thiện hồ sơ (progress bar), đổi avatar, tải lên và xem tệp CV. |
| `student/saved-jobs.html` | `/student/saved-jobs` | Danh sách việc làm đã lưu, hỗ trợ lưu/bỏ lưu tin tức thời thông qua API. |
| `student/applications.html` | `/student/applications` | Theo dõi quá trình ứng tuyển với các trạng thái: *Đã nộp* (`SUBMITTED`), *Đã xem* (`VIEWED`), *Phù hợp* (`SHORTLISTED`), *Từ chối* (`REJECTED`). |

### Khu vực Nhà tuyển dụng (Role: `EMPLOYER`):
| Trang gốc | Route React | Mô tả |
| :--- | :--- | :--- |
| `employer/dashboard.html` | `/employer/dashboard` | Bảng điều khiển tuyển dụng, thống kê số lượng hồ sơ nộp, nhãn trạng thái tin (*Đang hiển thị*, *Chờ duyệt*, *Nháp*, *Từ chối*, *Hết hạn*). |
| `employer/job-create.html` | `/employer/job-create` | Biểu mẫu tạo và chỉnh sửa tin tuyển dụng (kiểm tra tiêu đề <= 100 ký tự, lương số, hạn nộp > ngày hiện tại). Cho phép "Lưu nháp" hoặc "Gửi chờ duyệt". |
| `employer/applicants.html` | `/employer/applicants` | Mini ATS quản lý ứng viên, xem trước trực tiếp file PDF CV trên trình duyệt, chuyển trạng thái tự động sang `VIEWED` khi mở hồ sơ, duyệt "Phù hợp" hoặc "Từ chối", ghi nhận thông báo. |

### Khu vực Quản trị viên (Role: `ADMIN`):
| Trang gốc | Route React | Mô tả |
| :--- | :--- | :--- |
| `admin/employers-review.html` | `/admin/employers` | Duyệt hoặc từ chối tài khoản NTD, đối chiếu mã số thuế và tệp Giấy phép kinh doanh đính kèm. |
| `admin/jobs-review.html` | `/admin/jobs` | Hàng đợi duyệt tin tuyển dụng mới đăng, yêu cầu bắt buộc nhập lý do từ chối nếu không duyệt tin. |
| `admin/categories.html` | `/admin/categories` | Quản lý thêm/xóa danh mục Ngành nghề và Địa điểm làm việc. |
| `admin/reports.html` | `/admin/reports` | Tiếp nhận và xử lý phản ánh tin xấu từ sinh viên, hỗ trợ tính năng "Ẩn tin" vi phạm hoặc "Bỏ qua". |

---

## 3. Danh sách tài khoản thử nghiệm (Seed Accounts)

Các tài khoản dưới đây đã được tạo sẵn trong cơ sở dữ liệu mẫu:

| Vai trò | Email | Mật khẩu | Trạng thái / Ghi chú |
| :--- | :--- | :--- | :--- |
| **Quản trị viên** | `admin@jobstudent.vn` | `Password123` | Toàn quyền quản trị hệ thống |
| **Nhà tuyển dụng** | `highlands@jobstudent.vn` | `Password123` | Highlands Coffee (Đã được Admin duyệt GPKD) |
| **Nhà tuyển dụng** | `giasu@jobstudent.vn` | `Password123` | CLB Gia sư (Đang chờ Admin duyệt GPKD) |
| **Sinh viên** | `sinhvien@jobstudent.vn` | `Password123` | Lê Nguyễn Minh Anh (Đã có hồ sơ & CV mẫu) |

---

## 4. Hướng dẫn cài đặt và khởi chạy

### Bước 1: Khởi tạo Cơ sở dữ liệu và Seed Data
```bash
cd server
npm install
npx prisma generate
npx prisma db push
npm run prisma:seed
```

### Bước 2: Khởi động Backend API
```bash
# Tại thư mục server:
npm run dev
# Server lắng nghe tại: http://localhost:5000
```

### Bước 3: Khởi động Frontend Client
Mở thêm một cửa sổ terminal mới:
```bash
cd client
npm install
npm run dev
# Frontend chạy tại: http://localhost:5173
```

Hoặc sử dụng các lệnh từ thư mục gốc `jobstudent/jobstudent`:
- `npm run db:setup`: Cập nhật schema Prisma và nạp dữ liệu mẫu
- `npm run dev:server`: Chạy backend API
- `npm run dev:client`: Chạy frontend Vite

---

## 5. Tích hợp bên ngoài & Lưu ý cấu hình

1. **Google/Facebook SSO:** Các nút đăng nhập mạng xã hội trên giao diện hiện đóng vai trò trigger giao diện mẫu. Để chạy trên production, cần bổ sung `GOOGLE_CLIENT_ID` và `FACEBOOK_APP_ID`.
2. **Dịch vụ Email:** Hệ thống cung cấp sẵn lớp `NotificationService`. Khi biến môi trường `EMAIL_SERVICE_ENABLED=false`, hệ thống sẽ ghi nhận log thông báo nội bộ một cách minh bạch; khi đặt `true`, hệ thống sẽ kết nối với máy chủ SMTP để gửi thư thực tế.
3. **Bản đồ Google Maps:** Khung bản đồ trong trang chi tiết công việc sử dụng Google Maps Embed iframe động theo địa chỉ công việc của nhà tuyển dụng.
