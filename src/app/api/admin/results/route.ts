import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUserById, upsertResult, getResults } from "@/lib/storage";
import { MATCHES_BY_ID } from "@/lib/matches";

export const dynamic = "force-dynamic";

export async function GET() {
  const results = getResults();
  return NextResponse.json({ results });
}

export async function POST(request: NextRequest) {
  // Accepts either session-based admin OR admin password header
  const adminPassword = request.headers.get("x-admin-password");
  const envPassword = process.env.ADMIN_PASSWORD || "admin2026copa";

  let isAdmin = false;

  if (adminPassword === envPassword) {
    isAdmin = true;
  } else {
    const session = await getSession();
    if (session) {
      const user = getUserById(session.userId);
      if (user?.isAdmin) isAdmin = true;
    }
  }

  if (!isAdmin) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  try {
    const body = await request.json() as {
      matchId?: string;
      homeScore?: number;
      awayScore?: number;
    };

    const { matchId, homeScore, awayScore } = body;

    if (!matchId || homeScore === undefined || awayScore === undefined) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    if (!MATCHES_BY_ID[matchId]) {
      return NextResponse.json({ error: "Jogo não encontrado" }, { status: 404 });
    }

    if (homeScore === awayScore) {
      return NextResponse.json(
        { error: "Na fase eliminatória não há empate (use pênaltis: adicione 1 ao vencedor)" },
        { status: 400 }
      );
    }

    upsertResult(matchId, homeScore, awayScore);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
