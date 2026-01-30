import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/lib/auth";
import { getDataSource } from "@/db/data-source";
import { Explanation, SavedExplanation } from "@/db/entities";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await validateSession();
    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;

    const dataSource = await getDataSource();
    const explanationRepo = dataSource.getRepository(Explanation);
    const savedRepo = dataSource.getRepository(SavedExplanation);

    const explanation = await explanationRepo.findOne({
      where: { id, userId: auth.user.id },
    });

    if (!explanation) {
      return NextResponse.json({ error: "Explanation not found" }, { status: 404 });
    }

    const saved = await savedRepo.findOne({
      where: { userId: auth.user.id, explanationId: id },
    });

    return NextResponse.json({
      explanation: {
        id: explanation.id,
        title: explanation.title,
        script_for_audio: explanation.scriptForAudio,
        audioDuration: explanation.audioDuration,
        createdAt: explanation.createdAt.toISOString(),
        audience: explanation.audience,
        isSaved: !!saved,
        one_page_content: explanation.getOnePageContent(),
        recordingData: explanation.getRecordingData(),
      },
    });
  } catch (error) {
    console.error("Get explanation error:", error);
    return NextResponse.json({ error: "Failed to get explanation" }, { status: 500 });
  }
}
