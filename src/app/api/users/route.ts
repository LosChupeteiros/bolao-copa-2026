import { NextResponse } from "next/server";
import { getUsers } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  const users = (await getUsers()).map(({ passwordHash: _, ...u }) => u);
  return NextResponse.json({ users });
}
