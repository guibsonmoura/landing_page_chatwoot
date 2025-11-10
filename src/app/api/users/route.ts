import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import db from '@/lib/sqlite';
import { z } from 'zod';

const userSchema = z.object({
  displayName: z.string().min(3),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
  role: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  const parse = userSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ message: 'Dados inválidos', errors: parse.error.format() }, { status: 400 });
  }

  const { displayName, email, phone, password, role } = parse.data;

  try {
    // Create users table if not exists (id, name, email unique, phone, password_hash, role)
    db.prepare(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        display_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ).run();

    // Simple password storage for demo (INSECURE) - in real app hash with bcrypt
    const stmt = db.prepare('INSERT INTO users (display_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)');
    const info = stmt.run(displayName, email, phone || null, password, role || 'user');

    return NextResponse.json({ id: info.lastInsertRowid, message: 'Usuário criado' }, { status: 201 });
  } catch (err: any) {
    if (err?.message?.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ message: 'Email já cadastrado' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Erro interno', detail: String(err?.message) }, { status: 500 });
  }
}
