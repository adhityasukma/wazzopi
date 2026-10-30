import "server-only";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { sendSmtpMail } from "@/lib/smtp";
import { PAYMENT_LABEL } from "@/lib/utils";

export type OrderEmailStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED";

export type OrderEmailItem = {
  productName: string;
  variantName?: string | null;
  quantity: number;
  price: number;
  total: number;
};

export type BankAccountInfo = {
  bank: string;
  number: string;
  holder: string;
};

export type SendOrderStatusEmailParams = {
  status: OrderEmailStatus;
  customerName: string;
  customerEmail: string;
  orderNo: string;
  items: OrderEmailItem[];
  totalAmount: number;
  shippingAddress: string;
  shippingMethod: string;
  paymentMethod: string;
  trackingNumber?: string | null;
  courierName?: string | null;
  bankAccounts?: BankAccountInfo[];
  newAccount?: {
    email: string;
    tempPassword: string;
  } | null;
  storeName?: string;
  whatsappContact?: string;
};

// Backward-compatible type alias
export type SendOrderEmailParams = SendOrderStatusEmailParams;

function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getStatusBadgeConfig(status: OrderEmailStatus): {
  badgeBg: string;
  badgeBorder: string;
  badgeColor: string;
  badgeLabel: string;
  heading: string;
  description: string;
} {
  switch (status) {
    case "PENDING":
      return {
        badgeBg: "#fffbeb",
        badgeBorder: "#fde68a",
        badgeColor: "#92400e",
        badgeLabel: "Menunggu Pembayaran",
        heading: "Pesanan Dibuat - Menunggu Pembayaran",
        description:
          "Terima kasih telah memesan di Wazzopi. Pesanan Anda telah tercatat dan saat ini berstatus Menunggu Pembayaran. Silakan selesaikan pembayaran agar pesanan dapat segera diproses.",
      };
    case "PAID":
    case "PROCESSING":
      return {
        badgeBg: "#ecfdf5",
        badgeBorder: "#a7f3d0",
        badgeColor: "#065f46",
        badgeLabel: status === "PAID" ? "Pembayaran Diterima" : "Sedang Diproses",
        heading: "Pembayaran Berhasil & Pesanan Diproses",
        description:
          "Kabar baik! Pembayaran untuk pesanan Anda telah berhasil diverifikasi. Tim barista dan staf kami sedang menyiapkan serta mengemas produk pilihan Anda dengan teliti.",
      };
    case "SHIPPED":
      return {
        badgeBg: "#eff6ff",
        badgeBorder: "#bfdbfe",
        badgeColor: "#1e40af",
        badgeLabel: "Dalam Pengiriman",
        heading: "Pesanan Sedang Dalam Pengiriman",
        description:
          "Paket pesanan Anda telah selesai dikemas dan diserahkan kepada pihak ekspedisi untuk diantarkan langsung ke alamat tujuan Anda.",
      };
    case "COMPLETED":
      return {
        badgeBg: "#f0fdf4",
        badgeBorder: "#86efac",
        badgeColor: "#166534",
        badgeLabel: "Pesanan Selesai",
        heading: "Pesanan Telah Diterima & Selesai",
        description:
          "Pesanan Anda telah berhasil sampai di tujuan dan dikonfirmasi telah diterima. Terima kasih banyak atas kepercayaan Anda memilih Wazzopi. Selamat menikmati setiap tegukan kopi artisan kami!",
      };
    case "CANCELLED":
      return {
        badgeBg: "#fef2f2",
        badgeBorder: "#fecaca",
        badgeColor: "#991b1b",
        badgeLabel: "Pesanan Dibatalkan",
        heading: "Pesanan Telah Dibatalkan",
        description:
          "Pesanan ini telah dibatalkan. Jika Anda memiliki pertanyaan atau kendala, silakan hubungi tim layanan pelanggan kami.",
      };
    default:
      return {
        badgeBg: "#f3f4f6",
        badgeBorder: "#e5e7eb",
        badgeColor: "#374151",
        badgeLabel: status,
        heading: `Pembaruan Status Pesanan: ${status}`,
        description: "Berikut adalah rincian terkini mengenai pesanan Anda di Wazzopi.",
      };
  }
}

