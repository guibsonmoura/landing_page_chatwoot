import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database | null = null;

export function getDb() {
  if (!db) {
    try {
      const dbPath = path.join(process.cwd(), 'src/lib/sqlite/cache.db');
      db = new Database(dbPath);
      db.pragma('journal_mode = WAL');
      
      // Criar tabelas necessárias
      db.prepare(`
        CREATE TABLE IF NOT EXISTS transacao (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          titulo TEXT NOT NULL,
          quantidade INTEGER NOT NULL,
          preco INTEGER NOT NULL,
          idproduto TEXT,
          idtransacao TEXT
        )
      `).run();
      
      console.log('[SQLite] Database initialized successfully');
    } catch (error) {
      console.error('[SQLite] Failed to initialize database:', error);
      throw error;
    }
  }
  return db;
}