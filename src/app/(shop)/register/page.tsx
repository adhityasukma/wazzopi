"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register } from "@/actions/auth";
import { Alert, Button, Field, Input } from "@/components/ui";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(register, undefined);

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-latte bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-espresso-900">Daftar Akun Member</h1>
          <p className="mt-1 text-sm text-espresso-500">
            Bergabung bersama Wazzopi dan nikmati kenyamanan berbelanja.
          </p>
        </div>

        {state?.error && (
          <Alert tone="error" className="mt-6">
            {state.error}
          </Alert>
        )}

        <form action={formAction} className="mt-6 space-y-4">
          <Field label="Nama Lengkap">
            <Input name="name" required placeholder="Nama Anda" />
          </Field>

          <Field label="Alamat Email">
            <Input name="email" type="email" required placeholder="nama@email.com" />
          </Field>

          <Field label="Nomor Telepon / WhatsApp">
            <Input name="phone" type="tel" required placeholder="081234567890" />
          </Field>

          <Field label="Password">
            <Input name="password" type="password" required placeholder="Minimal 6 karakter" />
          </Field>

          <Field label="Konfirmasi Password">
            <Input name="confirm" type="password" required placeholder="Ketik ulang password" />
          </Field>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full justify-center h-11 text-base font-semibold"
          >
            {isPending ? "Mendaftarkan..." : "Daftar Akun"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-espresso-500">
          Sudah memiliki akun?{" "}
          <Link href="/login" className="font-semibold text-caramel-600 hover:underline">
            Masuk di Sini
          </Link>
        </div>
      </div>
    </div>
  );
}
