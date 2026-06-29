import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByName } from "@/lib/storage";
import { createSession, setSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { name?: string; password?: string };
    const { name, password } = body;

    if (!name || !password) {
      return NextResponse.json(
        { error: "Apelido e senha são obrigatórios" },
        { status: 400 }
      );
    }

    const user = getUserByName(name);
    if (!user) {
      return NextResponse.json(
        { error: "Apelido ou senha incorretos" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Apelido ou senha incorretos" },
        { status: 401 }
      );
    }

    const token = await createSession({ userId: user.id, name: user.name });

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        displayName: user.displayName,
        photoUrl: user.photoUrl,
        isAdmin: user.isAdmin,
      },
    });

    setSessionCookie(response, token);
    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
