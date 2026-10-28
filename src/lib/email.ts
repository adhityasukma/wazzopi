import "server-only";
import { getSettings } from "@/lib/settings";
import { sendSmtpMail } from "@/lib/smtp";

export type OrderEmailItem = {
  productName: string;
  variantName?: string | null;
  quantity: number;
  price: number;
  total: number;
};

export type SendOrderEmailParams = {
  customerName: string;
  customerEmail: string;
  orderNo: string;
  items: OrderEmailItem[];
  totalAmount: number;
  shippingAddress: string;
  shippingMethod: string;
  paymentMethod: string;
  newAccount?: {
    email: string;
    tempPassword: string;
  } | null;
  storeName?: string;
  whatsappContact?: string;
};

function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateOrderEmailHtml(params: SendOrderEmailParams): string {
  const {
    customerName,
    customerEmail,
    orderNo,
    items,
    totalAmount,
    shippingAddress,
    shippingMethod,
    paymentMethod,
    newAccount,
    storeName = "Wazzopi",
    whatsappContact = "6281234567890",
  } = params;

  const paymentLabel =
    paymentMethod === "bank_transfer"
      ? "Transfer Bank Manual"
      : paymentMethod === "cod"
      ? "Bayar di Tempat (COD)"
      : "Pembayaran Otomatis (Midtrans)";

  const itemsHtml = items
    .map(
      (it) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #efe3d0; font-size: 14px; color: #2a120c;">
          <strong>${it.productName}</strong>
          ${it.variantName ? `<br><span style="font-size: 12px; color: #8f5a43;">Varian: ${it.variantName}</span>` : ""}
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #efe3d0; font-size: 14px; color: #5a2c1e; text-align: center;">
          ${it.quantity}x
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #efe3d0; font-size: 14px; color: #2a120c; text-align: right; font-weight: 600;">
          ${formatIDR(it.total)}
        </td>
      </tr>
    `
    )
    .join("");

  const newAccountBoxHtml = newAccount
    ? `
      <div style="background-color: #faf2ea; border: 1.5px solid #d39f6f; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <div style="display: flex; align-items: center; margin-bottom: 12px;">
          <h3 style="margin: 0; color: #5a2c1e; font-size: 16px; font-weight: bold;">
            Akses Login Member Area Anda
          </h3>
        </div>
        <p style="margin: 0 0 14px 0; font-size: 13px; color: #6e3a28; line-height: 1.5;">
          Untuk memudahkan Anda memantau status pesanan, nomor resi pengiriman, dan riwayat belanja, kami telah otomatis membuatkan akun Member untuk Anda:
        </p>
        <table style="width: 100%; border-collapse: collapse; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #efe3d0;">
          <tr>
            <td style="padding: 10px 14px; font-size: 13px; color: #8f5a43; width: 35%; border-bottom: 1px solid #f8f1ec;">Email Login</td>
            <td style="padding: 10px 14px; font-size: 13px; color: #2a120c; font-weight: 600; border-bottom: 1px solid #f8f1ec;">${newAccount.email}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; font-size: 13px; color: #8f5a43;">Password Sementara</td>
            <td style="padding: 10px 14px; font-size: 14px; color: #a8673c; font-family: monospace; font-weight: bold; letter-spacing: 1px;">${newAccount.tempPassword}</td>
          </tr>
        </table>
        <div style="margin-top: 16px; text-align: center;">
          <a href="https://wazzopi.vercel.app/login" style="display: inline-block; background-color: #4a2117; color: #fbf5ea; text-decoration: none; padding: 10px 24px; border-radius: 8px; font-size: 13px; font-weight: 600;">
            Masuk ke Member Area &rarr;
          </a>
        </div>
        <p style="margin: 12px 0 0 0; font-size: 11px; color: #8f5a43; text-align: center;">
          *Anda dapat mengganti password sementara ini kapan saja setelah login di menu Akun Saya.
        </p>
      </div>
    `
    : "";

  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Konfirmasi Pesanan ${orderNo}</title>
    </head>
    <body style="margin: 0; padding: 20px 0; background-color: #fbf5ea; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(42, 18, 12, 0.08); border: 1px solid #efe3d0;">
        <!-- Header -->
        <tr>
          <td style="background-color: #2a120c; padding: 32px 24px; text-align: center;">
            <h1 style="margin: 0; color: #fbf5ea; font-size: 26px; font-weight: bold; letter-spacing: 0.5px;">
              ${storeName}
            </h1>
            <p style="margin: 6px 0 0 0; color: #d39f6f; font-size: 13px; letter-spacing: 1px; text-transform: uppercase;">
              Satu Teguk, Banyak Cerita
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding: 32px 24px;">
            <h2 style="margin: 0 0 12px 0; color: #2a120c; font-size: 20px;">
              Pesanan Berhasil Diterima!
            </h2>
            <p style="margin: 0 0 20px 0; font-size: 14px; color: #5a2c1e; line-height: 1.6;">
              Halo <strong>${customerName}</strong>,<br>
              Terima kasih telah berbelanja di <strong>${storeName}</strong>. Pesanan Anda dengan nomor <strong>#${orderNo}</strong> telah masuk ke sistem kami dan sedang disiapkan dengan cermat.
            </p>

            ${newAccountBoxHtml}

            <!-- Rincian Pesanan -->
            <div style="background-color: #fffdf9; border: 1px solid #efe3d0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <h3 style="margin: 0 0 14px 0; color: #4a2117; font-size: 15px; border-bottom: 1px solid #efe3d0; padding-bottom: 8px;">
                Rincian Pesanan #${orderNo}
              </h3>
              <table style="width: 100%; border-collapse: collapse;">
                ${itemsHtml}
                <tr>
                  <td colspan="2" style="padding-top: 14px; font-size: 14px; color: #5a2c1e;">Metode Pengiriman:</td>
                  <td style="padding-top: 14px; font-size: 14px; color: #2a120c; text-align: right; font-weight: 500;">${shippingMethod}</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 6px 0; font-size: 14px; color: #5a2c1e;">Metode Pembayaran:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #2a120c; text-align: right; font-weight: 500;">${paymentLabel}</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 12px 0 0 0; font-size: 16px; color: #2a120c; font-weight: bold; border-top: 2px solid #efe3d0;">Total Pembayaran:</td>
                  <td style="padding: 12px 0 0 0; font-size: 18px; color: #a8673c; text-align: right; font-weight: bold; border-top: 2px solid #efe3d0;">${formatIDR(totalAmount)}</td>
                </tr>
              </table>
            </div>

            <!-- Alamat Pengiriman -->
            <div style="background-color: #fbf5ea; border-radius: 10px; padding: 16px; font-size: 13px; color: #5a2c1e; line-height: 1.5;">
              <strong style="color: #2a120c;">Alamat Pengiriman:</strong><br>
              ${shippingAddress}
            </div>

            <!-- Bantuan / Kontak -->
            <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #efe3d0; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #6e3a28;">
                Ada pertanyaan mengenai pesanan Anda? Hubungi kami via WhatsApp:
              </p>
              <a href="https://wa.me/${whatsappContact}?text=Halo%20Admin%20Wazzopi,%20saya%20ingin%20menanyakan%20pesanan%20${orderNo}" style="display: inline-block; color: #a8673c; font-weight: bold; text-decoration: underline; font-size: 14px;">
                Chat WhatsApp Admin Wazzopi
              </a>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color: #3a1911; padding: 20px 24px; text-align: center; color: #ecdcd1; font-size: 12px;">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} ${storeName}. Hak cipta dilindungi.</p>
            <p style="margin: 4px 0 0 0; color: #b98a72; font-size: 11px;">Email ini dikirim secara otomatis oleh sistem toko online Wazzopi.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export async function sendOrderCreatedEmail(
  params: SendOrderEmailParams
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const htmlContent = generateOrderEmailHtml(params);
    const settings = await getSettings();

    // 1. Prioritas Utama: Jika Custom Mail Server (SMTP) diaktifkan di Admin
    if (settings.smtp?.enabled && settings.smtp?.host) {
      console.log(
        `[Email] Mengirim pesanan #${params.orderNo} via Custom SMTP (${settings.smtp.host}) ke ${params.customerEmail}`
      );
      const smtpRes = await sendSmtpMail(settings.smtp, {
        to: params.customerEmail,
        subject: params.newAccount
          ? `Pesanan Diterima & Akses Akun Member Wazzopi (#${params.orderNo})`
          : `Konfirmasi Pesanan Wazzopi (#${params.orderNo})`,
        html: htmlContent,
      });

      if (smtpRes.success) {
        return { success: true, id: smtpRes.messageId };
      } else {
        return { success: false, error: `SMTP Error: ${smtpRes.error}` };
      }
    }

    // 2. Alternatif: Jika SMTP tidak aktif, gunakan Resend API jika API Key tersedia
    const resendApiKey = process.env.RESEND_API_KEY?.trim();

    if (resendApiKey) {
      const fromEmail = process.env.EMAIL_FROM || "Wazzopi <onboarding@resend.dev>";
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [params.customerEmail],
          subject: params.newAccount
            ? `Pesanan Diterima & Akses Akun Member Wazzopi (#${params.orderNo})`
            : `Konfirmasi Pesanan Wazzopi (#${params.orderNo})`,
          html: htmlContent,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log(`[Email] Sukses mengirim email ke ${params.customerEmail} via Resend. ID: ${data.id}`);
        return { success: true, id: data.id };
      } else {
        const errText = await res.text();
        console.warn(`[Email] Gagal mengirim via Resend (${res.status}): ${errText}`);
        return { success: false, error: `Resend HTTP ${res.status}: ${errText}` };
      }
    } else {
      console.log(
        `[Email Preview] (RESEND_API_KEY belum dikonfigurasi). Email pesanan #${params.orderNo} siap dikirim ke: ${params.customerEmail}`
      );
      if (params.newAccount) {
        console.log(
          `[Email Preview] Akun Member Dibuat: Email=${params.newAccount.email}, Password=${params.newAccount.tempPassword}`
        );
      }
      return { success: false, error: "RESEND_API_KEY belum terdeteksi di server hosting Vercel." };
    }
  } catch (error: any) {
    console.error("[Email Error] Terjadi kesalahan saat memproses pengiriman email:", error);
    return { success: false, error: error?.message || "Terjadi kesalahan jaringan saat mengirim email." };
  }
}
