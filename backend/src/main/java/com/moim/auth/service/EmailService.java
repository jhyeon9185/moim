package com.moim.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
public class EmailService {

  private final JavaMailSender mailSender;

  @Value("${spring.mail.username}")
  private String from;

  @Async
  public void sendVerificationCode(String to, String code) {
    String html = """
        <!DOCTYPE html>
        <html lang="ko">
        <head><meta charset="UTF-8"></head>
        <body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
          <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 16px">
            <tr><td align="center">
              <table width="100%%" style="max-width:480px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
                <tr><td style="background:linear-gradient(135deg,#4A90D9,#5a7fd4);padding:32px;text-align:center">
                  <h1 style="margin:0;color:#fff;font-size:30px;font-weight:800;letter-spacing:-0.5px">MOIM</h1>
                  <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px">소중한 사람들과 특별한 순간들</p>
                </td></tr>
                <tr><td style="padding:40px 32px 32px">
                  <p style="margin:0 0 6px;color:#222;font-size:17px;font-weight:700">안녕하세요! MOIM입니다 👋</p>
                  <p style="margin:0 0 28px;color:#666;font-size:14px;line-height:1.7">
                    회원가입을 위한 이메일 인증 코드입니다.<br>아래 코드를 <strong>5분 이내</strong>에 입력해주세요.
                  </p>
                  <div style="background:#f0f6ff;border:2px dashed #4A90D9;border-radius:12px;padding:28px 16px;text-align:center;margin-bottom:28px">
                    <p style="margin:0 0 8px;color:#88a;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase">인증 코드</p>
                    <p style="margin:0;color:#4A90D9;font-size:42px;font-weight:800;letter-spacing:14px">%s</p>
                  </div>
                  <p style="margin:0 0 6px;color:#999;font-size:12px">⏱ 코드는 <strong>5분간</strong> 유효합니다.</p>
                  <p style="margin:0;color:#bbb;font-size:12px">본인이 요청하지 않은 경우 이 메일을 무시해주세요.</p>
                </td></tr>
                <tr><td style="background:#f9f9f9;padding:18px 32px;border-top:1px solid #f0f0f0;text-align:center">
                  <p style="margin:0;color:#ccc;font-size:11px">© 2025 MOIM · 가족 모임 관리 서비스</p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
        """
        .formatted(code);
    send(to, "[MOIM] 이메일 인증 코드", html);
  }

  @Async
  public void sendPasswordReset(String to, String resetLink) {
    String html = """
        <!DOCTYPE html>
        <html lang="ko">
        <head><meta charset="UTF-8"></head>
        <body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
          <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 16px">
            <tr><td align="center">
              <table width="100%%" style="max-width:480px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
                <tr><td style="background:linear-gradient(135deg,#4A90D9,#5a7fd4);padding:32px;text-align:center">
                  <h1 style="margin:0;color:#fff;font-size:30px;font-weight:800;letter-spacing:-0.5px">MOIM</h1>
                  <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px">소중한 사람들과 특별한 순간들</p>
                </td></tr>
                <tr><td style="padding:40px 32px 32px">
                  <p style="margin:0 0 6px;color:#222;font-size:17px;font-weight:700">비밀번호 재설정 안내</p>
                  <p style="margin:0 0 28px;color:#666;font-size:14px;line-height:1.7">
                    MOIM 계정의 비밀번호 재설정 요청이 접수되었습니다.<br>
                    아래 버튼을 클릭하여 새 비밀번호를 설정해주세요.
                  </p>
                  <div style="text-align:center;margin-bottom:28px">
                    <a href="%s" style="display:inline-block;background:linear-gradient(135deg,#4A90D9,#5a7fd4);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:700">
                      비밀번호 재설정하기
                    </a>
                  </div>
                  <p style="margin:0 0 6px;color:#999;font-size:12px">⏱ 이 링크는 <strong>30분간</strong> 유효합니다.</p>
                  <p style="margin:0;color:#bbb;font-size:12px">본인이 요청하지 않은 경우 이 메일을 무시해주세요.</p>
                </td></tr>
                <tr><td style="background:#f9f9f9;padding:18px 32px;border-top:1px solid #f0f0f0;text-align:center">
                  <p style="margin:0;color:#ccc;font-size:11px">© 2025 MOIM · 가족 모임 관리 서비스</p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
        """
        .formatted(resetLink);
    send(to, "[MOIM] 비밀번호 재설정", html);
  }

  private void send(String to, String subject, String html) {
    try {
      MimeMessage msg = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(msg, false, "UTF-8");
      helper.setFrom("MOIM <" + from + ">");
      helper.setTo(to);
      helper.setSubject(subject);
      helper.setText(html, true);
      mailSender.send(msg);
    } catch (Exception e) {
      throw new RuntimeException("이메일 발송에 실패했습니다.", e);
    }
  }
}
