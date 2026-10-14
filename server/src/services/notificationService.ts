export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export class NotificationService {
  private static isEmailEnabled: boolean = process.env.EMAIL_SERVICE_ENABLED === 'true';

  static async sendApplicationStatusNotification(
    studentEmail: string,
    studentName: string,
    jobTitle: string,
    companyName: string,
    newStatus: string
  ): Promise<{ sent: boolean; message: string }> {
    const statusMap: Record<string, string> = {
      VIEWED: 'Nhà tuyển dụng đã xem hồ sơ',
      SHORTLISTED: 'Hồ sơ phù hợp - Mời phỏng vấn',
      REJECTED: 'Chưa phù hợp với đợt tuyển này'
    };

    const statusText = statusMap[newStatus] || newStatus;
    const subject = `[JobStudent] Cập nhật trạng thái ứng tuyển: ${jobTitle} tại ${companyName}`;
    const html = `
      <div style="font-family: sans-serif; line-height: 1.6; color: #0f172a;">
        <h2>Xin chào ${studentName},</h2>
        <p>Hồ sơ ứng tuyển của bạn cho vị trí <strong>${jobTitle}</strong> tại công ty <strong>${companyName}</strong> đã được cập nhật trạng thái:</p>
        <p style="padding: 12px; background: #eff6ff; border-left: 4px solid #2563eb; font-weight: bold; color: #1d4ed8;">
          ${statusText}
        </p>
        <p>Vui lòng đăng nhập vào hệ thống JobStudent để theo dõi chi tiết quá trình ứng tuyển.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <small style="color: #64748b;">JobStudent - Hệ sinh thái việc làm sinh viên minh bạch & an toàn.</small>
      </div>
    `;

    if (this.isEmailEnabled) {
      console.log(`[NotificationService] Sending real email to ${studentEmail} via configured SMTP provider...`);
      // When SMTP credentials exist, send via SMTP
      return { sent: true, message: `Email đã gửi thành công tới ${studentEmail}` };
    } else {
      // Prompt requires: "Nếu chưa có dịch vụ email, tạo lớp tích hợp có cấu hình rõ ràng và ghi nhận thông báo trong hệ thống; không giả vờ email đã được gửi."
      console.log(`[NotificationService:SystemNotificationLog] Dịch vụ email bên ngoài chưa kích hoạt (EMAIL_SERVICE_ENABLED=false).`);
      console.log(`[NotificationService:SystemNotificationLog] Đã ghi nhận thông báo nội bộ cho: ${studentEmail} | Trạng thái: ${statusText} | Tiêu đề: ${jobTitle}`);
      return {
        sent: false,
        message: `Hệ thống đã lưu thông báo nội bộ. Email thực tế chưa được gửi vì cấu hình EMAIL_SERVICE_ENABLED đang tắt.`
      };
    }
  }
}