export function generateOrderEmailHtml(params: SendOrderStatusEmailParams): string {
  const {
    status,
    customerName,
    orderNo,
    items,
    totalAmount,
    shippingAddress,
    shippingMethod,
    paymentMethod,
    trackingNumber,
    courierName,
    bankAccounts = [],
    newAccount,
    storeName = "Wazzopi",
    whatsappContact = "6281234567890",
  } = params;

  const badgeConfig = getStatusBadgeConfig(status);

  const paymentLabel = PAYMENT_LABEL[paymentMethod] || paymentMethod || "Transfer Bank";

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

  // Box Informasi Akun Member Baru (jika baru mendaftar saat checkout)
  const newAccountBoxHtml = newAccount
    ? `
      <div style="background-color: #faf2ea; border: 1.5px solid #d39f6f; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <h3 style="margin: 0 0 10px 0; color: #5a2c1e; font-size: 16px; font-weight: bold;">
          Akses Login Member Area Anda
        </h3>
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

  // Box Instruksi Pembayaran (Khusus Status PENDING)
  let paymentInstructionHtml = "";
  if (status === "PENDING") {
    if (paymentMethod === "bank_transfer") {
      const bankListHtml =
        bankAccounts.length > 0
          ? bankAccounts
              .map(
                (b) => `
                <div style="background-color: #ffffff; border: 1px solid #efe3d0; border-radius: 8px; padding: 12px 16px; margin-bottom: 10px;">
                  <div style="font-size: 12px; color: #8f5a43; text-transform: uppercase; font-weight: 600;">Bank ${b.bank}</div>
                  <div style="font-size: 18px; font-family: monospace; font-weight: bold; color: #2a120c; margin: 4px 0;">${b.number}</div>
                  <div style="font-size: 12px; color: #5a2c1e;">a.n. ${b.holder}</div>
                </div>
              `
              )
              .join("")
          : `
            <div style="background-color: #ffffff; border: 1px solid #efe3d0; border-radius: 8px; padding: 12px 16px;">
              <div style="font-size: 12px; color: #8f5a43;">Silakan hubungi admin kami untuk nomor rekening transfer.</div>
            </div>
          `;

      paymentInstructionHtml = `
        <div style="background-color: #fff9f2; border: 1.5px solid #d39f6f; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <h3 style="margin: 0 0 10px 0; color: #5a2c1e; font-size: 15px; font-weight: bold;">
            Instruksi Pembayaran Transfer Bank
          </h3>
          <p style="margin: 0 0 14px 0; font-size: 13px; color: #6e3a28; line-height: 1.5;">
            Silakan transfer sejumlah <strong>${formatIDR(totalAmount)}</strong> ke salah satu rekening resmi berikut:
          </p>
          ${bankListHtml}
          <div style="margin-top: 14px; text-align: center;">
            <a href="https://wa.me/${whatsappContact}?text=Halo%20Admin%20Wazzopi,%20saya%20sudah%20transfer%20untuk%20pesanan%20${orderNo}%20sebesar%20${encodeURIComponent(formatIDR(totalAmount))}" style="display: inline-block; background-color: #25d366; color: #ffffff; text-decoration: none; padding: 10px 22px; border-radius: 8px; font-size: 13px; font-weight: 600;">
              Konfirmasi Bukti Transfer via WhatsApp &rarr;
            </a>
          </div>
        </div>
      `;
    } else if (paymentMethod === "midtrans") {
      paymentInstructionHtml = `
        <div style="background-color: #fff9f2; border: 1.5px solid #d39f6f; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
          <h3 style="margin: 0 0 8px 0; color: #5a2c1e; font-size: 15px; font-weight: bold;">
            Selesaikan Pembayaran Online Anda
          </h3>
          <p style="margin: 0 0 16px 0; font-size: 13px; color: #6e3a28; line-height: 1.5;">
            Total yang harus dibayar: <strong>${formatIDR(totalAmount)}</strong> via QRIS, GoPay, Virtual Account, atau Kartu Kredit.
          </p>
          <a href="https://wazzopi.vercel.app/checkout/success/${orderNo}" style="display: inline-block; background-color: #a8673c; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: bold;">
            Bayar Sekarang Secara Online &rarr;
          </a>
        </div>
      `;
    } else if (paymentMethod === "cod") {
      paymentInstructionHtml = `
        <div style="background-color: #fbf5ea; border: 1px solid #efe3d0; border-radius: 12px; padding: 16px; margin: 24px 0;">
          <h4 style="margin: 0 0 6px 0; color: #4a2117; font-size: 14px; font-weight: bold;">
            Metode Bayar di Tempat (COD)
          </h4>
          <p style="margin: 0; font-size: 13px; color: #5a2c1e; line-height: 1.5;">
            Pesanan Anda akan dikirim ke alamat tujuan. Mohon siapkan uang tunai sebesar <strong>${formatIDR(totalAmount)}</strong> saat kurir mengantarkan paket.
          </p>
        </div>
      `;
    }
  }

  // Box Informasi Pengiriman & Resi (Khusus Status SHIPPED atau jika resi tersedia)
  let trackingBoxHtml = "";
  if (trackingNumber || status === "SHIPPED") {
    trackingBoxHtml = `
      <div style="background-color: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <h3 style="margin: 0 0 8px 0; color: #1e3a8a; font-size: 15px; font-weight: bold;">
          Informasi Pelacakan Paket (Resi Pengiriman)
        </h3>
        <p style="margin: 0 0 14px 0; font-size: 13px; color: #1e40af; line-height: 1.5;">
          Paket Anda telah dikirim dan dapat dilacak perjalanannya dengan nomor resi berikut:
        </p>
        <table style="width: 100%; border-collapse: collapse; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #bfdbfe;">
          <tr>
            <td style="padding: 10px 14px; font-size: 13px; color: #64748b; width: 35%; border-bottom: 1px solid #f1f5f9;">Ekspedisi Kurir</td>
            <td style="padding: 10px 14px; font-size: 13px; color: #0f172a; font-weight: 600; border-bottom: 1px solid #f1f5f9;">${courierName || shippingMethod}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; font-size: 13px; color: #64748b;">Nomor Resi (AWB)</td>
            <td style="padding: 10px 14px; font-size: 16px; color: #1d4ed8; font-family: monospace; font-weight: bold; letter-spacing: 1px;">
              ${trackingNumber || "Nomor resi sedang diperbarui"}
            </td>
          </tr>
        </table>
        <div style="margin-top: 16px; text-align: center;">
          <a href="https://wazzopi.vercel.app/account" style="display: inline-block; background-color: #1e40af; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 8px; font-size: 13px; font-weight: 600;">
            Lacak Perjalanan Paket Anda &rarr;
          </a>
        </div>
      </div>
    `;
  }

  // Box Selesai / Terima Kasih (Khusus Status COMPLETED)
  let completedBoxHtml = "";
  if (status === "COMPLETED") {
    completedBoxHtml = `
      <div style="background-color: #f0fdf4; border: 1.5px solid #86efac; border-radius: 12px; padding: 22px; margin: 24px 0; text-align: center;">
        <h3 style="margin: 0 0 8px 0; color: #166534; font-size: 16px; font-weight: bold;">
          Terima Kasih Atas Kepercayaan Anda!
        </h3>
        <p style="margin: 0 0 16px 0; font-size: 13px; color: #15803d; line-height: 1.6;">
          Kami bangga dapat menghadirkan kopi Nusantara berkualitas langsung ke cangkir Anda. Bagikan momen ngopi Anda atau pesan menu favorit berikutnya kapan saja.
        </p>
        <a href="https://wazzopi.vercel.app/shop" style="display: inline-block; background-color: #15803d; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 8px; font-size: 13px; font-weight: 600;">
          Jelajahi Menu Kopi Lainnya &rarr;
        </a>
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Status Pesanan #${orderNo} - ${storeName}</title>
    </head>
    <body style="margin: 0; padding: 24px 0; background-color: #fbf5ea; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(42, 18, 12, 0.08); border: 1px solid #efe3d0;">
        <!-- Header Brand -->
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

        <!-- Status Header Pill -->
        <tr>
          <td style="padding: 24px 24px 0 24px;">
            <div style="background-color: ${badgeConfig.badgeBg}; border: 1px solid ${badgeConfig.badgeBorder}; border-radius: 10px; padding: 12px 16px; display: inline-block; width: calc(100% - 32px);">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="font-size: 12px; color: #78716c; text-transform: uppercase; font-weight: 600;">Status Pesanan Saat Ini:</td>
                  <td style="text-align: right;">
                    <span style="background-color: #ffffff; border: 1px solid ${badgeConfig.badgeBorder}; color: ${badgeConfig.badgeColor}; font-weight: bold; font-size: 12px; padding: 4px 10px; border-radius: 20px;">
                      ${badgeConfig.badgeLabel}
                    </span>
                  </td>
                </tr>
              </table>
            </div>
          </td>
        </tr>

        <!-- Body Content -->
        <tr>
          <td style="padding: 20px 24px 32px 24px;">
            <h2 style="margin: 0 0 12px 0; color: #2a120c; font-size: 20px; line-height: 1.3;">
              ${badgeConfig.heading}
            </h2>
            <p style="margin: 0 0 16px 0; font-size: 14px; color: #5a2c1e; line-height: 1.6;">
              Halo <strong>${customerName}</strong>,<br>
              ${badgeConfig.description}
            </p>

            ${newAccountBoxHtml}
            ${paymentInstructionHtml}
            ${trackingBoxHtml}
            ${completedBoxHtml}

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
                Ada pertanyaan mengenai pesanan Anda? Hubungi tim admin kami via WhatsApp:
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

function getSubjectByStatus(params: SendOrderStatusEmailParams): string {
  const { status, orderNo, trackingNumber } = params;
  switch (status) {
    case "PENDING":
      return `[Menunggu Pembayaran] Detail Pesanan #${orderNo}`;
    case "PAID":
    case "PROCESSING":
      return `[Pembayaran Diterima] Pesanan #${orderNo} Telah Lunas & Sedang Diproses`;
    case "SHIPPED":
      return trackingNumber
        ? `[Dalam Pengiriman] Pesanan #${orderNo} Telah Dikirim (Resi: ${trackingNumber})`
        : `[Dalam Pengiriman] Pesanan #${orderNo} Telah Dikirim`;
    case "COMPLETED":
      return `[Pesanan Selesai] Terima Kasih Telah Berbelanja di Wazzopi #${orderNo}`;
    case "CANCELLED":
      return `[Dibatalkan] Pesanan #${orderNo} Telah Dibatalkan`;
    default:
      return `Pembaruan Pesanan Wazzopi #${orderNo}`;
  }
}

export type SendNewAccountEmailParams = {
  customerName: string;
  email: string;
  tempPassword: string;
  storeName?: string;
  whatsappContact?: string;
};

export function generateNewAccountEmailHtml(params: SendNewAccountEmailParams): string {
  const {
    customerName,
    email,
    tempPassword,
    storeName = "Wazzopi",
    whatsappContact = "6281234567890",
  } = params;

  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Akses Akun Member ${storeName}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f3ee; margin: 0; padding: 24px 12px; color: #2a120c;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #efe3d0; box-shadow: 0 4px 12px rgba(42, 18, 12, 0.05);">
        <!-- Header -->
        <tr>
          <td style="background-color: #381a12; padding: 32px 24px; text-align: center;">
            <h1 style="color: #fbf5ea; margin: 0; font-size: 26px; font-weight: bold; letter-spacing: -0.5px;">
              ${storeName}
            </h1>
            <p style="color: #d39f6f; margin: 6px 0 0 0; font-size: 13px; letter-spacing: 0.5px;">
              Satu Teguk, Banyak Cerita
            </p>
          </td>
        </tr>

        <!-- Body Content -->
        <tr>
          <td style="padding: 32px 28px;">
            <div style="display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 20px; padding: 4px 12px; font-size: 11px; font-weight: bold; color: #065f46; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px;">
              Akun Member Aktif
            </div>

            <h2 style="margin: 0 0 12px 0; color: #2a120c; font-size: 20px; font-weight: bold;">
              Halo, ${customerName}!
            </h2>
            <p style="margin: 0 0 20px 0; font-size: 14px; color: #6e3a28; line-height: 1.6;">
              Terima kasih telah berbelanja di <strong>${storeName}</strong>. Untuk memudahkan Anda memantau status pesanan, nomor resi pengiriman, dan riwayat pembelian kapan saja, akun Member Anda telah berhasil dibuat secara otomatis saat Anda melakukan pemesanan.
            </p>

            <!-- Box Akses Login -->
            <div style="background-color: #faf2ea; border: 1.5px solid #d39f6f; border-radius: 12px; padding: 22px; margin: 24px 0;">
              <h3 style="margin: 0 0 14px 0; color: #5a2c1e; font-size: 15px; font-weight: bold;">
                Detail Akses Login Member Area:
              </h3>
              <table style="width: 100%; border-collapse: collapse; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #efe3d0;">
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; color: #8f5a43; width: 38%; border-bottom: 1px solid #f8f1ec;">Email Login</td>
                  <td style="padding: 12px 16px; font-size: 13px; color: #2a120c; font-weight: 600; border-bottom: 1px solid #f8f1ec;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; color: #8f5a43;">Password Sementara</td>
                  <td style="padding: 12px 16px; font-size: 14px; color: #a8673c; font-family: monospace; font-weight: bold; letter-spacing: 1px;">${tempPassword}</td>
                </tr>
              </table>
              <div style="margin-top: 20px; text-align: center;">
                <a href="https://wazzopi.vercel.app/login" style="display: inline-block; background-color: #4a2117; color: #fbf5ea; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 13px; font-weight: bold; box-shadow: 0 2px 6px rgba(74, 33, 23, 0.2);">
                  Masuk ke Member Area &rarr;
                </a>
              </div>
            </div>

            <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px 16px; margin: 20px 0;">
              <p style="margin: 0; font-size: 12px; color: #92400e; line-height: 1.5;">
                <strong>Tips Keamanan:</strong> Demi kenyamanan Anda, segera perbarui password Anda di menu <strong>Pengaturan Akun</strong> setelah Anda berhasil masuk ke Member Area.
              </p>
            </div>

            <!-- Bantuan / Kontak -->
            <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #efe3d0; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #8f5a43;">
                Butuh bantuan terkait akun atau pesanan Anda?
              </p>
              <a href="https://wa.me/${whatsappContact.replace(/[^0-9]/g, "")}" style="display: inline-block; color: #4a2117; font-weight: 600; font-size: 13px; text-decoration: none;">
                Hubungi Customer Care via WhatsApp &rarr;
              </a>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color: #2a120c; padding: 24px; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #e4c5a0;">
              &copy; ${new Date().getFullYear()} ${storeName}. Hak cipta dilindungi.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

/**
 * Helper terpadu untuk pengiriman email via Custom SMTP atau Resend API fallback
 */
async function sendRawMail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const settings = await getSettings();

    // 1. Prioritas Utama: Custom Mail Server (SMTP) di Pengaturan Admin
    if (settings.smtp?.enabled && settings.smtp?.host) {
      console.log(
        `[Email] Mengirim email "${options.subject}" via Custom SMTP (${settings.smtp.host}) ke ${options.to}`
      );
      const smtpRes = await sendSmtpMail(settings.smtp, {
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      if (smtpRes.success) {
        return { success: true, id: smtpRes.messageId };
      } else {
        return { success: false, error: `SMTP Error: ${smtpRes.error}` };
      }
    }

    // 2. Alternatif: Resend API jika RESEND_API_KEY disetel di environment
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
          to: [options.to],
          subject: options.subject,
          html: options.html,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log(`[Email] Sukses via Resend ke ${options.to}. ID: ${data.id}`);
        return { success: true, id: data.id };
      } else {
        const errText = await res.text();
        console.warn(`[Email] Gagal via Resend (${res.status}): ${errText}`);
        return { success: false, error: `Resend HTTP ${res.status}: ${errText}` };
      }
    }

    console.warn(
      `[Email Warning] Tidak ada mail provider aktif (SMTP belum diaktifkan di Admin dan RESEND_API_KEY belum disetel di .env). Email siap kirim ke: ${options.to} ("${options.subject}")`
    );
    return {
      success: false,
      error: "Mail Server (SMTP) belum diaktifkan di Admin Toko atau RESEND_API_KEY belum dikonfigurasi.",
    };
  } catch (err: any) {
    console.error("[Email Raw Error]:", err);
    return { success: false, error: err?.message || "Gagal memproses pengiriman email" };
  }
}

