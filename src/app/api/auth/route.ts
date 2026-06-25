import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const passcode = process.env.APP_PASSCODE;
  if (!passcode) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("auth", "1", { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 30 });
    return res;
  }
  const body = await req.json();
  if (body.passcode !== passcode) {
    return NextResponse.json({ error: "Wrong passcode" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("auth", "1", { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 30 });
  return res;
}

export async function GET() {
  const passcode = process.env.APP_PASSCODE;
  if (!passcode) return NextResponse.json({ required: false });
  const cookieStore = await cookies();
  const auth = cookieStore.get("auth");
  return NextResponse.json({ required: true, authed: auth?.value === "1" });
}
