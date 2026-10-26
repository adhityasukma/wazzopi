"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { customerLogin } from "@/actions/auth";
import { Alert, Button, Field, Input } from "@/components/ui";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(customerLogin, undefined);
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/account";

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-latte bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-espresso-900">Masuk Akun</h1>
          <p className="mt-1 text-sm text-espresso-500">
            Masuk untuk melihat pesanan dan mempercepat belanja Anda.
          </p>
        </div>

        {state?.error && (
          <Alert tone="error" className="mt-6">
            {state.error}
          </Alert>
        )}

        <form action={formAction} className="mt-6 space-y-4">
          <input type="hidden" name="next" value={next} />

          <Field label="Alamat Email">
            <Input
              name="email"
              type="email"
              required
              placeholder="nama@email.com"
              defaultValue="customer@wazzopi.com"
            />
          </Field>

          <Field label="Password">
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
            {isPending ? "Sedang Masuk..." : "Masuk"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-espresso-500">
          Belum punya akun?{" "}
          <Link href="/register" className="font-semibold text-caramel-600 hover:underline">
            Daftar Sekarang
          </Link>
        </div>

        <div className="mt-6 rounded-lg bg-latte/50 p-3 text-xs text-espresso-600">
          <p className="font-semibold">Akun Demo Customer:</p>
          <p>Email: <code className="font-mono">customer@wazzopi.com</code></p>
          <p>Password: <code className="font-mono">customer123</code></p>
        </div>
      </div>
    </div>
  );
}
