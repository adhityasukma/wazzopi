import "server-only";
import nodemailer from "nodemailer";
import type { SmtpSettings } from "./settings-types";

/**
 * Membuat nodemailer transporter berdasarkan konfigurasi SMTP toko
 */
export function createSmtpTransporter(smtp: SmtpSettings) {
  const isSecure = smtp.encryption === "ssl" || smtp.port === 465;

  return nodemailer.createTransport({
    host: smtp.host.trim(),
    port: Number(smtp.port) || 587,
    secure: isSecure,
    auth: smtp.authRequired
      ? {
          user: smtp.username.trim(),
          pass: smtp.password,
        }
      : undefined,
    tls: {
      rejectUnauthorized: smtp.encryption !== "none",
    },
    connectionTimeout: 10000, // 10 detik
  });
}

/**
 * Mengirim email menggunakan Custom SMTP
 */
export async function sendSmtpMail(
  smtp: SmtpSettings,
  options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transporter = createSmtpTransporter(smtp);
    const fromAddress = smtp.fromName
      ? `"${smtp.fromName.trim()}" <${smtp.fromEmail.trim()}>`
      : smtp.fromEmail.trim();

    const info = await transporter.sendMail({
      from: fromAddress,
      to: options.to.trim(),
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    console.log(`[SMTP] Sukses mengirim email ke ${options.to}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("[SMTP Error]:", error);
    return { success: false, error: error?.message || "Gagal mengirim email via server SMTP" };
  }
}

/**
 * Menguji koneksi SMTP dan mengirim email tes verifikasi
 */
export async function sendSmtpTestEmail(
  smtp: SmtpSettings,
  targetEmail: string
): Promise<{ success: boolean; message: string }> {
  try {
    const transporter = createSmtpTransporter(smtp);

    // 1. Verifikasi koneksi handshake dan autentikasi
    await transporter.verify();

    // 2. Kirim email uji coba
    const fromAddress = smtp.fromName
      ? `"${smtp.fromName.trim()}" <${smtp.fromEmail.trim()}>`
      : smtp.fromEmail.trim();

    const nowStr = new Date().toLocaleString("id-ID", {
      dateStyle: "full",
      timeStyle: "medium",
    });

    const info = await transporter.sendMail({
      from: fromAddress,
      to: targetEmail.trim(),
      subject: `Tes Koneksi SMTP Berhasil — Wazzopi Coffee`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e8dbd0; rounded: 12px; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #2b1810; margin: 0; font-size: 24px;">Wazzopi Coffee</h1>
            <p style="color: #7d5a44; font-size: 13px; margin: 4px 0 0 0;">Pengujian Mail Server (SMTP)</p>
          </div>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <p style="color: #166534; font-weight: bold; margin: 0 0 4px 0; font-size: 16px;">Koneksi SMTP Berhasil!</p>
            <p style="color: #15803d; font-size: 13px; margin: 0;">Server SMTP toko online Wazzopi Anda telah terhubung dan siap digunakan untuk mengirim email pesanan secara otomatis ke pelanggan.</p>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #43281c;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; width: 140px;">SMTP Host</td>
              <td style="padding: 6px 0;">: ${smtp.host}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Port</td>
              <td style="padding: 6px 0;">: ${smtp.port} (${smtp.encryption.toUpperCase()})</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Pengirim</td>
              <td style="padding: 6px 0;">: ${fromAddress}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Penerima Tes</td>
              <td style="padding: 6px 0;">: ${targetEmail}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Waktu Pengujian</td>
              <td style="padding: 6px 0;">: ${nowStr}</td>
            </tr>
          </table>
          <hr style="border: none; border-top: 1px solid #e8dbd0; margin: 20px 0;" />
          <p style="color: #a89f91; font-size: 11px; margin: 0; text-align: center;">Email tes otomatis dari panel admin toko online Wazzopi.</p>
        </div>
      `,
    });

    return {
      success: true,
      message: `Koneksi SMTP Terverifikasi! Email tes berhasil dikirim ke ${targetEmail} (ID: ${info.messageId})`,
    };
  } catch (error: any) {
    console.error("[sendSmtpTestEmail Error]:", error);
    return {
      success: false,
      message: error?.message || "Gagal menghubungkan ke server SMTP. Periksa host, port, username, atau password Anda.",
    };
  }
}
