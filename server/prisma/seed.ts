import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Starting database seeding with hierarchical locations & 20 jobs...');

  // Clean existing data in reverse dependency order
  await prisma.jobReport.deleteMany();
  await prisma.savedJob.deleteMany();
  await prisma.applicationStatusHistory.deleteMany();
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.category.deleteMany();
  await prisma.location.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.employerProfile.deleteMany();
  await prisma.user.deleteMany();

  const defaultPassword = await bcrypt.hash('Password123', 10);

  // 1. Categories
  const catFB = await prisma.category.create({ data: { name: 'F&B' } });
  const catGiasu = await prisma.category.create({ data: { name: 'Gia sư' } });
  const catKho = await prisma.category.create({ data: { name: 'Kho vận' } });
  const catBanle = await prisma.category.create({ data: { name: 'Bán lẻ' } });
  const catVP = await prisma.category.create({ data: { name: 'Văn phòng' } });

  // 2. Hierarchical Locations: Cities and Districts
  // City 1: Hà Nội
  const cityHN = await prisma.location.create({
    data: { name: 'Hà Nội', type: 'CITY' }
  });

  const distCauGiay = await prisma.location.create({
    data: { name: 'Cầu Giấy', type: 'DISTRICT', parentId: cityHN.id }
  });
  const distDongDa = await prisma.location.create({
    data: { name: 'Đống Đa', type: 'DISTRICT', parentId: cityHN.id }
  });
  const distBaDinh = await prisma.location.create({
    data: { name: 'Ba Đình', type: 'DISTRICT', parentId: cityHN.id }
  });
  const distHaiBaTrung = await prisma.location.create({
    data: { name: 'Hai Bà Trưng', type: 'DISTRICT', parentId: cityHN.id }
  });
  const distThanhXuan = await prisma.location.create({
    data: { name: 'Thanh Xuân', type: 'DISTRICT', parentId: cityHN.id }
  });
  const distHoangMai = await prisma.location.create({
    data: { name: 'Hoàng Mai', type: 'DISTRICT', parentId: cityHN.id }
  });
  const distHaDong = await prisma.location.create({
    data: { name: 'Hà Đông', type: 'DISTRICT', parentId: cityHN.id }
  });
  const distNamTuLiem = await prisma.location.create({
    data: { name: 'Nam Từ Liêm', type: 'DISTRICT', parentId: cityHN.id }
  });
  const distBacTuLiem = await prisma.location.create({
    data: { name: 'Bắc Từ Liêm', type: 'DISTRICT', parentId: cityHN.id }
  });
  const distLongBien = await prisma.location.create({
    data: { name: 'Long Biên', type: 'DISTRICT', parentId: cityHN.id }
  });

  // City 2: TP. Hồ Chí Minh
  const cityHCM = await prisma.location.create({
    data: { name: 'TP. Hồ Chí Minh', type: 'CITY' }
  });

  const distQ1 = await prisma.location.create({
    data: { name: 'Quận 1', type: 'DISTRICT', parentId: cityHCM.id }
  });
  const distQ3 = await prisma.location.create({
    data: { name: 'Quận 3', type: 'DISTRICT', parentId: cityHCM.id }
  });
  const distQ10 = await prisma.location.create({
    data: { name: 'Quận 10', type: 'DISTRICT', parentId: cityHCM.id }
  });
  const distThuDuc = await prisma.location.create({
    data: { name: 'TP. Thủ Đức', type: 'DISTRICT', parentId: cityHCM.id }
  });
  const distBinhThanh = await prisma.location.create({
    data: { name: 'Bình Thạnh', type: 'DISTRICT', parentId: cityHCM.id }
  });

  // City 3: Đà Nẵng
  const cityDN = await prisma.location.create({
    data: { name: 'Đà Nẵng', type: 'CITY' }
  });

  const distHaiChau = await prisma.location.create({
    data: { name: 'Hải Châu', type: 'DISTRICT', parentId: cityDN.id }
  });
  const distSonTra = await prisma.location.create({
    data: { name: 'Sơn Trà', type: 'DISTRICT', parentId: cityDN.id }
  });

  // 3. Admin Account
  await prisma.user.create({
    data: {
      email: 'admin@jobstudent.vn',
      password: defaultPassword,
      role: 'ADMIN'
    }
  });

  // 4. Employers
  const empUser1 = await prisma.user.create({
    data: {
      email: 'highlands@jobstudent.vn',
      password: defaultPassword,
      role: 'EMPLOYER',
      employerProfile: {
        create: {
          companyName: 'Highlands Coffee JSC',
          phone: '0901234567',
          taxId: '0302829283',
          licenseFileUrl: '/uploads/licenses/sample-highlands-license.pdf',
          isVerified: true,
          verificationStatus: 'VERIFIED'
        }
      }
    },
    include: { employerProfile: true }
  });

  const empUser2 = await prisma.user.create({
    data: {
      email: 'giasu@jobstudent.vn',
      password: defaultPassword,
      role: 'EMPLOYER',
      employerProfile: {
        create: {
          companyName: 'CLB Gia sư Sư phạm',
          phone: '0912345678',
          taxId: '0109988776',
          licenseFileUrl: '/uploads/licenses/sample-giasu-license.pdf',
          isVerified: false,
          verificationStatus: 'PENDING'
        }
      }
    },
    include: { employerProfile: true }
  });

  const empUserHN = await prisma.user.create({
    data: {
      email: 'hanoibook@jobstudent.vn',
      password: defaultPassword,
      role: 'EMPLOYER',
      employerProfile: {
        create: {
          companyName: 'Hà Nội Book & Coffee',
          phone: '0934567890',
          taxId: '0108877665',
          licenseFileUrl: '/uploads/licenses/sample-hnb-license.pdf',
          isVerified: true,
          verificationStatus: 'VERIFIED'
        }
      }
    },
    include: { employerProfile: true }
  });

  // 5. Students
  const stuUser1 = await prisma.user.create({
    data: {
      email: 'sinhvien@jobstudent.vn',
      password: defaultPassword,
      role: 'STUDENT',
      studentProfile: {
        create: {
          fullName: 'Lê Nguyễn Minh Anh',
          birthday: '2003-08-15',
          university: 'ĐH Quốc Gia Hà Nội',
          skills: 'Pha chế cà phê, POS, Giao tiếp khách hàng, Tiếng Anh',
          experience: '6 tháng làm phục vụ tại quán trà sữa, có kỹ năng kiểm ca và xử lý order trên POS.',
          completionPercent: 85,
          cvUrl: '/uploads/resumes/sample-cv-minhanh.pdf'
        }
      }
    },
    include: { studentProfile: true }
  });

  const stuUser2 = await prisma.user.create({
    data: {
      email: 'sv01@student.edu.vn',
      password: defaultPassword,
      role: 'STUDENT',
      studentProfile: {
        create: {
          fullName: 'Trần Quốc Bảo',
          birthday: '2004-02-20',
          university: 'ĐH Bách Khoa Hà Nội',
          skills: 'Kỹ thuật máy tính, Bán hàng, Làm việc nhóm',
          experience: 'Từng tham gia hỗ trợ sự kiện tuyển dụng sinh viên trường.',
          completionPercent: 75
        }
      }
    },
    include: { studentProfile: true }
  });

  // 6. 20 Sample Jobs (16 in Hà Nội, 4 in other cities)
  const empId = empUserHN.employerProfile!.id;
  const deadlineDefault = new Date('2026-12-31T23:59:59');

  const jobsData = [
    // 1. Hà Nội - Cầu Giấy
    {
      title: 'Nhân viên Phục vụ & Pha chế Part-time',
      companyName: 'Hà Nội Book & Coffee',
      categoryId: catFB.id,
      provinceId: cityHN.id,
      districtId: distCauGiay.id,
      address: 'Số 18 Trần Thái Tông, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
      wageMin: 28000,
      wageMax: 35000,
      wageType: 'HOURLY',
      jobType: 'Ca gãy',
      shiftTypes: 'Ca gãy, Ca tối',
      description: 'Đón tiếp khách tại quầy, order đồ uống trên máy POS. Pha chế cà phê phin, trà hoa cúc và sinh tố theo công thức quán. Dọn dẹp bàn đọc sách và bảo quản sách trên kệ.',
      requirements: 'Sinh viên các trường ĐH Quốc Gia, Sư Phạm, Báo Chí gần khu vực Cầu Giấy. Chăm chỉ, đúng giờ, yêu thích không gian sách.',
      benefits: 'Nước uống miễn phí mỗi ca làm. Thưởng lễ tết và hỗ trợ 100% tiền gửi xe.'
    },
    // 2. Hà Nội - Cầu Giấy
    {
      title: 'Gia sư Tiếng Anh Giao tiếp Sinh viên',
      companyName: 'Học Viện Ngoại Ngữ Trẻ Cầu Giấy',
      categoryId: catGiasu.id,
      provinceId: cityHN.id,
      districtId: distCauGiay.id,
      address: 'Số 122 Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
      wageMin: 120000,
      wageMax: 160000,
      wageType: 'HOURLY',
      jobType: 'Part-time',
      shiftTypes: 'Ca tối, Cuối tuần',
      description: 'Trợ giảng và hướng dẫn phát âm tiếng Anh cơ bản cho học sinh cấp 2 và sinh viên năm nhất. Luyện phản xạ giao tiếp theo giáo trình chuẩn hóa.',
      requirements: 'Sinh viên có IELTS 6.5+ hoặc chứng chỉ tương đương. Nhiệt tình, thân thiện, giọng phát âm chuẩn.',
      benefits: 'Được tham gia các buổi tập huấn phương pháp sư phạm miễn phí. Môi trường trẻ trung, năng động.'
    },
    // 3. Hà Nội - Đống Đa
    {
      title: 'Thu ngân & Bán hàng Siêu thị Mini',
      companyName: 'Siêu Thị Tiện Ích Đống Đa',
      categoryId: catBanle.id,
      provinceId: cityHN.id,
      districtId: distDongDa.id,
      address: 'Số 45 Chùa Bộc, Quang Trung, Đống Đa, Hà Nội',
      wageMin: 30000,
      wageMax: 36000,
      wageType: 'HOURLY',
      jobType: 'Part-time',
      shiftTypes: 'Ca sáng, Ca gãy',
      description: 'Tính tiền, in hóa đơn và thanh toán cho khách hàng bằng máy POS. Kiểm kê và sắp xếp hàng hóa bánh kẹo, đồ hộp lên kệ gọn gàng.',
      requirements: 'Nhanh nhẹn, trung thực, cẩn thận với tiền bạc. Ưu tiên sinh viên các trường ĐH Thủy Lợi, Học viện Ngân Hàng.',
      benefits: 'Chiết khấu mua hàng tại siêu thị 15%. Thưởng chuyên cần hàng tháng.'
    },
    // 4. Hà Nội - Đống Đa
    {
      title: 'Gia sư Toán & Khoa học Tự nhiên Lớp 7-9',
      companyName: 'CLB Gia Sư Khởi Tri Đống Đa',
      categoryId: catGiasu.id,
      provinceId: cityHN.id,
      districtId: distDongDa.id,
      address: 'Khu vực Xã Đàn - Kim Liên, Đống Đa, Hà Nội',
      wageMin: 130000,
      wageMax: 170000,
      wageType: 'HOURLY',
      jobType: 'Part-time',
      shiftTypes: 'Cuối tuần, Ca tối',
      description: 'Dạy kèm môn Toán và KHTN cho học sinh THCS tại nhà học sinh. Giúp học sinh củng cố kiến thức mất gốc và luyện giải đề thi học kỳ.',
      requirements: 'Sinh viên năm 2 đến năm 4 có điểm thi ĐH môn Toán từ 8.5 trở lên. Có trách nhiệm cao, kiên nhẫn.',
      benefits: 'Nhận lương theo tuần. Phụ cấp xăng xe nếu di chuyển trên 4km.'
    },
    // 5. Hà Nội - Ba Đình
    {
      title: 'Nhân viên Lễ tân & Trực điện thoại Bán thời gian',
      companyName: 'Văn Phòng Dịch Vụ Xanh Ba Đình',
      categoryId: catVP.id,
      provinceId: cityHN.id,
      districtId: distBaDinh.id,
      address: 'Số 82 Kim Mã, Kim Mã, Ba Đình, Hà Nội',
      wageMin: 7000000,
      wageMax: 9000000,
      wageType: 'MONTHLY',
      jobType: 'Part-time',
      shiftTypes: 'Ca sáng',
      description: 'Đón tiếp khách đến giao dịch tại văn phòng. Tiếp nhận cuộc gọi điện thoại, thư từ bưu phẩm chuyển phát nhanh và ghi chép sổ nhật ký.',
      requirements: 'Ngoại hình sáng, giọng nói dễ nghe, không nói ngọng. Thành thạo tin học văn phòng Word, Excel cơ bản.',
      benefits: 'Môi trường văn phòng máy lạnh chuyên nghiệp. Được đóng dấu xác nhận thực tập tốt nghiệp.'
    },
    // 6. Hà Nội - Ba Đình
    {
      title: 'Phục vụ Cà phê Không gian Cổ',
      companyName: 'Trà Sen & Cà Phê Cổ Ba Đình',
      categoryId: catFB.id,
      provinceId: cityHN.id,
      districtId: distBaDinh.id,
      address: 'Số 15 Phan Đình Phùng, Quán Thánh, Ba Đình, Hà Nội',
      wageMin: 32000,
      wageMax: 40000,
      wageType: 'HOURLY',
      jobType: 'Ca gãy',
      shiftTypes: 'Ca gãy, Cuối tuần',
      description: 'Bưng bê đồ uống, châm nước trà cho khách. Dọn dẹp bàn ghế sạch sẽ và hỗ trợ quầy thu ngân khi khách thanh toán.',
      requirements: 'Lịch sự, hòa nhã, có tinh thần phục vụ chu đáo. Có thể làm ca sáng hoặc ca chiều linh hoạt.',
      benefits: 'Tiền tip nhận trực tiếp mỗi ngày. Đồng phục quán cấp miễn phí.'
    },
    // 7. Hà Nội - Hai Bà Trưng
    {
      title: 'Nhân viên Soạn đơn & Đóng gói Hàng Shop Online',
      companyName: 'Cửa Hàng Quà Tặng & Phụ Kiện GenZ',
      categoryId: catBanle.id,
      provinceId: cityHN.id,
      districtId: distHaiBaTrung.id,
      address: 'Số 54 Lê Thanh Nghị, Bách Khoa, Hai Bà Trưng, Hà Nội',
      wageMin: 30000,
      wageMax: 35000,
      wageType: 'HOURLY',
      jobType: 'Part-time',
      shiftTypes: 'Ca sáng, Ca chiều',
      description: 'In phiếu đơn hàng từ sàn thương mại điện tử. Kiểm tra sản phẩm phụ kiện, bọc chống sốc và dán mã vận đơn giao cho shiper.',
      requirements: 'Cẩn thận, tỉ mỉ, nhanh nhẹn. Ưu tiên sinh viên Bách Khoa, Xây Dựng, Kinh Tế Quốc Dân.',
      benefits: 'Thưởng theo số lượng đơn hoàn thành vượt chỉ tiêu. Hỗ trợ đồ ăn nhẹ giữa giờ.'
    },
    // 8. Hà Nội - Hai Bà Trưng
    {
      title: 'Trợ giảng Lớp Kỹ năng Sinh viên Bách Khoa',
      companyName: 'Trung Tâm Phát Triển Tuổi Trẻ',
      categoryId: catGiasu.id,
      provinceId: cityHN.id,
      districtId: distHaiBaTrung.id,
      address: 'Số 1 Đại Cồ Việt, Bách Khoa, Hai Bà Trưng, Hà Nội',
      wageMin: 100000,
      wageMax: 140000,
      wageType: 'HOURLY',
      jobType: 'Part-time',
      shiftTypes: 'Cuối tuần, Ca tối',
      description: 'Hỗ trợ giảng viên chính chuẩn bị slide, tài liệu học tập và thiết bị trình chiếu. Điểm danh và giải đáp thắc mắc bài tập của học viên.',
      requirements: 'Sinh viên năm 3-4 chuyên ngành CNTT, Điện tử hoặc Sư phạm. Kỹ năng giao tiếp tự tin trước đám đông.',
      benefits: 'Học bổng các khóa đào tạo nâng cao miễn phí. Cơ hội mở rộng mối quan hệ với các doanh nghiệp công nghệ.'
    },
    // 9. Hà Nội - Thanh Xuân
    {
      title: 'Phụ bếp & Sơ chế Thực phẩm Quán Ăn Ca Trưa',
      companyName: 'Cơm Ngon Sinh Viên Thanh Xuân',
      categoryId: catFB.id,
      provinceId: cityHN.id,
      districtId: distThanhXuan.id,
      address: 'Số 68 Nguyễn Trãi, Thượng Đình, Thanh Xuân, Hà Nội',
      wageMin: 30000,
      wageMax: 36000,
      wageType: 'HOURLY',
      jobType: 'Part-time',
      shiftTypes: 'Ca sáng, Ca gãy',
      description: 'Rửa và thái rau củ, sơ chế thịt cá theo hướng dẫn của đầu bếp chính. Vệ sinh dụng cụ nấu ăn và bưng đồ lên quầy tự chọn.',
      requirements: 'Sạch sẽ, gọn gàng, có sức khỏe tốt. Không yêu cầu kinh nghiệm, được đào tạo chi tiết.',
      benefits: 'Ăn trưa miễn phí tại quán. Trả lương đúng hẹn ngày mùng 5 hàng tháng.'
    },
    // 10. Hà Nội - Thanh Xuân
    {
      title: 'Nhân viên Nhập liệu & Hỗ trợ Văn phòng',
      companyName: 'Công ty Truyền Thông Số Thanh Xuân',
      categoryId: catVP.id,
      provinceId: cityHN.id,
      districtId: distThanhXuan.id,
      address: 'Số 120 Khuất Duy Tiến, Nhân Chính, Thanh Xuân, Hà Nội',
      wageMin: 35000,
      wageMax: 45000,
      wageType: 'HOURLY',
      jobType: 'Part-time',
      shiftTypes: 'Ca sáng, Ca chiều',
      description: 'Nhập thông tin sản phẩm và dữ liệu khảo sát khách hàng vào hệ thống CRM nội bộ. Kiểm tra tính trùng lặp và làm sạch tệp dữ liệu.',
      requirements: 'Gõ phím nhanh (trên 50 từ/phút), biết dùng Excel cơ bản (VLOOKUP, filter). Chăm chỉ, tỉ mỉ.',
      benefits: 'Làm việc trong môi trường văn phòng trẻ trung, có trà bánh miễn phí.'
    },
    // 11. Hà Nội - Hoàng Mai
    {
      title: 'Phụ kho & Phân loại Bưu kiện Ca đêm',
      companyName: 'Kho Logistics Tốc Hành Hoàng Mai',
      categoryId: catKho.id,
      provinceId: cityHN.id,
      districtId: distHoangMai.id,
      address: 'Khu công nghiệp Định Công, Hoàng Mai, Hà Nội',
      wageMin: 38000,
      wageMax: 48000,
      wageType: 'HOURLY',
      jobType: 'Part-time',
      shiftTypes: 'Ca tối',
      description: 'Dỡ hàng từ xe tải xuống băng chuyền. Sử dụng máy quét mã vạch phân loại bưu kiện theo từng quận/huyện giao hàng.',
      requirements: 'Nam sinh viên sức khỏe tốt, nhanh nhẹn, chịu khó. Làm được ca tối từ 18h - 22h hoặc 22h - 04h.',
      benefits: 'Phụ cấp ăn đêm 30k/ca. Lương trả theo tuần qua tài khoản ngân hàng.'
    },
    // 12. Hà Nội - Hoàng Mai
    {
      title: 'Nhân viên Bán hàng Đồ gia dụng Mini',
      companyName: 'Cửa Hàng Tiện Ích Hoàng Mai',
      categoryId: catBanle.id,
      provinceId: cityHN.id,
      districtId: distHoangMai.id,
      address: 'Số 210 Trương Định, Tương Mai, Hoàng Mai, Hà Nội',
      wageMin: 28000,
      wageMax: 34000,
      wageType: 'HOURLY',
      jobType: 'Part-time',
      shiftTypes: 'Ca sáng, Ca chiều',
      description: 'Tư vấn đồ dùng học tập, đồ gia dụng nhỏ cho khách. Dọn dẹp quầy kệ, kiểm kê hàng tồn cuối ca.',
      requirements: 'Giao tiếp vui vẻ, niềm nở, trung thực. Có thể làm tối thiểu 4 buổi mỗi tuần.',
      benefits: 'Thưởng doanh số tháng. Được xoay ca theo lịch thi cử của trường.'
    },
    // 13. Hà Nội - Hà Đông
    {
      title: 'Thu ngân & Kiểm ca Cửa hàng 247',
      companyName: 'Chuỗi Cửa Hàng Tiện Lợi 247 Hà Đông',
      categoryId: catBanle.id,
      provinceId: cityHN.id,
      districtId: distHaDong.id,
      address: 'Số 35 Quang Trung, Quang Trung, Hà Đông, Hà Nội',
      wageMin: 30000,
      wageMax: 38000,
      wageType: 'HOURLY',
      jobType: 'Part-time',
      shiftTypes: 'Ca tối, Ca gãy',
      description: 'Phục vụ khách hàng tại quầy thu ngân. Hâm nóng đồ ăn nhanh, pha chế nước ngọt ly và bàn giao tiền mặt khi hết ca.',
      requirements: 'Sinh viên các trường Học viện Bưu Chính, Kiến Trúc, ĐH Hà Nội lân cận. Có trách nhiệm cao.',
      benefits: 'Được đóng BHTN theo quy định. Cơ hội thăng tiến lên Trưởng ca sau 3 tháng.'
    },
    // 14. Hà Nội - Hà Đông
    {
      title: 'Gia sư Luyện thi Tuyển sinh Môn Toán',
      companyName: 'Nhóm Gia Sư Sư Phạm Hà Đông',
      categoryId: catGiasu.id,
      provinceId: cityHN.id,
      districtId: distHaDong.id,
      address: 'Khu đô thị Văn Quán, Hà Đông, Hà Nội',
      wageMin: 150000,
      wageMax: 200000,
      wageType: 'HOURLY',
      jobType: 'Part-time',
      shiftTypes: 'Cuối tuần, Ca tối',
      description: 'Kèm cặp và chữa đề thi vào lớp 10 cho học sinh lớp 9. Hướng dẫn các phương pháp giải toán hình học và bất đẳng thức.',
      requirements: 'Sinh viên ĐH Sư Phạm hoặc ĐH Tự Nhiên. Nắm vững cấu trúc đề thi vào 10 tại Hà Nội.',
      benefits: 'Thu nhập hấp dẫn theo giờ dạy. Phụ huynh thưởng thêm khi học sinh tiến bộ.'
    },
    // 15. Hà Nội - Nam Từ Liêm
    {
      title: 'Nhân viên Điều phối Đơn hàng E-commerce',
      companyName: 'Trung Tâm Kho Vận Mỹ Đình',
      categoryId: catKho.id,
      provinceId: cityHN.id,
      districtId: distNamTuLiem.id,
      address: 'Đường Lê Đức Thọ, Mỹ Đình 2, Nam Từ Liêm, Hà Nội',
      wageMin: 35000,
      wageMax: 42000,
      wageType: 'HOURLY',
      jobType: 'Part-time',
      shiftTypes: 'Ca gãy, Ca tối',
      description: 'Theo dõi tiến độ đơn hàng trên phần mềm quản lý kho. Phối hợp với đội ngũ giao hàng để xử lý các kiện hàng giao trễ hoặc đổi địa chỉ.',
      requirements: 'Biết sử dụng máy tính, kỹ năng xử lý tình huống tốt. Có thể làm ca xoay linh hoạt.',
      benefits: 'Thưởng năng suất theo số lượng đơn giao thành công. Đầy đủ trang thiết bị bảo hộ.'
    },
    // 16. Hà Nội - Bắc Từ Liêm
    {
      title: 'Nhân viên Pha chế Trà sữa Trẻ',
      companyName: 'Trà Sữa Sinh Viên Mỏ - Địa Chất',
      categoryId: catFB.id,
      provinceId: cityHN.id,
      districtId: distBacTuLiem.id,
      address: 'Phố Cổ Nhuế, Cổ Nhuế 2, Bắc Từ Liêm, Hà Nội',
      wageMin: 28000,
      wageMax: 35000,
      wageType: 'HOURLY',
      jobType: 'Ca gãy',
      shiftTypes: 'Ca gãy, Ca tối',
      description: 'Nấu trà, trân châu và pha chế trà sữa theo định lượng chuẩn. Giữ gìn quầy pha chế và bàn ghế khách ngồi luôn tinh tươm.',
      requirements: 'Sinh viên các trường Mỏ Địa Chất, Học Viện Tài Chính lân cận. Vui vẻ, hòa đồng, trung thực.',
      benefits: 'Thưởng doanh số hàng ngày theo ca. Trả lương đều đặn vào ngày 10 hàng tháng.'
    },
    // 17. Hà Nội - Long Biên
    {
      title: 'Nhân viên Trưng bày & Sắp xếp Kệ hàng',
      companyName: 'Siêu Thị Hàng Tiêu Dùng Long Biên',
      categoryId: catBanle.id,
      provinceId: cityHN.id,
      districtId: distLongBien.id,
      address: 'Số 27 Cổ Linh, Long Biên, Hà Nội',
      wageMin: 32000,
      wageMax: 38000,
      wageType: 'HOURLY',
      jobType: 'Part-time',
      shiftTypes: 'Ca sáng, Ca chiều',
      description: 'Kiểm tra hạn sử dụng sản phẩm trên kệ, xếp hàng hóa ngay ngắn, gắn bảng giá khuyến mãi mới vào đầu tuần.',
      requirements: 'Cẩn thận, nhanh nhẹn, có sức khỏe tốt. Sẵn sàng hỗ trợ khách hàng tìm kiếm vị trí mặt hàng.',
      benefits: 'Hỗ trợ ăn ca tại căn tin siêu thị. Môi trường làm việc an toàn, minh bạch.'
    },
    // 18. TP. Hồ Chí Minh - Quận 1
    {
      title: 'Barista & Phục vụ Ca gãy Cà phê',
      companyName: 'Sài Gòn Roastery Cafe',
      categoryId: catFB.id,
      provinceId: cityHCM.id,
      districtId: distQ1.id,
      address: '120 Hai Bà Trưng, Phường Bến Nghé, Quận 1, TP.HCM',
      wageMin: 32000,
      wageMax: 40000,
      wageType: 'HOURLY',
      jobType: 'Ca gãy',
      shiftTypes: 'Ca gãy, Cuối tuần',
      description: 'Pha chế espresso, pour over và trà hoa quả. Giao lưu, chăm sóc khách hàng và giữ gìn không gian quán sạch đẹp.',
      requirements: 'Sinh viên yêu thích cà phê, nhanh nhẹn, giao tiếp tiếng Anh cơ bản là một lợi thế.',
      benefits: 'Được đào tạo kỹ năng Barista chuyên sâu. Hỗ trợ 100% tiền gửi xe và thưởng chuyên cần.'
    },
    // 19. TP. Hồ Chí Minh - TP. Thủ Đức
    {
      title: 'Phụ kho & Giao nhận Hàng nhanh Công nghệ',
      companyName: 'Kho Hàng Công Nghệ Thủ Đức',
      categoryId: catKho.id,
      provinceId: cityHCM.id,
      districtId: distThuDuc.id,
      address: 'Khu Công Nghệ Cao, Tăng Nhơn Phú B, TP. Thủ Đức, TP.HCM',
      wageMin: 35000,
      wageMax: 45000,
      wageType: 'HOURLY',
      jobType: 'Part-time',
      shiftTypes: 'Ca tối',
      description: 'Nhận kiện hàng linh kiện điện tử, đóng gói hộp carton và dán mã QR tracking cho shiper vận chuyển.',
      requirements: 'Sinh viên các trường ĐHQG TP.HCM, ĐH Sư Phạm Kỹ Thuật. Cẩn thận với đồ điện tử.',
      benefits: 'Lương chuyển khoản đúng hạn. Phụ cấp nước uống và đồ ăn nhẹ.'
    },
    // 20. Đà Nẵng - Hải Châu
    {
      title: 'Nhân viên Phục vụ Quán Trà Sông Hàn',
      companyName: 'Trà Đạo & Cà Phê Ven Sông Đà Nẵng',
      categoryId: catFB.id,
      provinceId: cityDN.id,
      districtId: distHaiChau.id,
      address: 'Đường Bạch Đằng, Hải Châu 1, Hải Châu, Đà Nẵng',
      wageMin: 28000,
      wageMax: 35000,
      wageType: 'HOURLY',
      jobType: 'Part-time',
      shiftTypes: 'Ca tối, Cuối tuần',
      description: 'Chào đón khách du lịch và người dân địa phương. Order nước uống, bưng trà và dọn dẹp bàn sau khi khách về.',
      requirements: 'Thân thiện, niềm nở, nhanh nhẹn. Ưu tiên sinh viên các trường ĐH Đà Nẵng.',
      benefits: 'Tiền tip chia đều cho ca làm. Ngắm cảnh sông Hàn về đêm trong giờ nghỉ ngơi.'
    }
  ];

  for (const j of jobsData) {
    const createdJob = await prisma.job.create({
      data: {
        employerId: empId,
        title: j.title,
        categoryId: j.categoryId,
        provinceId: j.provinceId,
        districtId: j.districtId,
        address: j.address,
        wageMin: j.wageMin,
        wageMax: j.wageMax,
        wageType: j.wageType,
        jobType: j.jobType,
        shiftTypes: j.shiftTypes,
        deadline: deadlineDefault,
        description: j.description,
        requirements: j.requirements,
        benefits: j.benefits,
        status: 'PUBLISHED'
      }
    });

    // Sample application and save for first job
    if (j.districtId === distCauGiay.id && j.title.includes('Phục vụ & Pha chế')) {
      await prisma.application.create({
        data: {
          jobId: createdJob.id,
          studentId: stuUser1.studentProfile!.id,
          resumeType: 'PROFILE',
          resumeFileUrl: stuUser1.studentProfile!.cvUrl,
          coverLetter: 'Em là sinh viên năm 3 gần Cầu Giấy, muốn ứng tuyển ca gãy linh hoạt.',
          status: 'VIEWED',
          statusHistories: {
            create: { status: 'VIEWED', note: 'Nhà tuyển dụng đã xem hồ sơ' }
          }
        }
      });

      await prisma.savedJob.create({
        data: {
          studentId: stuUser1.studentProfile!.id,
          jobId: createdJob.id
        }
      });
    }
  }

  console.log('[Seed] Database seeded successfully with 20 sample jobs (16 in Hanoi)!');
}

main()
  .catch((e) => {
    console.error('[Seed] Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
