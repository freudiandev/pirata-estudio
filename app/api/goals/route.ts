import { NextResponse } from "next/server";
import { createGoal, listGoals } from "@/services/goals";

export async function GET() {
  const goals = await listGoals();
  return NextResponse.json(goals);
}

export async function POST(request: Request) {
  const body = await request.json();
  const result = await createGoal(body);

  return NextResponse.json(result, {
    status: result.success ? 200 : 400,
  });
}
