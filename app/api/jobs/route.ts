import { NextResponse } from "next/server";
import { createJob, JobValidationError, listJobs } from "@/services/jobs";

export async function GET() {
  const jobs = await listJobs();

  return NextResponse.json(
    jobs.map((job) => ({
      ...job,
      price: Number(job.price),
      cost: Number(job.cost),
    })),
  );
}

export async function POST(request: Request) {
  const body = await request.json();

  try {
    const job = await createJob(body);

    return NextResponse.json({
      success: true,
      message: "Trabajo guardado. Ahora sí forma parte de lo prometido.",
      job: {
        ...job,
        price: Number(job.price),
        cost: Number(job.cost),
      },
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
        message: "No pude guardar el trabajo.",
      },
      { status: 500 },
    );
  }
}
