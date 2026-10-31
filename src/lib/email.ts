import "server-only";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { getStoreWhatsApp } from "@/lib/settings-types";
import { sendSmtpMail } from "@/lib/smtp";
import { PAYMENT_LABEL } from "@/lib/utils";
import { getServerLocale } from "@/i18n/server";

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
  locale?: "en" | "id";
};

// Backward-compatible type alias
export type SendOrderEmailParams = SendOrderStatusEmailParams;

const PAYMENT_LABEL_EN: Record<string, string> = {
  bank_transfer: "Bank Transfer",
  midtrans: "Online Payment (Midtrans)",
  cod: "Cash On Delivery (COD)",
};

function getPaymentMethodLabel(method: string, isEn: boolean): string {
  if (isEn) {
    return PAYMENT_LABEL_EN[method] || PAYMENT_LABEL[method] || method;
  }
  return PAYMENT_LABEL[method] || method || "Transfer Bank";
}

function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getStatusBadgeConfig(
  status: OrderEmailStatus,
  isEn: boolean
): {
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
        badgeLabel: isEn ? "Awaiting Payment" : "Menunggu Pembayaran",
        heading: isEn
          ? "Order Placed - Awaiting Payment"
          : "Pesanan Dibuat - Menunggu Pembayaran",
        description: isEn
          ? "Thank you for ordering at Wazzopi. Your order has been recorded and is currently awaiting payment. Please complete your payment so we can process your order promptly."
          : "Terima kasih telah memesan di Wazzopi. Pesanan Anda telah tercatat dan saat ini berstatus Menunggu Pembayaran. Silakan selesaikan pembayaran agar pesanan dapat segera diproses.",
      };
    case "PAID":
    case "PROCESSING":
      return {
        badgeBg: "#ecfdf5",
        badgeBorder: "#a7f3d0",
        badgeColor: "#065f46",
        badgeLabel: isEn
          ? status === "PAID"
            ? "Payment Received"
            : "Processing"
          : status === "PAID"
          ? "Pembayaran Diterima"
          : "Sedang Diproses",
        heading: isEn
          ? "Payment Successful & Order Processing"
          : "Pembayaran Berhasil & Pesanan Diproses",
        description: isEn
          ? "Great news! Your payment has been verified. Our team is carefully preparing and packaging your selected artisan coffee products."
          : "Kabar baik! Pembayaran untuk pesanan Anda telah berhasil diverifikasi. Tim barista dan staf kami sedang menyiapkan serta mengemas produk pilihan Anda dengan teliti.",
      };
    case "SHIPPED":
      return {
        badgeBg: "#eff6ff",
        badgeBorder: "#bfdbfe",
        badgeColor: "#1e40af",
        badgeLabel: isEn ? "In Transit" : "Dalam Pengiriman",
        heading: isEn
          ? "Your Order is on the Way"
          : "Pesanan Sedang Dalam Pengiriman",
        description: isEn
          ? "Your order package has been packed and handed over to the courier to be delivered directly to your destination address."
          : "Paket pesanan Anda telah selesai dikemas dan diserahkan kepada pihak ekspedisi untuk diantarkan langsung ke alamat tujuan Anda.",
      };
    case "COMPLETED":
      return {
        badgeBg: "#f0fdf4",
        badgeBorder: "#86efac",
        badgeColor: "#166534",
        badgeLabel: isEn ? "Order Completed" : "Pesanan Selesai",
        heading: isEn
          ? "Order Delivered & Completed"
          : "Pesanan Telah Diterima & Selesai",
        description: isEn
          ? "Your package has arrived at its destination and delivery is confirmed. Thank you very much for choosing Wazzopi. Enjoy every sip of our artisan coffee!"
          : "Pesanan Anda telah berhasil sampai di tujuan dan dikonfirmasi telah diterima. Terima kasih banyak atas kepercayaan Anda memilih Wazzopi. Selamat menikmati setiap tegukan kopi artisan kami!",
      };
    case "CANCELLED":
      return {
        badgeBg: "#fef2f2",
        badgeBorder: "#fecaca",
        badgeColor: "#991b1b",
        badgeLabel: isEn ? "Order Cancelled" : "Pesanan Dibatalkan",
        heading: isEn
          ? "Order Has Been Cancelled"
          : "Pesanan Telah Dibatalkan",
        description: isEn
          ? "This order has been cancelled. If you have any questions or concerns, please contact our customer care team."
          : "Pesanan ini telah dibatalkan. Jika Anda memiliki pertanyaan atau kendala, silakan hubungi tim layanan pelanggan kami.",
      };
    default:
      return {
        badgeBg: "#f3f4f6",
        badgeBorder: "#e5e7eb",
        badgeColor: "#374151",
        badgeLabel: status,
        heading: isEn
          ? `Order Status Update: ${status}`
          : `Pembaruan Status Pesanan: ${status}`,
        description: isEn
          ? "Here are the latest details regarding your order at Wazzopi."
          : "Berikut adalah rincian terkini mengenai pesanan Anda di Wazzopi.",
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
    whatsappContact = "6282353538212",
    locale = "id",
  } = params;

  const isEn = locale === "en";
  const badgeConfig = getStatusBadgeConfig(status, isEn);
  const paymentLabel = getPaymentMethodLabel(paymentMethod, isEn);

  const itemsHtml = items
    .map(
      (it) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #efe3d0; font-size: 14px; color: #2a120c;">
          <strong>${it.productName}</strong>
          ${it.variantName ? `<br><span style="font-size: 12px; color: #8f5a43;">${isEn ? "Variant" : "Varian"}: ${it.variantName}</span>` : ""}
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
          ${isEn ? "Your Member Area Login Access" : "Akses Login Member Area Anda"}
        </h3>
        <p style="margin: 0 0 14px 0; font-size: 13px; color: #6e3a28; line-height: 1.5;">
          ${
            isEn
              ? "To help you easily monitor order status, tracking numbers, and purchase history, we have automatically created a Member account for you:"
              : "Untuk memudahkan Anda memantau status pesanan, nomor resi pengiriman, dan riwayat belanja, kami telah otomatis membuatkan akun Member untuk Anda:"
          }
        </p>
        <table style="width: 100%; border-collapse: collapse; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #efe3d0;">
          <tr>
            <td style="padding: 10px 14px; font-size: 13px; color: #8f5a43; width: 35%; border-bottom: 1px solid #f8f1ec;">${isEn ? "Login Email" : "Email Login"}</td>
            <td style="padding: 10px 14px; font-size: 13px; color: #2a120c; font-weight: 600; border-bottom: 1px solid #f8f1ec;">${newAccount.email}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; font-size: 13px; color: #8f5a43;">${isEn ? "Temporary Password" : "Password Sementara"}</td>
            <td style="padding: 10px 14px; font-size: 14px; color: #a8673c; font-family: monospace; font-weight: bold; letter-spacing: 1px;">${newAccount.tempPassword}</td>
          </tr>
        </table>
        <div style="margin-top: 16px; text-align: center;">
          <a href="https://wazzopi.vercel.app/login" style="display: inline-block; background-color: #4a2117; color: #fbf5ea; text-decoration: none; padding: 10px 24px; border-radius: 8px; font-size: 13px; font-weight: 600;">
            ${isEn ? "Log In to Member Area &rarr;" : "Masuk ke Member Area &rarr;"}
          </a>
        </div>
        <p style="margin: 12px 0 0 0; font-size: 11px; color: #8f5a43; text-align: center;">
          ${
            isEn
              ? "*You can change this temporary password at any time after logging in via My Account."
              : "*Anda dapat mengganti password sementara ini kapan saja setelah login di menu Akun Saya."
          }
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
              <div style="font-size: 12px; color: #8f5a43;">${
                isEn
                  ? "Please contact our support for bank transfer account details."
                  : "Silakan hubungi admin kami untuk nomor rekening transfer."
              }</div>
            </div>
          `;

      paymentInstructionHtml = `
        <div style="background-color: #fff9f2; border: 1.5px solid #d39f6f; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <h3 style="margin: 0 0 10px 0; color: #5a2c1e; font-size: 15px; font-weight: bold;">
            ${isEn ? "Bank Transfer Payment Instructions" : "Instruksi Pembayaran Transfer Bank"}
          </h3>
          <p style="margin: 0 0 14px 0; font-size: 13px; color: #6e3a28; line-height: 1.5;">
            ${
              isEn
                ? `Please transfer <strong>${formatIDR(totalAmount)}</strong> to one of the following official accounts:`
                : `Silakan transfer sejumlah <strong>${formatIDR(totalAmount)}</strong> ke salah satu rekening resmi berikut:`
            }
          </p>
          ${bankListHtml}
          <div style="margin-top: 14px; text-align: center;">
            <a href="https://wa.me/${whatsappContact}?text=${encodeURIComponent(
              isEn
                ? `Hello Wazzopi Admin, I have transferred for order ${orderNo} amounting to ${formatIDR(totalAmount)}`
                : `Halo Admin Wazzopi, saya sudah transfer untuk pesanan ${orderNo} sebesar ${formatIDR(totalAmount)}`
            )}" style="display: inline-block; background-color: #25d366; color: #ffffff; text-decoration: none; padding: 10px 22px; border-radius: 8px; font-size: 13px; font-weight: 600;">
              ${isEn ? "Confirm Transfer Proof via WhatsApp &rarr;" : "Konfirmasi Bukti Transfer via WhatsApp &rarr;"}
            </a>
          </div>
        </div>
      `;
    } else if (paymentMethod === "midtrans") {
      paymentInstructionHtml = `
        <div style="background-color: #fff9f2; border: 1.5px solid #d39f6f; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
          <h3 style="margin: 0 0 8px 0; color: #5a2c1e; font-size: 15px; font-weight: bold;">
            ${isEn ? "Complete Your Online Payment" : "Selesaikan Pembayaran Online Anda"}
          </h3>
          <p style="margin: 0 0 16px 0; font-size: 13px; color: #6e3a28; line-height: 1.5;">
            ${
              isEn
                ? `Total to pay: <strong>${formatIDR(totalAmount)}</strong> via QRIS, GoPay, Virtual Account, or Credit Card.`
                : `Total yang harus dibayar: <strong>${formatIDR(totalAmount)}</strong> via QRIS, GoPay, Virtual Account, atau Kartu Kredit.`
            }
          </p>
          <a href="https://wazzopi.vercel.app/checkout/success/${orderNo}" style="display: inline-block; background-color: #a8673c; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: bold;">
            ${isEn ? "Pay Online Now &rarr;" : "Bayar Sekarang Secara Online &rarr;"}
          </a>
        </div>
      `;
    } else if (paymentMethod === "cod") {
      paymentInstructionHtml = `
        <div style="background-color: #fbf5ea; border: 1px solid #efe3d0; border-radius: 12px; padding: 16px; margin: 24px 0;">
          <h4 style="margin: 0 0 6px 0; color: #4a2117; font-size: 14px; font-weight: bold;">
            ${isEn ? "Cash On Delivery (COD) Method" : "Metode Bayar di Tempat (COD)"}
          </h4>
          <p style="margin: 0; font-size: 13px; color: #5a2c1e; line-height: 1.5;">
            ${
              isEn
                ? `Your order will be shipped to your destination address. Please prepare <strong>${formatIDR(totalAmount)}</strong> in cash upon courier delivery.`
                : `Pesanan Anda akan dikirim ke alamat tujuan. Mohon siapkan uang tunai sebesar <strong>${formatIDR(totalAmount)}</strong> saat kurir mengantarkan paket.`
            }
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
          ${isEn ? "Shipment Tracking Information (AWB)" : "Informasi Pelacakan Paket (Resi Pengiriman)"}
        </h3>
        <p style="margin: 0 0 14px 0; font-size: 13px; color: #1e40af; line-height: 1.5;">
          ${
            isEn
              ? "Your package has been shipped and can be tracked using the following tracking number:"
              : "Paket Anda telah dikirim dan dapat dilacak perjalanannya dengan nomor resi berikut:"
          }
        </p>
        <table style="width: 100%; border-collapse: collapse; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #bfdbfe;">
          <tr>
            <td style="padding: 10px 14px; font-size: 13px; color: #64748b; width: 35%; border-bottom: 1px solid #f1f5f9;">${isEn ? "Courier / Carrier" : "Ekspedisi Kurir"}</td>
            <td style="padding: 10px 14px; font-size: 13px; color: #0f172a; font-weight: 600; border-bottom: 1px solid #f1f5f9;">${courierName || shippingMethod}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; font-size: 13px; color: #64748b;">${isEn ? "Tracking Number (AWB)" : "Nomor Resi (AWB)"}</td>
            <td style="padding: 10px 14px; font-size: 16px; color: #1d4ed8; font-family: monospace; font-weight: bold; letter-spacing: 1px;">
              ${trackingNumber || (isEn ? "Tracking number being updated" : "Nomor resi sedang diperbarui")}
            </td>
          </tr>
        </table>
        <div style="margin-top: 16px; text-align: center;">
          <a href="https://wazzopi.vercel.app/account" style="display: inline-block; background-color: #1e40af; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 600; margin: 4px;">
            ${isEn ? "Track in Wazzopi Account &rarr;" : "Lacak di Akun Wazzopi &rarr;"}
          </a>
          ${
            trackingNumber
              ? `<a href="https://t.17track.net/en#nums=${encodeURIComponent(
                  trackingNumber.trim()
                )}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 600; margin: 4px;">
            ${isEn ? "Track via 17TRACK Global &rarr;" : "Lacak via 17TRACK Global &rarr;"}
          </a>`
              : ""
          }
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
          ${isEn ? "Thank You for Your Trust!" : "Terima Kasih Atas Kepercayaan Anda!"}
        </h3>
        <p style="margin: 0 0 16px 0; font-size: 13px; color: #15803d; line-height: 1.6;">
          ${
            isEn
              ? "We take pride in bringing premium Indonesian coffee beans directly to your cup. Share your coffee moments or order your favorite coffee anytime."
              : "Kami bangga dapat menghadirkan kopi Nusantara berkualitas langsung ke cangkir Anda. Bagikan momen ngopi Anda atau pesan menu favorit berikutnya kapan saja."
          }
        </p>
        <a href="https://wazzopi.vercel.app/shop" style="display: inline-block; background-color: #15803d; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 8px; font-size: 13px; font-weight: 600;">
          ${isEn ? "Explore More Coffee &rarr;" : "Jelajahi Menu Kopi Lainnya &rarr;"}
        </a>
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html lang="${isEn ? "en" : "id"}">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${isEn ? `Order Status #${orderNo} - ${storeName}` : `Status Pesanan #${orderNo} - ${storeName}`}</title>
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
              ${isEn ? "One Sip, Many Stories" : "Satu Teguk, Banyak Cerita"}
            </p>
          </td>
        </tr>

        <!-- Status Header Pill -->
        <tr>
          <td style="padding: 24px 24px 0 24px;">
            <div style="background-color: ${badgeConfig.badgeBg}; border: 1px solid ${badgeConfig.badgeBorder}; border-radius: 10px; padding: 12px 16px; display: inline-block; width: calc(100% - 32px);">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="font-size: 12px; color: #78716c; text-transform: uppercase; font-weight: 600;">${isEn ? "Current Order Status:" : "Status Pesanan Saat Ini:"}</td>
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
              ${isEn ? "Hello" : "Halo"} <strong>${customerName}</strong>,<br>
              ${badgeConfig.description}
            </p>

            ${newAccountBoxHtml}
            ${paymentInstructionHtml}
            ${trackingBoxHtml}
            ${completedBoxHtml}

            <!-- Rincian Pesanan -->
            <div style="background-color: #fffdf9; border: 1px solid #efe3d0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <h3 style="margin: 0 0 14px 0; color: #4a2117; font-size: 15px; border-bottom: 1px solid #efe3d0; padding-bottom: 8px;">
                ${isEn ? `Order Details #${orderNo}` : `Rincian Pesanan #${orderNo}`}
              </h3>
              <table style="width: 100%; border-collapse: collapse;">
                ${itemsHtml}
                <tr>
                  <td colspan="2" style="padding-top: 14px; font-size: 14px; color: #5a2c1e;">${isEn ? "Shipping Method:" : "Metode Pengiriman:"}</td>
                  <td style="padding-top: 14px; font-size: 14px; color: #2a120c; text-align: right; font-weight: 500;">${shippingMethod}</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 6px 0; font-size: 14px; color: #5a2c1e;">${isEn ? "Payment Method:" : "Metode Pembayaran:"}</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #2a120c; text-align: right; font-weight: 500;">${paymentLabel}</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 12px 0 0 0; font-size: 16px; color: #2a120c; font-weight: bold; border-top: 2px solid #efe3d0;">${isEn ? "Total Amount:" : "Total Pembayaran:"}</td>
                  <td style="padding: 12px 0 0 0; font-size: 18px; color: #a8673c; text-align: right; font-weight: bold; border-top: 2px solid #efe3d0;">${formatIDR(totalAmount)}</td>
                </tr>
              </table>
            </div>

            <!-- Alamat Pengiriman -->
            <div style="background-color: #fbf5ea; border-radius: 10px; padding: 16px; font-size: 13px; color: #5a2c1e; line-height: 1.5;">
              <strong style="color: #2a120c;">${isEn ? "Shipping Address:" : "Alamat Pengiriman:"}</strong><br>
              ${shippingAddress}
            </div>

            <!-- Bantuan / Kontak -->
            <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #efe3d0; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #6e3a28;">
                ${
                  isEn
                    ? "Have questions about your order? Contact our support team via WhatsApp:"
                    : "Ada pertanyaan mengenai pesanan Anda? Hubungi tim admin kami via WhatsApp:"
                }
              </p>
              <a href="https://wa.me/${whatsappContact}?text=${encodeURIComponent(
                isEn
                  ? `Hello Wazzopi Admin, I would like to inquire about order ${orderNo}`
                  : `Halo Admin Wazzopi, saya ingin menanyakan pesanan ${orderNo}`
              )}" style="display: inline-block; color: #a8673c; font-weight: bold; text-decoration: underline; font-size: 14px;">
                ${isEn ? "Chat Wazzopi Admin on WhatsApp" : "Chat WhatsApp Admin Wazzopi"}
              </a>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color: #3a1911; padding: 20px 24px; text-align: center; color: #ecdcd1; font-size: 12px;">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} ${storeName}. ${isEn ? "All rights reserved." : "Hak cipta dilindungi."}</p>
            <p style="margin: 4px 0 0 0; color: #b98a72; font-size: 11px;">${isEn ? "This email was sent automatically by the Wazzopi online store system." : "Email ini dikirim secara otomatis oleh sistem toko online Wazzopi."}</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function getSubjectByStatus(params: SendOrderStatusEmailParams): string {
  const { status, orderNo, trackingNumber, locale = "id" } = params;
  const isEn = locale === "en";

  switch (status) {
    case "PENDING":
      return isEn
        ? `[Awaiting Payment] Order Details #${orderNo}`
        : `[Menunggu Pembayaran] Detail Pesanan #${orderNo}`;
    case "PAID":
    case "PROCESSING":
      return isEn
        ? `[Payment Received] Order #${orderNo} Paid & Processing`
        : `[Pembayaran Diterima] Pesanan #${orderNo} Telah Lunas & Sedang Diproses`;
    case "SHIPPED":
      if (isEn) {
        return trackingNumber
          ? `[Shipped] Order #${orderNo} Has Been Shipped (AWB: ${trackingNumber})`
          : `[Shipped] Order #${orderNo} Has Been Shipped`;
      }
      return trackingNumber
        ? `[Dalam Pengiriman] Pesanan #${orderNo} Telah Dikirim (Resi: ${trackingNumber})`
        : `[Dalam Pengiriman] Pesanan #${orderNo} Telah Dikirim`;
    case "COMPLETED":
      return isEn
        ? `[Order Completed] Thank You for Shopping at Wazzopi #${orderNo}`
        : `[Pesanan Selesai] Terima Kasih Telah Berbelanja di Wazzopi #${orderNo}`;
    case "CANCELLED":
      return isEn
        ? `[Cancelled] Order #${orderNo} Has Been Cancelled`
        : `[Dibatalkan] Pesanan #${orderNo} Telah Dibatalkan`;
    default:
      return isEn
        ? `Wazzopi Order Update #${orderNo}`
        : `Pembaruan Pesanan Wazzopi #${orderNo}`;
  }
}

