import type { SQLiteDatabase } from "expo-sqlite";

export type Tag = {
  id?: number;
  name: string;
  color?: string;
  createdAt?: string;
};

export type TagInput = {
  name: string;
  color?: string;
};

export class TagRepository {
  constructor(private db: SQLiteDatabase) {}

  async findAll(): Promise<Tag[]> {
    const rows = await this.db.getAllAsync<any>(
      `
      SELECT *
      FROM tags
      ORDER BY name ASC
      `
    );

    return rows.map(this.toDomain);
  }

  async findById(id: number): Promise<Tag | null> {
    const row = await this.db.getFirstAsync<any>(
      `
      SELECT *
      FROM tags
      WHERE id = ?
      `,
      [id]
    );

    return row ? this.toDomain(row) : null;
  }

  async findByName(name: string): Promise<Tag | null> {
    const row = await this.db.getFirstAsync<any>(
      `
      SELECT *
      FROM tags
      WHERE LOWER(name) = LOWER(?)
      `,
      [name.trim()]
    );

    return row ? this.toDomain(row) : null;
  }

  async create(input: TagInput): Promise<number> {
    const exists = await this.findByName(
      input.name
    );

    if (exists?.id) {
      return exists.id;
    }

    const now = new Date().toISOString();

    const result = await this.db.runAsync(
      `
      INSERT INTO tags
      (
        name,
        color,
        created_at
      )
      VALUES (?, ?, ?)
      `,
      [
        input.name.trim(),
        input.color ?? null,
        now,
      ]
    );

    return result.lastInsertRowId;
  }

  async update(
    id: number,
    input: TagInput
  ): Promise<void> {
    await this.db.runAsync(
      `
      UPDATE tags
      SET
        name = ?,
        color = ?
      WHERE id = ?
      `,
      [
        input.name.trim(),
        input.color ?? null,
        id,
      ]
    );
  }

  async delete(id: number): Promise<void> {
    await this.db.runAsync(
      `
      DELETE FROM tags
      WHERE id = ?
      `,
      [id]
    );
  }

  private toDomain(row: any): Tag {
    return {
      id: row.id,
      name: row.name,
      color: row.color,
      createdAt: row.created_at,
    };
  }
}