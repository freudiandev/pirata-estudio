import { NextResponse } from "next/server";
import { saveOnboarding, saveSettings } from "@/services/settings";

export async function PATCH(request: Request) {
  const body = await request.json();
  const result =
    body.setupComplete === false ? await saveOnboarding(body) : await saveSettings(body);

  return NextResponse.json(result, {
    status: result.success ? 200 : 400,
  });
}