export type SendNewAccountEmailParams = {
  customerName: string;
  email: string;
  tempPassword: string;
  storeName?: string;
  whatsappContact?: string;
  locale?: "en" | "id";
};

export function generateNewAccountEmailHtml(params: SendNewAccountEmailParams): string {
  const {
    customerName,
    email,
    tempPassword,
    storeName = "Wazzopi",
    whatsappContact = "6282353538212",
    locale = "id",
  } = params;
  const isEn = locale === "en";

  return `
    <!DOCTYPE html>
    <html lang="${isEn ? "en" : "id"}">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${isEn ? `Member Account Access - ${storeName}` : `Akses Akun Member ${storeName}`}</title>
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
              ${isEn ? "One Sip, Many Stories" : "Satu Teguk, Banyak Cerita"}
            </p>
          </td>
        </tr>

        <!-- Body Content -->
        <tr>
          <td style="padding: 32px 28px;">
            <div style="display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 20px; padding: 4px 12px; font-size: 11px; font-weight: bold; color: #065f46; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px;">
              ${isEn ? "ACTIVE MEMBER ACCOUNT" : "AKUN MEMBER AKTIF"}
            </div>

            <h2 style="margin: 0 0 12px 0; color: #2a120c; font-size: 20px; font-weight: bold;">
              ${isEn ? `Hello, ${customerName}!` : `Halo, ${customerName}!`}
            </h2>
            <p style="margin: 0 0 20px 0; font-size: 14px; color: #6e3a28; line-height: 1.6;">
              ${
                isEn
                  ? `Thank you for shopping at <strong>${storeName}</strong>. To make it easy for you to track your order status, shipment waybill number, and purchase history anytime, your Member account has been automatically created upon checkout.`
                  : `Terima kasih telah berbelanja di <strong>${storeName}</strong>. Untuk memudahkan Anda memantau status pesanan, nomor resi pengiriman, dan riwayat pembelian kapan saja, akun Member Anda telah berhasil dibuat secara otomatis saat Anda melakukan pemesanan.`
              }
            </p>

            <!-- Box Akses Login -->
            <div style="background-color: #faf2ea; border: 1.5px solid #d39f6f; border-radius: 12px; padding: 22px; margin: 24px 0;">
              <h3 style="margin: 0 0 14px 0; color: #5a2c1e; font-size: 15px; font-weight: bold;">
                ${isEn ? "Member Area Login Details:" : "Detail Akses Login Member Area:"}
              </h3>
              <table style="width: 100%; border-collapse: collapse; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #efe3d0;">
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; color: #8f5a43; width: 38%; border-bottom: 1px solid #f8f1ec;">${isEn ? "Login Email" : "Email Login"}</td>
                  <td style="padding: 12px 16px; font-size: 13px; color: #2a120c; font-weight: 600; border-bottom: 1px solid #f8f1ec;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; font-size: 13px; color: #8f5a43;">${isEn ? "Temporary Password" : "Password Sementara"}</td>
                  <td style="padding: 12px 16px; font-size: 14px; color: #a8673c; font-family: monospace; font-weight: bold; letter-spacing: 1px;">${tempPassword}</td>
                </tr>
              </table>
              <div style="margin-top: 20px; text-align: center;">
                <a href="https://wazzopi.vercel.app/login" style="display: inline-block; background-color: #4a2117; color: #fbf5ea; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 13px; font-weight: bold; box-shadow: 0 2px 6px rgba(74, 33, 23, 0.2);">
                  ${isEn ? "Sign In to Member Area &rarr;" : "Masuk ke Member Area &rarr;"}
                </a>
              </div>
            </div>

            <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px 16px; margin: 20px 0;">
              <p style="margin: 0; font-size: 12px; color: #92400e; line-height: 1.5;">
                ${
                  isEn
                    ? "<strong>Security Tip:</strong> For your account security, please update your temporary password in <strong>Account Settings</strong> after signing in."
                    : "<strong>Tips Keamanan:</strong> Demi kenyamanan Anda, segera perbarui password Anda di menu <strong>Pengaturan Akun</strong> setelah Anda berhasil masuk ke Member Area."
                }
              </p>
            </div>

            <!-- Bantuan / Kontak -->
            <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #efe3d0; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #8f5a43;">
                ${isEn ? "Need help with your account or order?" : "Butuh bantuan terkait akun atau pesanan Anda?"}
              </p>
              <a href="https://wa.me/${whatsappContact.replace(/[^0-9]/g, "")}" style="display: inline-block; color: #4a2117; font-weight: 600; font-size: 13px; text-decoration: none;">
                ${isEn ? "Contact Customer Care via WhatsApp &rarr;" : "Hubungi Customer Care via WhatsApp &rarr;"}
              </a>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color: #2a120c; padding: 24px; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #e4c5a0;">
              &copy; ${new Date().getFullYear()} ${storeName}. ${isEn ? "All rights reserved." : "Hak cipta dilindungi."}
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
    const isEn = params.locale === "en";
    const htmlContent = generateNewAccountEmailHtml(params);
    const subject = isEn
      ? `Member Account Access Details - ${params.storeName || "Wazzopi"}`
      : `Detail Akses Login Member ${params.storeName || "Wazzopi"}`;
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
    locale?: "en" | "id";
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

    // Deteksi bahasa aktif: prioritas opsi eksplisit -> metadata catatan pesanan [LANG:xx] -> server locale
    let detectedLocale: "en" | "id" = "id";
    if (options?.locale) {
      detectedLocale = options.locale;
    } else if (order.notes) {
      const match = order.notes.match(/\[LANG:(en|id)\]/i);
      if (match) {
        detectedLocale = match[1].toLowerCase() as "en" | "id";
      } else {
        detectedLocale = await getServerLocale();
      }
    } else {
      detectedLocale = await getServerLocale();
    }

    const customerRes = await sendOrderStatusEmail({
      status: effectiveStatus,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      orderNo: order.orderNo,
      locale: detectedLocale,
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
      whatsappContact: getStoreWhatsApp(settings),
    });

    // Jika status pesanan berubah menjadi LUNAS (PAID), kirimkan juga notifikasi ke Admin
    if (effectiveStatus === "PAID") {
      try {
        await sendAdminOrderPaidEmail({
          orderNo: order.orderNo,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          locale: detectedLocale,
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
          storeName: settings.general.storeName,
        });
      } catch (adminPaidErr) {
        console.error("[sendAdminOrderPaidEmail Error]:", adminPaidErr);
      }
    }

    return customerRes;
  } catch (error: any) {
    console.error("[sendOrderNotificationByOrderId error]:", error);
    return { success: false, error: error?.message || "Gagal mengirim notifikasi email" };
  }
}

/**
 * Mengambil email resmi admin/toko untuk pengiriman notifikasi internal
 */
export async function getAdminNotificationEmail(): Promise<string | null> {
  try {
    const settings = await getSettings();
    if (settings.general.email && settings.general.email.trim()) {
      return settings.general.email.trim();
    }
    const adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { email: true },
    });
    return adminUser?.email || null;
  } catch {
    return null;
  }
}

export type SendAdminNewUserEmailParams = {
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  registrationSource: string;
  storeName?: string;
  locale?: "en" | "id";
};

export type SendAdminOrderNotificationParams = {
  orderNo: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderEmailItem[];
  totalAmount: number;
  shippingAddress: string;
  shippingMethod: string;
  paymentMethod: string;
  storeName?: string;
  locale?: "en" | "id";
};

/**
 * Notifikasi ke Email Admin: Pelanggan Baru Terdaftar
 */
export async function sendAdminNewUserEmail(
  params: SendAdminNewUserEmailParams
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const adminEmail = await getAdminNotificationEmail();
    if (!adminEmail) {
      return { success: false, error: "Email admin belum dikonfigurasi" };
    }

    const isEn = params.locale === "en";
    const storeName = params.storeName || "Wazzopi";
    const subject = isEn
      ? `[New Member] ${params.customerName} Has Registered at ${storeName}`
      : `[Member Baru] ${params.customerName} Telah Terdaftar di ${storeName}`;
    const nowStr = new Date().toLocaleString(isEn ? "en-US" : "id-ID", {
      dateStyle: "full",
      timeStyle: "short",
    });

    const regSource =
      isEn && params.registrationSource === "Pemesanan Pertama (Checkout Otomatis)"
        ? "First Order (Automatic Checkout)"
        : params.registrationSource;

    const html = `
      <!DOCTYPE html>
      <html lang="${isEn ? "en" : "id"}">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f7f3ee; margin: 0; padding: 24px 12px; color: #2a120c;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #efe3d0; box-shadow: 0 4px 12px rgba(42, 18, 12, 0.05);">
          <tr>
            <td style="background-color: #381a12; padding: 24px; text-align: center;">
              <h1 style="color: #fbf5ea; margin: 0; font-size: 22px; font-weight: bold;">
                ${storeName} &mdash; ${isEn ? "Administrator Panel" : "Panel Administrator"}
              </h1>
              <p style="color: #d39f6f; margin: 4px 0 0 0; font-size: 12px;">
                ${isEn ? "New Customer Notification" : "Notifikasi Pelanggan Baru"}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 24px;">
              <div style="display: inline-block; background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 20px; padding: 4px 12px; font-size: 11px; font-weight: bold; color: #1e40af; margin-bottom: 16px; text-transform: uppercase;">
                ${isEn ? "NEW MEMBER" : "MEMBER BARU"}
              </div>
              <h2 style="margin: 0 0 12px 0; color: #2a120c; font-size: 18px; font-weight: bold;">
                ${isEn ? "A New Customer Has Registered!" : "Pelanggan Baru Telah Terdaftar!"}
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 13px; color: #6e3a28; line-height: 1.5;">
                ${
                  isEn
                    ? `A new member account has been registered on the ${storeName} store. Customer details:`
                    : `Ada akun member baru yang terdaftar di toko online ${storeName}. Berikut adalah rincian data pelanggan:`
                }
              </p>
              <table style="width: 100%; border-collapse: collapse; background: #faf5ee; border-radius: 8px; overflow: hidden; border: 1px solid #efe3d0; font-size: 13px;">
                <tr>
                  <td style="padding: 10px 14px; color: #8f5a43; width: 38%; border-bottom: 1px solid #f0e6dc;">${isEn ? "Full Name" : "Nama Lengkap"}</td>
                  <td style="padding: 10px 14px; color: #2a120c; font-weight: 600; border-bottom: 1px solid #f0e6dc;">${params.customerName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #8f5a43; border-bottom: 1px solid #f0e6dc;">Email</td>
                  <td style="padding: 10px 14px; color: #2a120c; font-weight: 600; border-bottom: 1px solid #f0e6dc;">${params.customerEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #8f5a43; border-bottom: 1px solid #f0e6dc;">${isEn ? "Phone / WhatsApp" : "No. Telepon / WA"}</td>
                  <td style="padding: 10px 14px; color: #2a120c; border-bottom: 1px solid #f0e6dc;">${params.customerPhone || "-"}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #8f5a43; border-bottom: 1px solid #f0e6dc;">${isEn ? "Registration Method" : "Metode Pendaftaran"}</td>
                  <td style="padding: 10px 14px; color: #2a120c; border-bottom: 1px solid #f0e6dc;">${regSource}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #8f5a43;">${isEn ? "Registration Date" : "Waktu Terdaftar"}</td>
                  <td style="padding: 10px 14px; color: #2a120c;">${nowStr}</td>
                </tr>
              </table>
              <div style="margin-top: 24px; text-align: center;">
                <a href="https://wazzopi.vercel.app/admin/customers" style="display: inline-block; background-color: #4a2117; color: #fbf5ea; text-decoration: none; padding: 10px 24px; border-radius: 8px; font-size: 13px; font-weight: bold;">
                  ${isEn ? "View Customers in Admin &rarr;" : "Lihat Daftar Pelanggan di Admin &rarr;"}
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #2a120c; padding: 16px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #e4c5a0;">
                ${isEn ? `Internal system notification email from ${storeName}.` : `Email pemberitahuan sistem internal ${storeName}.`}
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    return await sendRawMail({ to: adminEmail, subject, html });
  } catch (err: any) {
    console.error("[sendAdminNewUserEmail Error]:", err);
    return { success: false, error: err?.message || "Gagal mengirim email admin" };
  }
}

/**
 * Notifikasi ke Email Admin: Pesanan Baru Masuk (Order Dibuat)
 */
export async function sendAdminNewOrderEmail(
  params: SendAdminOrderNotificationParams
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const adminEmail = await getAdminNotificationEmail();
    if (!adminEmail) {
      return { success: false, error: "Email admin belum dikonfigurasi" };
    }

    const isEn = params.locale === "en";
    const storeName = params.storeName || "Wazzopi";
    const paymentLabel = PAYMENT_LABEL[params.paymentMethod] || params.paymentMethod;
    const subject = isEn
      ? `[New Order] #${params.orderNo} - ${formatIDR(params.totalAmount)} (${params.customerName})`
      : `[Pesanan Masuk] #${params.orderNo} - ${formatIDR(params.totalAmount)} (${params.customerName})`;
    const nowStr = new Date().toLocaleString(isEn ? "en-US" : "id-ID", {
      dateStyle: "full",
      timeStyle: "short",
    });

    const itemsHtml = params.items
      .map(
        (it) => `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #efe3d0; font-size: 13px; color: #2a120c;">
            <strong>${it.productName}</strong>
            ${it.variantName ? `<br><span style="font-size: 11px; color: #8f5a43;">${it.variantName}</span>` : ""}
          </td>
          <td style="padding: 8px 0; border-bottom: 1px solid #efe3d0; font-size: 13px; text-align: center;">
            ${it.quantity}x
          </td>
          <td style="padding: 8px 0; border-bottom: 1px solid #efe3d0; font-size: 13px; text-align: right; font-weight: 600;">
            ${formatIDR(it.total)}
          </td>
        </tr>
      `
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html lang="${isEn ? "en" : "id"}">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f7f3ee; margin: 0; padding: 24px 12px; color: #2a120c;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #efe3d0; box-shadow: 0 4px 12px rgba(42, 18, 12, 0.05);">
          <tr>
            <td style="background-color: #381a12; padding: 24px; text-align: center;">
              <h1 style="color: #fbf5ea; margin: 0; font-size: 22px; font-weight: bold;">
                ${storeName} &mdash; ${isEn ? "Administrator Panel" : "Panel Administrator"}
              </h1>
              <p style="color: #d39f6f; margin: 4px 0 0 0; font-size: 12px;">
                ${isEn ? "New Order Received" : "Pesanan Baru Masuk"}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 24px;">
              <div style="display: inline-block; background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 20px; padding: 4px 12px; font-size: 11px; font-weight: bold; color: #92400e; margin-bottom: 16px; text-transform: uppercase;">
                ${isEn ? "AWAITING PAYMENT" : "MENUNGGU PEMBAYARAN"}
              </div>
              <h2 style="margin: 0 0 8px 0; color: #2a120c; font-size: 18px; font-weight: bold;">
                ${isEn ? `New Order #${params.orderNo}` : `Pesanan Baru #${params.orderNo}`}
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 13px; color: #6e3a28;">
                ${isEn ? `A new order was placed on ${nowStr}.` : `Ada pesanan baru masuk pada ${nowStr}.`}
              </p>

              <!-- Informasi Customer -->
              <table style="width: 100%; border-collapse: collapse; background: #faf5ee; border-radius: 8px; overflow: hidden; border: 1px solid #efe3d0; font-size: 13px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 10px 14px; color: #8f5a43; width: 35%; border-bottom: 1px solid #f0e6dc;">${isEn ? "Customer" : "Pelanggan"}</td>
                  <td style="padding: 10px 14px; color: #2a120c; font-weight: 600; border-bottom: 1px solid #f0e6dc;">${params.customerName} (${params.customerEmail})</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #8f5a43; border-bottom: 1px solid #f0e6dc;">${isEn ? "Phone / WhatsApp" : "No. Telepon / WA"}</td>
                  <td style="padding: 10px 14px; color: #2a120c; border-bottom: 1px solid #f0e6dc;">${params.customerPhone}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #8f5a43; border-bottom: 1px solid #f0e6dc;">${isEn ? "Shipping Address" : "Alamat Kirim"}</td>
                  <td style="padding: 10px 14px; color: #2a120c; border-bottom: 1px solid #f0e6dc;">${params.shippingAddress}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #8f5a43; border-bottom: 1px solid #f0e6dc;">${isEn ? "Courier" : "Kurir"}</td>
                  <td style="padding: 10px 14px; color: #2a120c; border-bottom: 1px solid #f0e6dc;">${params.shippingMethod}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #8f5a43;">${isEn ? "Payment Method" : "Metode Bayar"}</td>
                  <td style="padding: 10px 14px; color: #2a120c; font-weight: 600;">${paymentLabel}</td>
                </tr>
              </table>

              <!-- Tabel Item -->
              <h3 style="margin: 0 0 10px 0; color: #5a2c1e; font-size: 14px; font-weight: bold;">
                ${isEn ? "Product Details" : "Rincian Produk"}
              </h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
                <thead>
                  <tr style="border-bottom: 2px solid #efe3d0; text-align: left; font-size: 11px; color: #8f5a43; text-transform: uppercase;">
                    <th style="padding: 6px 0;">${isEn ? "Product" : "Produk"}</th>
                    <th style="padding: 6px 0; text-align: center;">Qty</th>
                    <th style="padding: 6px 0; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div style="background-color: #faf5ee; border-radius: 8px; padding: 14px; border: 1px solid #efe3d0; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <span style="font-size: 13px; font-weight: 600; color: #5a2c1e;">${isEn ? "Total Order Amount:" : "Total Tagihan Pesanan:"}</span>
                <span style="font-size: 18px; font-weight: bold; color: #2a120c;">${formatIDR(params.totalAmount)}</span>
              </div>

              <div style="text-align: center;">
                <a href="https://wazzopi.vercel.app/admin/orders" style="display: inline-block; background-color: #4a2117; color: #fbf5ea; text-decoration: none; padding: 10px 24px; border-radius: 8px; font-size: 13px; font-weight: bold;">
                  ${isEn ? "Open Order in Admin Panel &rarr;" : "Buka Pesanan di Panel Admin &rarr;"}
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #2a120c; padding: 16px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #e4c5a0;">
                ${isEn ? `Internal system notification email from ${storeName}.` : `Email pemberitahuan sistem internal ${storeName}.`}
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    return await sendRawMail({ to: adminEmail, subject, html });
  } catch (err: any) {
    console.error("[sendAdminNewOrderEmail Error]:", err);
    return { success: false, error: err?.message || "Gagal mengirim email pesanan admin" };
  }
}

/**
 * Notifikasi ke Email Admin: Pembayaran Pesanan Telah Lunas (PAID)
 */
export async function sendAdminOrderPaidEmail(
  params: SendAdminOrderNotificationParams
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const adminEmail = await getAdminNotificationEmail();
    if (!adminEmail) {
      return { success: false, error: "Email admin belum dikonfigurasi" };
    }

    const isEn = params.locale === "en";
    const storeName = params.storeName || "Wazzopi";
    const paymentLabel = PAYMENT_LABEL[params.paymentMethod] || params.paymentMethod;
    const subject = isEn
      ? `[Payment Received] Order #${params.orderNo} Paid - ${formatIDR(params.totalAmount)} (${params.customerName})`
      : `[Pembayaran Lunas] Pesanan #${params.orderNo} Telah Lunas - ${formatIDR(params.totalAmount)} (${params.customerName})`;
    const nowStr = new Date().toLocaleString(isEn ? "en-US" : "id-ID", {
      dateStyle: "full",
      timeStyle: "short",
    });

    const itemsHtml = params.items
      .map(
        (it) => `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #efe3d0; font-size: 13px; color: #2a120c;">
            <strong>${it.productName}</strong>
            ${it.variantName ? `<br><span style="font-size: 11px; color: #8f5a43;">${it.variantName}</span>` : ""}
          </td>
          <td style="padding: 8px 0; border-bottom: 1px solid #efe3d0; font-size: 13px; text-align: center;">
            ${it.quantity}x
          </td>
          <td style="padding: 8px 0; border-bottom: 1px solid #efe3d0; font-size: 13px; text-align: right; font-weight: 600;">
            ${formatIDR(it.total)}
          </td>
        </tr>
      `
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html lang="${isEn ? "en" : "id"}">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f7f3ee; margin: 0; padding: 24px 12px; color: #2a120c;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #efe3d0; box-shadow: 0 4px 12px rgba(42, 18, 12, 0.05);">
          <tr>
            <td style="background-color: #381a12; padding: 24px; text-align: center;">
              <h1 style="color: #fbf5ea; margin: 0; font-size: 22px; font-weight: bold;">
                ${storeName} &mdash; ${isEn ? "Administrator Panel" : "Panel Administrator"}
              </h1>
              <p style="color: #d39f6f; margin: 4px 0 0 0; font-size: 12px;">
                ${isEn ? "Payment Confirmed Notification" : "Notifikasi Pembayaran Lunas"}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 24px;">
              <div style="display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 20px; padding: 4px 12px; font-size: 11px; font-weight: bold; color: #065f46; margin-bottom: 16px; text-transform: uppercase;">
                ${isEn ? "PAYMENT RECEIVED" : "PEMBAYARAN LUNAS"}
              </div>
              <h2 style="margin: 0 0 8px 0; color: #2a120c; font-size: 18px; font-weight: bold;">
                ${isEn ? `Payment Received for Order #${params.orderNo}!` : `Pembayaran Diterima untuk Pesanan #${params.orderNo}!`}
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 13px; color: #6e3a28; line-height: 1.5;">
                ${
                  isEn
                    ? `Payment from <strong>${params.customerName}</strong> amounting to <strong>${formatIDR(params.totalAmount)}</strong> has been verified on ${nowStr}. Please prepare the items and process the shipment.`
                    : `Pembayaran dari <strong>${params.customerName}</strong> sebesar <strong>${formatIDR(params.totalAmount)}</strong> telah berhasil diverifikasi pada ${nowStr}. Silakan siapkan produk dan proses pesanan untuk pengiriman.`
                }
              </p>

              <!-- Informasi Ringkas -->
              <table style="width: 100%; border-collapse: collapse; background: #faf5ee; border-radius: 8px; overflow: hidden; border: 1px solid #efe3d0; font-size: 13px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 10px 14px; color: #8f5a43; width: 35%; border-bottom: 1px solid #f0e6dc;">${isEn ? "Order No." : "No. Pesanan"}</td>
                  <td style="padding: 10px 14px; color: #2a120c; font-weight: bold; border-bottom: 1px solid #f0e6dc;">#${params.orderNo}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #8f5a43; border-bottom: 1px solid #f0e6dc;">${isEn ? "Payment Method" : "Metode Pembayaran"}</td>
                  <td style="padding: 10px 14px; color: #2a120c; font-weight: 600; border-bottom: 1px solid #f0e6dc;">${paymentLabel}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #8f5a43; border-bottom: 1px solid #f0e6dc;">${isEn ? "Shipping Courier" : "Kurir Pengiriman"}</td>
                  <td style="padding: 10px 14px; color: #2a120c; border-bottom: 1px solid #f0e6dc;">${params.shippingMethod}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #8f5a43;">${isEn ? "Delivery Address" : "Alamat Penerima"}</td>
                  <td style="padding: 10px 14px; color: #2a120c;">${params.shippingAddress} (${isEn ? "Phone" : "HP"}: ${params.customerPhone})</td>
                </tr>
              </table>

              <!-- Tabel Item -->
              <h3 style="margin: 0 0 10px 0; color: #5a2c1e; font-size: 14px; font-weight: bold;">
                ${isEn ? "Items to Pack" : "Produk yang Perlu Dikemas"}
              </h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
                <thead>
                  <tr style="border-bottom: 2px solid #efe3d0; text-align: left; font-size: 11px; color: #8f5a43; text-transform: uppercase;">
                    <th style="padding: 6px 0;">${isEn ? "Product" : "Produk"}</th>
                    <th style="padding: 6px 0; text-align: center;">Qty</th>
                    <th style="padding: 6px 0; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div style="background-color: #ecfdf5; border-radius: 8px; padding: 14px; border: 1px solid #a7f3d0; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <span style="font-size: 13px; font-weight: 600; color: #065f46;">${isEn ? "Total Funds Received:" : "Total Dana Masuk:"}</span>
                <span style="font-size: 18px; font-weight: bold; color: #065f46;">${formatIDR(params.totalAmount)}</span>
              </div>

              <div style="text-align: center;">
                <a href="https://wazzopi.vercel.app/admin/orders" style="display: inline-block; background-color: #065f46; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 8px; font-size: 13px; font-weight: bold;">
                  ${isEn ? "Process & Print Shipping Label &rarr;" : "Proses & Cetak Label Pengiriman &rarr;"}
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #2a120c; padding: 16px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #e4c5a0;">
                ${isEn ? `Internal system notification email from ${storeName}.` : `Email pemberitahuan sistem internal ${storeName}.`}
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    return await sendRawMail({ to: adminEmail, subject, html });
  } catch (err: any) {
    console.error("[sendAdminOrderPaidEmail Error]:", err);
    return { success: false, error: err?.message || "Gagal mengirim email lunas admin" };
  }
}
