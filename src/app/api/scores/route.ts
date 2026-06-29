import { NextResponse } from "next/server";
import { getUsers, getBets, getResults } from "@/lib/storage";
import { calcUserScore } from "@/lib/scoring";

export const dynamic = "force-dynamic";

export async function GET() {
  const [users, allBets, results] = await Promise.all([
    getUsers(),
    getBets(),
    getResults(),
  ]);

  const scores = users
    .map((user) => {
      const userBets = allBets.filter((b) => b.userId === user.id);
      const { passwordHash: _, ...safeUser } = user;
      return calcUserScore(safeUser, userBets, results);
    })
    .sort((a, b) => b.totalPoints - a.totalPoints);

  return NextResponse.json({ scores });
}
