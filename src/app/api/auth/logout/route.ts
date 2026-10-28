import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/jwt";

export async function POST() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  return NextResponse.json({ success: true, message: "Session berhasil dibersihkan" });
}

export async function GET() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  return NextResponse.json({ success: true, message: "Session berhasil dibersihkan" });
}
