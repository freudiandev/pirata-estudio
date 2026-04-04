import { NextResponse } from "next/server";
import { JobValidationError, updateJob } from "@/services/jobs";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await context.params;
  const body = await request.json();

  try {
    await updateJob(jobId, body);

    return NextResponse.json({
      success: true,
      message: "Avance guardado. Tu capacidad ya se recalculó.",
    });
  } catch (error) {
    if (error instanceof JobValidationError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          fieldErrors: error.fieldErrors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "No pude actualizar ese trabajo.",
      },
      { status: 500 },
    );
  }
}
