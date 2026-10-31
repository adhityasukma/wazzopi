"use client";

import { useActionState, useState, useEffect } from "react";
import { Check, X, Eye, EyeOff } from "lucide-react";
import { changePassword } from "@/actions/account";
import { Alert, Button, Field, Input } from "@/components/ui";
import { useI18n } from "@/i18n/provider";

export function AccountPasswordForm() {
  const [state, formAction, isPending] = useActionState(changePassword, undefined);
  const { locale } = useI18n();
  const isEn = locale === "en";

  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Reset form saat berhasil
  useEffect(() => {
    if (state?.success) {
      setCurrent("");
      setPassword("");
      setConfirm("");
    }
  }, [state?.success]);

  // Kriteria keamanan kata sandi
  const criteria = [
    {
      id: "length",
      label: isEn ? "At least 8 characters" : "Minimal 8 karakter",
      isValid: password.length >= 8,
    },
    {
      id: "uppercase",
      label: isEn ? "Uppercase letter (A-Z)" : "Kombinasi huruf besar (A-Z)",
      isValid: /[A-Z]/.test(password),
    },
    {
      id: "lowercase",
      label: isEn ? "Lowercase letter (a-z)" : "Kombinasi huruf kecil (a-z)",
      isValid: /[a-z]/.test(password),
    },
    {
      id: "number",
      label: isEn ? "Contains a number (0-9)" : "Mengandung angka (0-9)",
      isValid: /[0-9]/.test(password),
    },
  ];

  const allCriteriaMet = criteria.every((c) => c.isValid);
  const isConfirmMatch = confirm.length > 0 && confirm === password;
  const isFormValid = current.length > 0 && allCriteriaMet && isConfirmMatch;

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      {state?.success && <Alert tone="success">{state.success}</Alert>}

      {/* Password Saat Ini */}
      <Field label={isEn ? "Current Password" : "Password Saat Ini"}>
        <div className="relative">
          <Input
            name="current"
            type={showCurrent ? "text" : "password"}
            required
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            placeholder={isEn ? "Enter current password" : "Masukkan password saat ini"}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowCurrent(!showCurrent)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-espresso-400 hover:text-espresso-700 transition-colors p-0.5 cursor-pointer"
            tabIndex={-1}
            aria-label={showCurrent ? (isEn ? "Hide password" : "Sembunyikan password") : (isEn ? "Show password" : "Tampilkan password")}
          >
            {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </Field>

      {/* Password Baru */}
      <Field label={isEn ? "New Password" : "Password Baru"}>
        <div className="relative">
          <Input
            name="password"
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isEn ? "Minimum 8 characters" : "Minimal 8 karakter"}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-espresso-400 hover:text-espresso-700 transition-colors p-0.5 cursor-pointer"
            tabIndex={-1}
            aria-label={showPassword ? (isEn ? "Hide password" : "Sembunyikan password") : (isEn ? "Show password" : "Tampilkan password")}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </Field>

      {/* Checklist Validasi Keamanan Kata Sandi */}
      <div className="rounded-xl border border-latte bg-espresso-50/40 p-3.5 space-y-2">
        <span className="text-[11px] font-semibold text-espresso-700 block">
          {isEn ? "New Password Security Criteria:" : "Kriteria Keamanan Kata Sandi Baru:"}
        </span>
        <ul className="space-y-1.5 text-xs">
          {criteria.map((c) => {
            const isMet = c.isValid;
            return (
              <li
                key={c.id}
                className={`flex items-center gap-2 transition-colors ${
                  isMet ? "text-emerald-700 font-medium" : "text-rose-600 font-normal"
                }`}
              >
                {isMet ? (
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Check className="h-3 w-3 stroke-[2.5]" />
                  </span>
                ) : (
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                    <X className="h-3 w-3 stroke-[2.5]" />
                  </span>
                )}
                <span>{c.label}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Ulangi Password Baru */}
      <Field label={isEn ? "Confirm New Password" : "Ulangi Password Baru"}>
        <div className="relative">
          <Input
            name="confirm"
            type={showConfirm ? "text" : "password"}
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={isEn ? "Retype new password" : "Ketik ulang password baru"}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-espresso-400 hover:text-espresso-700 transition-colors p-0.5 cursor-pointer"
            tabIndex={-1}
            aria-label={showConfirm ? (isEn ? "Hide password" : "Sembunyikan password") : (isEn ? "Show password" : "Tampilkan password")}
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {confirm.length > 0 && (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs">
            {isConfirmMatch ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                {isEn ? "Password confirmation matches" : "Konfirmasi password cocok"}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-rose-600">
                <X className="h-3.5 w-3.5 text-rose-500" />
                {isEn ? "Password confirmation does not match" : "Konfirmasi password belum cocok"}
              </span>
            )}
          </div>
        )}
      </Field>

      <Button
        type="submit"
        variant="secondary"
        disabled={isPending || !isFormValid}
        className="w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isPending
          ? (isEn ? "Updating Password..." : "Mengubah Kata Sandi...")
          : (isEn ? "Update Password" : "Ubah Password")}
      </Button>
    </form>
  );
}
