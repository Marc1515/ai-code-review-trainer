import { NextResponse } from "next/server";

// Returns 404 in production. In other environments, throws an intentional error
// so you can verify Sentry is capturing events without deploying a real bug.
export async function GET(): Promise<NextResponse> {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  throw new Error("Sentry test error — intentional, not a real bug");
}
