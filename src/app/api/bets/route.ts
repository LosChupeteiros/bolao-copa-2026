import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getSession } from "@/lib/auth";
import { getBets, getBetsByUser, upsertBet } from "@/lib/storage";
import { MATCHES_BY_ID } from "@/lib/matches";
import { isMatchLocked } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (userId) {
    const bets = await getBetsByUser(userId);
    return NextResponse.json({ bets });
  }

  const bets = await getBets();
  return NextResponse.json({ bets });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const body = await request.json() as {
      matchId?: string;
      homeScore?: number;
      awayScore?: number;
    };

    const { matchId, homeScore, awayScore } = body;

    if (!matchId || homeScore === undefined || awayScore === undefined) {
      return NextResponse.json(
        { error: "matchId, homeScore e awayScore são obrigatórios" },
        { status: 400 }
      );
    }

    const match = MATCHES_BY_ID[matchId];
    if (!match) {
      return NextResponse.json({ error: "Jogo não encontrado" }, { status: 404 });
    }

    if (isMatchLocked(match.kickoff)) {
      return NextResponse.json(
        { error: "Palpite encerrado para este jogo" },
        { status: 403 }
      );
    }

    if (
      !Number.isInteger(homeScore) ||
      !Number.isInteger(awayScore) ||
      homeScore < 0 ||
      awayScore < 0 ||
      homeScore > 20 ||
      awayScore > 20
    ) {
      return NextResponse.json({ error: "Placar inválido" }, { status: 400 });
    }

    if (homeScore === awayScore) {
      return NextResponse.json(
        { error: "Palpite não pode ser empate — defina um vencedor" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    await upsertBet({
      id: uuidv4(),
      userId: session.userId,
      matchId,
      homeScore,
      awayScore,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
