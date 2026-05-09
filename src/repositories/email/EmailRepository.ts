import type { SQLiteDatabase } from "expo-sqlite";
import { Email } from "../../domain/Contact";

export type EmailInput = {
  emailType?: string;
  emailAddress: string;
  isPrimary?: boolean;
};

export class EmailRepository {
  constructor(private db: SQLiteDatabase) {}

  async findAll(): Promise<Email[]> {
    const rows = await this.db.getAllAsync<any>(
      `
      SELECT *
      FROM emails
      ORDER BY is_primary DESC, id DESC
      `,
    );

    return rows.map(this.toDomain);
  }

  async findById(id: number): Promise<Email | null> {
    const row = await this.db.getFirstAsync<any>(
      `
      SELECT *
      FROM emails
      WHERE id = ?
      `,
      [id],
    );

    return row ? this.toDomain(row) : null;
  }

  async findPrimary(): Promise<Email | null> {
    const row = await this.db.getFirstAsync<any>(
      `
      SELECT *
      FROM emails
      WHERE is_primary = 1
      LIMIT 1
      `,
    );

    return row ? this.toDomain(row) : null;
  }

  async create(input: EmailInput): Promise<number> {
    if (input.isPrimary) {
      await this.clearPrimary();
    }

    const now = new Date().toISOString();

    const result = await this.db.runAsync(
      `
      INSERT INTO emails
      (
        email_type,
        email_address,
        is_primary,
        created_at
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        input.emailType ?? "personal",
        input.emailAddress.trim().toLowerCase(),
        input.isPrimary ? 1 : 0,
        now,
      ],
    );

    return result.lastInsertRowId;
  }

  async update(id: number, input: EmailInput): Promise<void> {
    if (input.isPrimary) {
      await this.clearPrimary();
    }

    await this.db.runAsync(
      `
      UPDATE emails
      SET
        email_type = ?,
        email_address = ?,
        is_primary = ?
      WHERE id = ?
      `,
      [
        input.emailType ?? "personal",
        input.emailAddress.trim().toLowerCase(),
        input.isPrimary ? 1 : 0,
        id,
      ],
    );
  }

  async delete(id: number): Promise<void> {
    await this.db.runAsync(
      `
      DELETE FROM emails
      WHERE id = ?
      `,
      [id],
    );
  }

  async setPrimary(id: number): Promise<void> {
    await this.clearPrimary();

    await this.db.runAsync(
      `
      UPDATE emails
      SET is_primary = 1
      WHERE id = ?
      `,
      [id],
    );
  }

  private async clearPrimary() {
    await this.db.runAsync(
      `
      UPDATE emails
      SET is_primary = 0
      `,
    );
  }

  private toDomain(row: any): Email {
    return {
      id: row.id,
      emailType: row.email_type,
      emailAddress: row.email_address,
      isPrimary: row.is_primary === 1,
      createdAt: row.created_at,
    };
  }
}
