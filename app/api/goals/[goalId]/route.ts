import { NextResponse } from "next/server";
import { updateGoal } from "@/services/goals";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ goalId: string }> },
) {
  const { goalId } = await context.params;
  const body = await request.json();
  const result = await updateGoal(goalId, body);

  return NextResponse.json(result, {
    status: result.success ? 200 : 400,
  });
}
