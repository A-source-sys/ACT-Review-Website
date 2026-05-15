import { NextRequest, NextResponse } from "next/server";
import { getQuestionsBySection, getSectionCounts, bustCache } from "@/lib/questions";
import type { Section } from "@/types";

const VALID_SECTIONS: Section[] = ["ENGLISH", "MATHEMATICS", "READING", "SCIENCE"];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const section = searchParams.get("section")?.toUpperCase() as Section | null;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "10"), 50);
  const exclude = searchParams.get("exclude")?.split(",").map(Number).filter(Boolean) ?? [];
  const counts = searchParams.get("counts") === "1";

  // Bust cache in dev so file changes are reflected immediately
  if (process.env.NODE_ENV === "development") bustCache();

  if (counts) {
    return NextResponse.json({ counts: getSectionCounts() });
  }

  if (!section || !VALID_SECTIONS.includes(section)) {
    return NextResponse.json(
      { error: "Missing or invalid ?section= (ENGLISH | MATHEMATICS | READING | SCIENCE)" },
      { status: 400 }
    );
  }

  const questions = getQuestionsBySection(section, limit, exclude);

  return NextResponse.json({
    section,
    count: questions.length,
    questions,
  });
}
