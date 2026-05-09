import type { SQLiteDatabase } from "expo-sqlite";

export type Group = {
  id?: number;
  name: string;
  description?: string;
  color?: string;
  createdAt?: string;
};

export type GroupInput = {
  name: string;
  description?: string;
  color?: string;
};

export class GroupRepository {
  constructor(private db: SQLiteDatabase) {}

  async findAll(): Promise<Group[]> {
    const rows = await this.db.getAllAsync<any>(
      `
      SELECT *
      FROM groups
      ORDER BY name ASC
      `
    );

    return rows.map(this.toDomain);
  }

  async findById(id: number): Promise<Group | null> {
    const row = await this.db.getFirstAsync<any>(
      `
      SELECT *
      FROM groups
      WHERE id = ?
      `,
      [id]
    );

    return row ? this.toDomain(row) : null;
  }

  async findByName(
    name: string
  ): Promise<Group | null> {
    const row = await this.db.getFirstAsync<any>(
      `
      SELECT *
      FROM groups
      WHERE LOWER(name) = LOWER(?)
      `,
      [name.trim()]
    );

    return row ? this.toDomain(row) : null;
  }

  async create(
    input: GroupInput
  ): Promise<number> {
    const exists = await this.findByName(
      input.name
    );

    if (exists?.id) {
      return exists.id;
    }

    const now = new Date().toISOString();

    const result = await this.db.runAsync(
      `
      INSERT INTO groups
      (
        name,
        description,
        color,
        created_at
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        input.name.trim(),
        input.description ?? null,
        input.color ?? null,
        now,
      ]
    );

    return result.lastInsertRowId;
  }

  async update(
    id: number,
    input: GroupInput
  ): Promise<void> {
    await this.db.runAsync(
      `
      UPDATE groups
      SET
        name = ?,
        description = ?,
        color = ?
      WHERE id = ?
      `,
      [
        input.name.trim(),
        input.description ?? null,
        input.color ?? null,
        id,
      ]
    );
  }

  async delete(id: number): Promise<void> {
    await this.db.runAsync(
      `
      DELETE FROM groups
      WHERE id = ?
      `,
      [id]
    );
  }

  private toDomain(row: any): Group {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      color: row.color,
      createdAt: row.created_at,
    };
  }
}