import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { getUsers, saveUsers } from "@/lib/storage";
import { createSession, setSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      name?: string;
      displayName?: string;
      password?: string;
      photoUrl?: string;
    };

    const { name, displayName, password, photoUrl } = body;

    if (!name || !password || !displayName) {
      return NextResponse.json(
        { error: "Nome, apelido e senha são obrigatórios" },
        { status: 400 }
      );
    }

    if (/\s/.test(name)) {
      return NextResponse.json(
        { error: "O apelido não pode ter espaços" },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 4 caracteres" },
        { status: 400 }
      );
    }

    const users = getUsers();

    if (users.find((u) => u.name.toLowerCase() === name.toLowerCase())) {
      return NextResponse.json(
        { error: "Esse apelido já está em uso" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = {
      id: uuidv4(),
      name: name.trim(),
      displayName: displayName.trim(),
      photoUrl: photoUrl || "",
      passwordHash,
      isAdmin: users.length === 0,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    const token = await createSession({ userId: newUser.id, name: newUser.name });

    const response = NextResponse.json({
      user: {
        id: newUser.id,
        name: newUser.name,
        displayName: newUser.displayName,
        photoUrl: newUser.photoUrl,
        isAdmin: newUser.isAdmin,
      },
    });

    setSessionCookie(response, token);
    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
