import { NextResponse } from "next/server";
import { deleteJob, JobValidationError, updateJob } from "@/services/jobs";

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

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await context.params;

  try {
    await deleteJob(jobId);

    return NextResponse.json({
      success: true,
      message: "Promesa borrada. Ya no cuenta dentro de lo pendiente.",
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
        message: "No pude borrar esa promesa.",
      },
      { status: 500 },
    );
  }
}
