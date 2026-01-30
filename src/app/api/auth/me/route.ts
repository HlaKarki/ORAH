import { NextResponse } from "next/server";
import { validateSession, serializeUser } from "@/lib/auth";

export async function GET() {
  try {
    const result = await validateSession();
    
    if (!result) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: serializeUser(result.user),
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { error: "Authentication check failed" },
      { status: 500 }
    );
  }
}
