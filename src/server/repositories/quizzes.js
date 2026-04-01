import { getQuizById, mapFolder, mapQuiz, query } from "@/server/db/postgres";

export async function listQuizzesByFolderId(folderId) {
  const result = await query(
    `
      SELECT id, folder_id, title, created_at, updated_at
      FROM quizzes
      WHERE folder_id = $1
      ORDER BY created_at DESC
    `,
    [folderId]
  );

  const quizIds = result.rows.map((row) => row.id);
  let countMap = new Map();

  if (quizIds.length > 0) {
    const countResult = await query(
      `
        SELECT quiz_id, COUNT(*)::int AS question_count
        FROM questions
        WHERE quiz_id = ANY($1::uuid[])
        GROUP BY quiz_id
      `,
      [quizIds]
    );
    countMap = new Map(countResult.rows.map((row) => [row.quiz_id, row.question_count]));
  }

  return result.rows.map((row) => mapQuiz(row, Array(countMap.get(row.id) || 0).fill(null)));
}

export async function listAllQuizzes() {
  const result = await query(
    `
      SELECT q.id, q.folder_id, q.title, q.created_at, q.updated_at,
             f.id AS folder_ref_id, f.name AS folder_name, f.slug AS folder_slug, f.description AS folder_description,
             f.created_at AS folder_created_at, f.updated_at AS folder_updated_at,
             COUNT(ques.id)::int AS question_count
      FROM quizzes q
      JOIN folders f ON f.id = q.folder_id
      LEFT JOIN questions ques ON ques.quiz_id = q.id
      GROUP BY q.id, f.id
      ORDER BY q.created_at DESC
    `
  );

  return result.rows.map((row) => {
    const folder = mapFolder({
      id: row.folder_ref_id,
      name: row.folder_name,
      slug: row.folder_slug,
      description: row.folder_description,
      created_at: row.folder_created_at,
      updated_at: row.folder_updated_at,
    });

    return mapQuiz(row, Array(row.question_count || 0).fill(null), folder);
  });
}

export async function createQuiz({ folderId, title }) {
  const result = await query(
    `
      INSERT INTO quizzes (folder_id, title)
      VALUES ($1, $2)
      RETURNING id, folder_id, title, created_at, updated_at
    `,
    [folderId, title]
  );

  return mapQuiz(result.rows[0], []);
}

export async function getExistingQuiz({ folderId, title }) {
  const result = await query(
    `
      SELECT id, folder_id, title, created_at, updated_at
      FROM quizzes
      WHERE folder_id = $1 AND title = $2
      LIMIT 1
    `,
    [folderId, title]
  );

  return result.rows[0] ? mapQuiz(result.rows[0], []) : null;
}

export async function quizExists(id) {
  const result = await query(`SELECT id FROM quizzes WHERE id = $1 LIMIT 1`, [id]);
  return Boolean(result.rows[0]);
}

export async function addQuestionToQuiz({ quizId, question, options, correctIndex, correctAnswer }) {
  await query(
    `
      INSERT INTO questions (quiz_id, question, options, correct_index, correct_answer)
      VALUES ($1, $2, $3::jsonb, $4, $5)
    `,
    [quizId, question, JSON.stringify(options), correctIndex, correctAnswer]
  );

  return getQuizById(quizId);
}

export async function deleteQuiz(id) {
  const result = await query(`DELETE FROM quizzes WHERE id = $1 RETURNING id`, [id]);
  return Boolean(result.rows[0]);
}

export { getQuizById };