/**
 * Mengirim email detail akses login member baru
 */
export async function sendNewAccountEmail(
  params: SendNewAccountEmailParams
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const htmlContent = generateNewAccountEmailHtml(params);
    const subject = `Detail Akses Login Member ${params.storeName || "Wazzopi"}`;
    return await sendRawMail({
      to: params.email,
      subject,
      html: htmlContent,
    });
  } catch (error: any) {
    console.error("[sendNewAccountEmail error]:", error);
    return { success: false, error: error?.message || "Gagal mengirim email akses akun" };
  }
}

/**
 * Mengirim email transaksional berdasarkan status pesanan
 */
export async function sendOrderStatusEmail(
  params: SendOrderStatusEmailParams
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const htmlContent = generateOrderEmailHtml(params);
    const subject = getSubjectByStatus(params);
    return await sendRawMail({
      to: params.customerEmail,
      subject,
      html: htmlContent,
    });
  } catch (error: any) {
    console.error("[Email Error] Terjadi kesalahan saat memproses pengiriman email:", error);
    return { success: false, error: error?.message || "Terjadi kesalahan saat mengirim email." };
  }
}

// Backward compatible wrapper
export async function sendOrderCreatedEmail(
  params: SendOrderStatusEmailParams
): Promise<{ success: boolean; id?: string; error?: string }> {
  return sendOrderStatusEmail({
    ...params,
    status: params.status || "PENDING",
  });
}

