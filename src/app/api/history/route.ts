import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/lib/auth";
import { getDataSource } from "@/db/data-source";
import { Explanation, SavedExplanation } from "@/db/entities";
import { Like, MoreThanOrEqual } from "typeorm";

export async function GET(request: NextRequest) {
  try {
    const auth = await validateSession();
    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") ?? "all";
    const search = searchParams.get("search") ?? "";

    const dataSource = await getDataSource();
    const explanationRepo = dataSource.getRepository(Explanation);
    const savedRepo = dataSource.getRepository(SavedExplanation);

    let dateFilter: Date | undefined;
    const now = new Date();

    switch (filter) {
      case "today":
        dateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "week":
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    const whereConditions: Record<string, unknown> = { userId: auth.user.id };
    
    if (dateFilter) {
      whereConditions.createdAt = MoreThanOrEqual(dateFilter);
    }

    let explanations = await explanationRepo.find({
      where: whereConditions,
      order: { createdAt: "DESC" },
    });

    if (search) {
      const lowerSearch = search.toLowerCase();
      explanations = explanations.filter(
        (exp) =>
          exp.title.toLowerCase().includes(lowerSearch) ||
          exp.getOnePageContent().summary_1_sentence.toLowerCase().includes(lowerSearch)
      );
    }

    const savedIds = await savedRepo.find({
      where: { userId: auth.user.id },
      select: ["explanationId"],
    });
    const savedIdSet = new Set(savedIds.map((s) => s.explanationId));

    const results = explanations.map((exp) => ({
      id: exp.id,
      title: exp.title,
      script_for_audio: exp.scriptForAudio,
      audioDuration: exp.audioDuration,
      createdAt: exp.createdAt.toISOString(),
      audience: exp.audience,
      isSaved: savedIdSet.has(exp.id),
      one_page_content: exp.getOnePageContent(),
      recordingData: exp.getRecordingData(),
    }));

    return NextResponse.json({ history: results });
  } catch (error) {
    console.error("Get history error:", error);
    return NextResponse.json({ error: "Failed to get history" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await validateSession();
    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { title, script_for_audio, audioDuration, audience, one_page_content, recordingData } = body;

    if (!title || !script_for_audio || !audience || !one_page_content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const explanationRepo = dataSource.getRepository(Explanation);

    const explanation = explanationRepo.create({
      userId: auth.user.id,
      title,
      scriptForAudio: script_for_audio,
      audioDuration: audioDuration ?? 0,
      audience,
    });
    explanation.setOnePageContent(one_page_content);
    if (recordingData) {
      explanation.setRecordingData(recordingData);
    }

    await explanationRepo.save(explanation);

    return NextResponse.json({
      success: true,
      explanation: {
        id: explanation.id,
        title: explanation.title,
        script_for_audio: explanation.scriptForAudio,
        audioDuration: explanation.audioDuration,
        createdAt: explanation.createdAt.toISOString(),
        audience: explanation.audience,
        isSaved: false,
        one_page_content: explanation.getOnePageContent(),
        recordingData: explanation.getRecordingData(),
      },
    });
  } catch (error) {
    console.error("Add to history error:", error);
    return NextResponse.json({ error: "Failed to add to history" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await validateSession();
    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const clearAll = searchParams.get("clearAll") === "true";

    const dataSource = await getDataSource();
    const explanationRepo = dataSource.getRepository(Explanation);

    if (clearAll) {
      await explanationRepo.delete({ userId: auth.user.id });
      return NextResponse.json({ success: true, message: "All history cleared" });
    }

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const explanation = await explanationRepo.findOne({
      where: { id, userId: auth.user.id },
    });

    if (!explanation) {
      return NextResponse.json({ error: "Explanation not found" }, { status: 404 });
    }

    await explanationRepo.remove(explanation);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete history error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
