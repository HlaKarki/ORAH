import { NextResponse } from "next/server";
import { getSessionToken, invalidateSession, clearSessionCookie } from "@/lib/auth";

export async function POST() {
  try {
    const token = await getSessionToken();
    
    if (token) {
      await invalidateSession(token);
    }
    
    await clearSessionCookie();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    await clearSessionCookie();
    return NextResponse.json({ success: true });
  }
}
