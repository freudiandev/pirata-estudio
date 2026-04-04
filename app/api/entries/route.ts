import { NextResponse } from "next/server";
import { createEntry, listEntries } from "@/services/finance";

export async function GET() {
  const entries = await listEntries();

  return NextResponse.json(
    entries.map((entry) => ({
      ...entry,
      amount: Number(entry.amount),
    })),
  );
}

export async function POST(request: Request) {
  const body = await request.json();
  const result = await createEntry(body);

  return NextResponse.json(result, {
    status: result.success ? 200 : 400,
  });
}
