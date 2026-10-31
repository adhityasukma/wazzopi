"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { customerLogin } from "@/actions/auth";
import { Alert, Button, Field, Input } from "@/components/ui";
import { useI18n } from "@/i18n/provider";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(customerLogin, undefined);
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/account";
  const { locale } = useI18n();
  const isEn = locale === "en";

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-latte bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-espresso-900">
            {isEn ? "Sign In to Your Account" : "Masuk Akun"}
          </h1>
          <p className="mt-1 text-sm text-espresso-500">
            {isEn
              ? "Sign in to track your shipments and view past order history."
              : "Masuk untuk melihat pesanan dan mempercepat belanja Anda."}
          </p>
        </div>

        {state?.error && (
          <Alert tone="error" className="mt-6">
            {state.error}
          </Alert>
        )}

        <form action={formAction} className="mt-6 space-y-4">
          <input type="hidden" name="next" value={next} />

          <Field label={isEn ? "Email Address" : "Alamat Email"}>
            <Input
              name="email"
              type="email"
              required
              placeholder="name@example.com"
              defaultValue="customer@wazzopi.com"
            />
          </Field>

          <Field label={isEn ? "Password" : "Password"}>
            <Input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              defaultValue="customer123"
            />
          </Field>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full justify-center h-11 text-base font-semibold"
          >
            {isPending
              ? (isEn ? "Signing In..." : "Sedang Masuk...")
              : (isEn ? "Sign In" : "Masuk")}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-espresso-500">
          {isEn ? "Don't have an account yet? " : "Belum punya akun? "}
          <Link href="/register" className="font-semibold text-caramel-600 hover:underline">
            {isEn ? "Create Account" : "Daftar Sekarang"}
          </Link>
        </div>
      </div>
    </div>
  );
}
