import fs from "fs";
import path from "path";
import type { User, Bet, ResultsMap } from "./types";

// On Vercel: /tmp is writable but ephemeral. Local: /data persists.
const DATA_DIR = process.env.VERCEL
  ? "/tmp/bolao_data"
  : path.join(process.cwd(), "data");

const SEED_DIR = path.join(process.cwd(), "data");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function filePath(name: string) {
  return path.join(DATA_DIR, name);
}

function seedPath(name: string) {
  return path.join(SEED_DIR, name);
}

function readFile<T>(name: string, fallback: T): T {
  ensureDir();
  const p = filePath(name);
  if (!fs.existsSync(p)) {
    // On Vercel first run: copy seed from /data if available
    const seed = seedPath(name);
    if (fs.existsSync(seed)) {
      fs.copyFileSync(seed, p);
    } else {
      fs.writeFileSync(p, JSON.stringify(fallback, null, 2), "utf-8");
      return fallback;
    }
  }
  try {
    return JSON.parse(fs.readFileSync(p, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

function writeFile<T>(name: string, data: T): void {
  ensureDir();
  fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2), "utf-8");
}

// ── Users ──────────────────────────────────────────────────────────────────

export function getUsers(): User[] {
  return readFile<User[]>("users.json", []);
}

export function saveUsers(users: User[]): void {
  writeFile("users.json", users);
}

export function getUserById(id: string): User | undefined {
  return getUsers().find((u) => u.id === id);
}

export function getUserByName(name: string): User | undefined {
  return getUsers().find((u) => u.name.toLowerCase() === name.toLowerCase());
}

// ── Bets ───────────────────────────────────────────────────────────────────

export function getBets(): Bet[] {
  return readFile<Bet[]>("bets.json", []);
}

export function saveBets(bets: Bet[]): void {
  writeFile("bets.json", bets);
}

export function getBetsByUser(userId: string): Bet[] {
  return getBets().filter((b) => b.userId === userId);
}

export function upsertBet(bet: Bet): void {
  const bets = getBets();
  const idx = bets.findIndex(
    (b) => b.userId === bet.userId && b.matchId === bet.matchId
  );
  if (idx >= 0) {
    bets[idx] = { ...bet, updatedAt: new Date().toISOString() };
  } else {
    bets.push(bet);
  }
  saveBets(bets);
}

// ── Results ────────────────────────────────────────────────────────────────

export function getResults(): ResultsMap {
  return readFile<ResultsMap>("results.json", {});
}

export function saveResults(results: ResultsMap): void {
  writeFile("results.json", results);
}

export function upsertResult(
  matchId: string,
  homeScore: number,
  awayScore: number
): void {
  const results = getResults();
  results[matchId] = {
    matchId,
    homeScore,
    awayScore,
    winner: homeScore > awayScore ? "home" : "away",
    confirmedAt: new Date().toISOString(),
  };
  saveResults(results);
}
