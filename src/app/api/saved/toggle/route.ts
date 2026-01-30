import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/lib/auth";
import { getDataSource } from "@/db/data-source";
import { Explanation, SavedExplanation } from "@/db/entities";

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
      await savedRepo.remove(existing);
      return NextResponse.json({ success: true, isSaved: false });
    } else {
      const saved = savedRepo.create({
        userId: auth.user.id,
        explanationId,
      });
      await savedRepo.save(saved);
      return NextResponse.json({ success: true, isSaved: true });
    }
  } catch (error) {
    console.error("Toggle save error:", error);
    return NextResponse.json({ error: "Failed to toggle save" }, { status: 500 });
  }
}
