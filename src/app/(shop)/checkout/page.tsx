import { redirect } from "next/navigation";
import { getSettings } from "@/lib/settings";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CheckoutForm } from "@/components/shop/checkout-form";

export const metadata = {
  title: "Checkout Pesanan",
};

export default async function CheckoutPage() {
  const [settings, session] = await Promise.all([
    getSettings(),
    getSession(),
  ]);

  let customerData = null;
  if (session?.id) {
    customerData = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        province: true,
        postalCode: true,
      },
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="border-b border-latte pb-6">
        <h1 className="text-3xl font-semibold text-espresso-900 md:text-4xl">Checkout Pembayaran</h1>
        <p className="mt-1 text-sm text-espresso-400">Lengkapi detail pengiriman dan pembayaran pesanan Anda.</p>
      </div>

      <div className="mt-8">
        <CheckoutForm
          settings={settings}
          customer={customerData}
        />
      </div>
    </div>
  );
}
