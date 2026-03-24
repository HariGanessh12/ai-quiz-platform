import { mapFolder, query } from "@/server/db/postgres";

export async function listFolders() {
  const result = await query(
    `SELECT id, name, slug, description, created_at, updated_at FROM folders ORDER BY created_at DESC`
  );
  return result.rows.map(mapFolder);
}

export async function getFolderById(id) {
  const result = await query(
    `SELECT id, name, slug, description, created_at, updated_at FROM folders WHERE id = $1 LIMIT 1`,
    [id]
  );
  return mapFolder(result.rows[0]);
}

export async function getFolderBySlug(slug) {
  const result = await query(
    `SELECT id, name, slug, description, created_at, updated_at FROM folders WHERE slug = $1 LIMIT 1`,
    [slug]
  );
  return mapFolder(result.rows[0]);
}

export async function createFolder({ name, slug, description = "" }) {
  const result = await query(
    `
      INSERT INTO folders (name, slug, description)
      VALUES ($1, $2, $3)
      RETURNING id, name, slug, description, created_at, updated_at
    `,
    [name, slug, description]
  );

  return mapFolder(result.rows[0]);
}

export async function updateFolder({ id, name, description = "" }) {
  const result = await query(
    `
      UPDATE folders
      SET name = $2, description = $3, updated_at = NOW()
      WHERE id = $1
      RETURNING id, name, slug, description, created_at, updated_at
    `,
    [id, name, description]
  );

  return mapFolder(result.rows[0]);
}

export async function deleteFolder(id) {
  const result = await query(`DELETE FROM folders WHERE id = $1 RETURNING id`, [id]);
  return Boolean(result.rows[0]);
}
