import { NextRequest, NextResponse } from "next/server";
import { registerUser, createSession, setSessionCookie, serializeUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password } = body;

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const user = await registerUser(firstName, lastName, email, password);

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
    const message = error instanceof Error ? error.message : "Registration failed";
    
    if (message === "Email already registered") {
      return NextResponse.json({ error: message }, { status: 409 });
    }

    console.error("Registration error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
