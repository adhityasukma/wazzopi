"use client";

import { useActionState } from "react";
import { changePassword } from "@/actions/account";
import { Alert, Button, Field, Input } from "@/components/ui";

export function AccountPasswordForm() {
  const [state, formAction, isPending] = useActionState(changePassword, undefined);

  return (
    <form action={formAction} className="space-y-3">
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      {state?.success && <Alert tone="success">{state.success}</Alert>}

      <Field label="Password Saat Ini">
        <Input name="current" type="password" required placeholder="••••••••" />
      </Field>

      <Field label="Password Baru">
        <Input name="password" type="password" required placeholder="Minimal 6 karakter" />
      </Field>

      <Field label="Ulangi Password Baru">
        <Input name="confirm" type="password" required placeholder="••••••••" />
      </Field>

      <Button type="submit" variant="secondary" disabled={isPending} className="w-full justify-center">
        {isPending ? "Mengubah..." : "Ubah Password"}
      </Button>
    </form>
  );
}
