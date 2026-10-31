"use client";

import { useActionState } from "react";
import { updateProfile } from "@/actions/account";
import { Alert, Button, Field, Input, Textarea } from "@/components/ui";
import { CityProvinceSelector } from "@/components/shop/city-province-selector";
import { useI18n } from "@/i18n/provider";

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
  const { locale } = useI18n();
  const isEn = locale === "en";

  return (
    <form action={formAction} className="space-y-3">
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      {state?.success && <Alert tone="success">{state.success}</Alert>}

      <Field label={isEn ? "Full Name" : "Nama Lengkap"}>
        <Input name="name" defaultValue={user.name} required />
      </Field>

      <Field label={isEn ? "Phone / WhatsApp" : "Nomor Telepon / WA"}>
        <Input name="phone" defaultValue={user.phone || ""} />
      </Field>

      <Field label={isEn ? "Street Address" : "Alamat Lengkap"}>
        <Textarea
          name="address"
          defaultValue={user.address || ""}
          placeholder={isEn ? "Street address, building, etc." : "Alamat rumah..."}
        />
      </Field>

      <div>
        <CityProvinceSelector
          defaultCity={user.city || ""}
          defaultProvince={user.province || ""}
          defaultPostalCode={user.postalCode || ""}
          showPostalCode={true}
          required={false}
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full justify-center">
        {isPending ? (isEn ? "Saving..." : "Menyimpan...") : (isEn ? "Save Profile" : "Simpan Profil")}
      </Button>
    </form>
  );
}
