import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, createSession, setSessionCookie, serializeUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await authenticateUser(email, password);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const userAgent = request.headers.get("user-agent") ?? undefined;
    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0] ?? 
                      request.headers.get("x-real-ip") ?? 
                      undefined;

    const session = await createSession(user.id, userAgent, ipAddress);
    await setSessionCookie(session.token);

    return NextResponse.json({
      success: true,
      user: serializeUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
