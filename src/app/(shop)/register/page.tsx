"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register } from "@/actions/auth";
import { Alert, Button, Field, Input } from "@/components/ui";
import { useI18n } from "@/i18n/provider";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(register, undefined);
  const { locale } = useI18n();
  const isEn = locale === "en";

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-latte bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-espresso-900">
            {isEn ? "Create Member Account" : "Daftar Akun Member"}
          </h1>
          <p className="mt-1 text-sm text-espresso-500">
            {isEn
              ? "Join Wazzopi and enjoy a seamless artisan coffee shopping experience."
              : "Bergabung bersama Wazzopi dan nikmati kenyamanan berbelanja."}
          </p>
        </div>

        {state?.error && (
          <Alert tone="error" className="mt-6">
            {state.error}
          </Alert>
        )}

        <form action={formAction} className="mt-6 space-y-4">
          <Field label={isEn ? "Full Name" : "Nama Lengkap"}>
            <Input name="name" required placeholder={isEn ? "Your Name" : "Nama Anda"} />
          </Field>

          <Field label={isEn ? "Email Address" : "Alamat Email"}>
            <Input name="email" type="email" required placeholder={isEn ? "name@example.com" : "nama@email.com"} />
          </Field>

          <Field label={isEn ? "Phone Number / WhatsApp" : "Nomor Telepon / WhatsApp"}>
            <Input name="phone" type="tel" required placeholder="081234567890" />
          </Field>

          <Field label={isEn ? "Password" : "Password"}>
            <Input name="password" type="password" required placeholder={isEn ? "At least 6 characters" : "Minimal 6 karakter"} />
          </Field>

          <Field label={isEn ? "Confirm Password" : "Konfirmasi Password"}>
            <Input name="confirm" type="password" required placeholder={isEn ? "Retype password" : "Ketik ulang password"} />
          </Field>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full justify-center h-11 text-base font-semibold"
          >
            {isPending
              ? (isEn ? "Creating Account..." : "Mendaftarkan...")
              : (isEn ? "Create Account" : "Daftar Akun")}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-espresso-500">
          {isEn ? "Already have an account? " : "Sudah memiliki akun? "}
          <Link href="/login" className="font-semibold text-caramel-600 hover:underline">
            {isEn ? "Sign In Here" : "Masuk di Sini"}
          </Link>
        </div>
      </div>
    </div>
  );
}
