"use client";

import { useActionState } from "react";
import { updateProfile } from "@/actions/account";
import { Alert, Button, Field, Input, Textarea } from "@/components/ui";

type UserProps = {
  name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
};

export function AccountProfileForm({ user }: { user: UserProps }) {
  const [state, formAction, isPending] = useActionState(updateProfile, undefined);

  return (
    <form action={formAction} className="space-y-3">
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      {state?.success && <Alert tone="success">{state.success}</Alert>}

      <Field label="Nama Lengkap">
        <Input name="name" defaultValue={user.name} required />
      </Field>

      <Field label="Nomor Telepon / WA">
        <Input name="phone" defaultValue={user.phone || ""} />
      </Field>

      <Field label="Alamat Lengkap">
        <Textarea name="address" defaultValue={user.address || ""} placeholder="Alamat rumah..." />
      </Field>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Kota">
          <Input name="city" defaultValue={user.city || ""} />
        </Field>
        <Field label="Provinsi">
          <Input name="province" defaultValue={user.province || ""} />
        </Field>
      </div>

      <Field label="Kode Pos">
        <Input name="postalCode" defaultValue={user.postalCode || ""} />
      </Field>

      <Button type="submit" disabled={isPending} className="w-full justify-center">
        {isPending ? "Menyimpan..." : "Simpan Profil"}
      </Button>
    </form>
  );
}
