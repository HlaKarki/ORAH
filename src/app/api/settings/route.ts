import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/lib/auth";
import { getDataSource } from "@/db/data-source";
import { UserSettings } from "@/db/entities";

const DEFAULT_SETTINGS = {
  voice: "default",
  speed: 1.0,
  theme: "dark" as const,
  autoPlay: true,
  showTranscript: false,
};

export async function GET() {
  try {
    const auth = await validateSession();
    if (!auth) {
      return NextResponse.json({ settings: DEFAULT_SETTINGS });
    }

    const dataSource = await getDataSource();
    const settingsRepo = dataSource.getRepository(UserSettings);

    let settings = await settingsRepo.findOne({
      where: { userId: auth.user.id },
    });

    if (!settings) {
      settings = settingsRepo.create({
        userId: auth.user.id,
        ...DEFAULT_SETTINGS,
      });
      await settingsRepo.save(settings);
    }

    return NextResponse.json({
      settings: {
        voice: settings.voice,
        speed: settings.speed,
        theme: settings.theme,
        autoPlay: settings.autoPlay,
        showTranscript: settings.showTranscript,
      },
    });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json({ settings: DEFAULT_SETTINGS });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await validateSession();
    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { voice, speed, theme, autoPlay, showTranscript } = body;

    const dataSource = await getDataSource();
    const settingsRepo = dataSource.getRepository(UserSettings);

    let settings = await settingsRepo.findOne({
      where: { userId: auth.user.id },
    });

    if (!settings) {
      settings = settingsRepo.create({
        userId: auth.user.id,
        ...DEFAULT_SETTINGS,
      });
    }

    if (voice !== undefined) settings.voice = voice;
    if (speed !== undefined) settings.speed = speed;
    if (theme !== undefined) settings.theme = theme;
    if (autoPlay !== undefined) settings.autoPlay = autoPlay;
    if (showTranscript !== undefined) settings.showTranscript = showTranscript;

    await settingsRepo.save(settings);

    return NextResponse.json({
      success: true,
      settings: {
        voice: settings.voice,
        speed: settings.speed,
        theme: settings.theme,
        autoPlay: settings.autoPlay,
        showTranscript: settings.showTranscript,
      },
    });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const auth = await validateSession();
    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const dataSource = await getDataSource();
    const settingsRepo = dataSource.getRepository(UserSettings);

    await settingsRepo.update({ userId: auth.user.id }, DEFAULT_SETTINGS);

    return NextResponse.json({
      success: true,
      settings: DEFAULT_SETTINGS,
    });
  } catch (error) {
    console.error("Reset settings error:", error);
    return NextResponse.json({ error: "Failed to reset settings" }, { status: 500 });
  }
}