/**
 * Helper terpusat untuk mengambil data pesanan dari database dan mengirim email status terkini
 */
export async function sendOrderNotificationByOrderId(
  orderId: string,
  options?: {
    forcedStatus?: OrderEmailStatus;
    newAccount?: { email: string; tempPassword: string } | null;
  }
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return { success: false, error: "Pesanan tidak ditemukan" };
    }

    const settings = await getSettings();
    const effectiveStatus = (options?.forcedStatus || order.status) as OrderEmailStatus;

    return await sendOrderStatusEmail({
      status: effectiveStatus,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      orderNo: order.orderNo,
      items: order.items.map((it) => ({
        productName: it.productName,
        variantName: it.variantName,
        quantity: it.quantity,
        price: it.price,
        total: it.total,
      })),
      totalAmount: order.total,
      shippingAddress: `${order.address}, ${order.city}, ${order.province} ${order.postalCode}`,
      shippingMethod: order.shippingMethod,
      paymentMethod: order.paymentMethod,
      trackingNumber: order.trackingNumber,
      courierName: order.courierName,
      bankAccounts: settings.payment.bankTransfer.accounts,
      newAccount: options?.newAccount ?? null,
      storeName: settings.general.storeName,
      whatsappContact: settings.other.whatsapp || settings.general.phone,
    });
  } catch (error: any) {
    console.error("[sendOrderNotificationByOrderId error]:", error);
    return { success: false, error: error?.message || "Gagal mengirim notifikasi email" };
  }
}
