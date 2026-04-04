import { NextResponse } from "next/server";
import { saveDailyLog } from "@/services/daily-log";

export async function POST(request: Request) {
  const body = await request.json();
  const result = await saveDailyLog(body);

  return NextResponse.json(result, {
    status: result.success ? 200 : 400,
  });
}
