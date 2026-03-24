import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

if (!connectionString) {
  throw new Error("Please define DATABASE_URL or DIRECT_URL in .env.local.");
}

let pool = globalThis._pgPool;
let initPromise = globalThis._pgInitPromise;

if (!pool) {
  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  globalThis._pgPool = pool;
}

export async function query(text, params = []) {
  await ensureSchema();
  return pool.query(text, params);
}

export function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value || "");
}

export function mapFolder(row) {
  if (!row) return null;

  return {
    _id: row.id,
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapQuiz(row, questions = [], folder = null) {
  if (!row) return null;

  return {
    _id: row.id,
    id: row.id,
    folderId: row.folder_id,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    questions,
    ...(folder ? { folder } : {}),
  };
}

export function mapQuestion(row) {
  return {
    _id: row.id,
    id: row.id,
    question: row.question,
    options: Array.isArray(row.options) ? row.options : [],
    correctIndex: row.correct_index,
    correctAnswer: row.correct_answer,
    createdAt: row.created_at,
  };
}

export async function getQuizById(quizId) {
  const quizResult = await query(
    `
      SELECT q.id, q.folder_id, q.title, q.created_at, q.updated_at,
             f.id AS folder_ref_id, f.name AS folder_name, f.slug AS folder_slug, f.description AS folder_description,
             f.created_at AS folder_created_at, f.updated_at AS folder_updated_at
      FROM quizzes q
      JOIN folders f ON f.id = q.folder_id
      WHERE q.id = $1
    `,
    [quizId]
  );

  const quizRow = quizResult.rows[0];
  if (!quizRow) {
    return null;
  }

  const questionResult = await query(
    `
      SELECT id, question, options, correct_index, correct_answer, created_at
      FROM questions
      WHERE quiz_id = $1
      ORDER BY created_at ASC
    `,
    [quizId]
  );

  const folder = mapFolder({
    id: quizRow.folder_ref_id,
    name: quizRow.folder_name,
    slug: quizRow.folder_slug,
    description: quizRow.folder_description,
    created_at: quizRow.folder_created_at,
    updated_at: quizRow.folder_updated_at,
  });

  return mapQuiz(quizRow, questionResult.rows.map(mapQuestion), folder);
}

async function ensureSchema() {
  if (!initPromise) {
    initPromise = initializeSchema();
    globalThis._pgInitPromise = initPromise;
  }

  await initPromise;
}

async function initializeSchema() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query("CREATE EXTENSION IF NOT EXISTS pgcrypto");

    await client.query(`
      CREATE TABLE IF NOT EXISTS folders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      ALTER TABLE folders ADD COLUMN IF NOT EXISTS description TEXT
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        folder_id UUID NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(folder_id, title)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        options JSONB NOT NULL,
        correct_index INTEGER NOT NULL CHECK (correct_index BETWEEN 0 AND 3),
        correct_answer TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    globalThis._pgInitPromise = null;
    initPromise = null;
    throw error;
  } finally {
    client.release();
  }
}
