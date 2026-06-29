import { Redis } from "@upstash/redis";
import fs from "fs";
import path from "path";
import type { User, Bet, ResultsMap } from "./types";

// ── Redis client (Vercel production) ──────────────────────────────────────
// Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in Vercel env vars.
// See: https://console.upstash.com → Create Database → REST API
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// ── Local JSON fallback (development) ─────────────────────────────────────
const LOCAL_DIR = path.join(process.cwd(), "data");

function localRead<T>(name: string, fallback: T): T {
  const p = path.join(LOCAL_DIR, name);
  if (!fs.existsSync(p)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(p, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

function localWrite<T>(name: string, data: T): void {
  fs.mkdirSync(LOCAL_DIR, { recursive: true });
  fs.writeFileSync(path.join(LOCAL_DIR, name), JSON.stringify(data, null, 2), "utf-8");
}

// ── Users ──────────────────────────────────────────────────────────────────

export async function getUsers(): Promise<User[]> {
  if (redis) return (await redis.get<User[]>("bolao:users")) ?? [];
  return localRead<User[]>("users.json", []);
}

export async function saveUsers(users: User[]): Promise<void> {
  if (redis) { await redis.set("bolao:users", users); return; }
  localWrite("users.json", users);
}

export async function getUserById(id: string): Promise<User | undefined> {
  return (await getUsers()).find((u) => u.id === id);
}

export async function getUserByName(name: string): Promise<User | undefined> {
  const lower = name.toLowerCase();
  return (await getUsers()).find((u) => u.name.toLowerCase() === lower);
}

// ── Bets ───────────────────────────────────────────────────────────────────

export async function getBets(): Promise<Bet[]> {
  if (redis) return (await redis.get<Bet[]>("bolao:bets")) ?? [];
  return localRead<Bet[]>("bets.json", []);
}

export async function saveBets(bets: Bet[]): Promise<void> {
  if (redis) { await redis.set("bolao:bets", bets); return; }
  localWrite("bets.json", bets);
}

export async function getBetsByUser(userId: string): Promise<Bet[]> {
  return (await getBets()).filter((b) => b.userId === userId);
}

export async function upsertBet(bet: Bet): Promise<void> {
  const bets = await getBets();
  const idx = bets.findIndex(
    (b) => b.userId === bet.userId && b.matchId === bet.matchId
  );
  if (idx >= 0) {
    bets[idx] = { ...bet, updatedAt: new Date().toISOString() };
  } else {
    bets.push(bet);
  }
  await saveBets(bets);
}

// ── Results ────────────────────────────────────────────────────────────────

export async function getResults(): Promise<ResultsMap> {
  if (redis) return (await redis.get<ResultsMap>("bolao:results")) ?? {};
  return localRead<ResultsMap>("results.json", {});
}

export async function saveResults(results: ResultsMap): Promise<void> {
  if (redis) { await redis.set("bolao:results", results); return; }
  localWrite("results.json", results);
}

export async function upsertResult(
  matchId: string,
  homeScore: number,
  awayScore: number
): Promise<void> {
  const results = await getResults();
  results[matchId] = {
    matchId,
    homeScore,
    awayScore,
    winner: homeScore > awayScore ? "home" : "away",
    confirmedAt: new Date().toISOString(),
  };
  await saveResults(results);
}
