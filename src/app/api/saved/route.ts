import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/lib/auth";
import { getDataSource } from "@/db/data-source";
import { Explanation, SavedExplanation } from "@/db/entities";

export async function GET() {
  try {
    const auth = await validateSession();
    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const dataSource = await getDataSource();
    const savedRepo = dataSource.getRepository(SavedExplanation);

    const savedItems = await savedRepo.find({
      where: { userId: auth.user.id },
      relations: ["explanation"],
      order: { savedAt: "DESC" },
    });

    const results = savedItems
      .filter((item) => item.explanation)
      .map((item) => ({
        id: item.explanation.id,
        title: item.explanation.title,
        script_for_audio: item.explanation.scriptForAudio,
        audioDuration: item.explanation.audioDuration,
        createdAt: item.explanation.createdAt.toISOString(),
        audience: item.explanation.audience,
        isSaved: true,
        one_page_content: item.explanation.getOnePageContent(),
        recordingData: item.explanation.getRecordingData(),
      }));

    return NextResponse.json({ saved: results });
  } catch (error) {
    console.error("Get saved error:", error);
    return NextResponse.json({ error: "Failed to get saved items" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await validateSession();
    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { explanationId } = body;

    if (!explanationId) {
      return NextResponse.json({ error: "Explanation ID is required" }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const explanationRepo = dataSource.getRepository(Explanation);
    const savedRepo = dataSource.getRepository(SavedExplanation);

    const explanation = await explanationRepo.findOne({
      where: { id: explanationId, userId: auth.user.id },
    });

    if (!explanation) {
      return NextResponse.json({ error: "Explanation not found" }, { status: 404 });
    }

    const existing = await savedRepo.findOne({
      where: { userId: auth.user.id, explanationId },
    });

    if (existing) {
      return NextResponse.json({ success: true, message: "Already saved" });
    }

    const saved = savedRepo.create({
      userId: auth.user.id,
      explanationId,
    });

    await savedRepo.save(saved);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save explanation error:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await validateSession();
    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const explanationId = searchParams.get("id");

    if (!explanationId) {
      return NextResponse.json({ error: "Explanation ID is required" }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const savedRepo = dataSource.getRepository(SavedExplanation);

    await savedRepo.delete({ userId: auth.user.id, explanationId });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unsave explanation error:", error);
    return NextResponse.json({ error: "Failed to unsave" }, { status: 500 });
  }
}
