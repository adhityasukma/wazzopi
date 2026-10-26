"use client";

import { useActionState, useEffect } from "react";
import Image from "next/image";
import { Lock, Mail, ShieldAlert } from "lucide-react";
import { adminLogin } from "@/actions/auth";
import { Alert, Button, Field, Input } from "@/components/ui";
import { useAppLoading } from "@/components/loading-provider";

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(adminLogin, undefined);
  const { showLoading, hideLoading } = useAppLoading();

  useEffect(() => {
    if (isPending) {
      showLoading("Memverifikasi akun admin...");
    } else {
      hideLoading();
    }
  }, [isPending, showLoading, hideLoading]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-espresso-900 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-espresso-700 bg-white p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <Image src="/logo-mark.png" alt="Wazzopi" width={60} height={60} priority />
          </div>
          <h1 className="text-2xl font-bold text-espresso-900">Admin Panel Wazzopi</h1>
          <p className="mt-1 text-sm text-espresso-500">Satu Teguk, Banyak Cerita</p>
        </div>

        {state?.error && (
          <Alert tone="error" className="mt-6">
            {state.error}
          </Alert>
        )}

        <form action={formAction} className="mt-6 space-y-4">
          <Field label="Email Pegawai / Admin">
            <Input
              name="email"
              type="email"
              required
              placeholder="admin@wazzopi.com"
              defaultValue="admin@wazzopi.com"
            />
          </Field>

          <Field label="Password">
            <Input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              defaultValue="admin123"
            />
          </Field>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full justify-center h-11 text-base font-semibold"
          >
            {isPending ? "Memverifikasi..." : "Masuk ke Panel"}
          </Button>
        </form>

        <div className="mt-6 rounded-lg bg-espresso-50 p-4 text-xs text-espresso-700">
          <p className="font-semibold text-espresso-900 mb-1">Akses Cepat Demo:</p>
          <div className="space-y-1">
            <p>
              <strong>Administrator:</strong> <code className="font-mono">admin@wazzopi.com</code> / <code className="font-mono">admin123</code>
            </p>
            <p>
              <strong>Karyawan:</strong> <code className="font-mono">karyawan@wazzopi.com</code> / <code className="font-mono">karyawan123</code>
            </p>
          </div>
          <p className="mt-2 text-[11px] text-espresso-500 italic">
            *Role Karyawan hanya memiliki akses untuk Menambah Produk.
          </p>
        </div>
      </div>
    </div>
  );
}
