import type { SQLiteDatabase } from "expo-sqlite";
import type { Email } from "../../domain/Contact";

export type EmailInput = {
  contactId: number;
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
      ORDER BY contact_id ASC, is_primary DESC, id DESC
      `,
    );

    return rows.map(this.toDomain);
  }

  async findByContactId(contactId: number): Promise<Email[]> {
    const rows = await this.db.getAllAsync<any>(
      `
      SELECT *
      FROM emails
      WHERE contact_id = ?
      ORDER BY is_primary DESC, id ASC
      `,
      [contactId],
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

  async findPrimary(contactId: number): Promise<Email | null> {
    const row = await this.db.getFirstAsync<any>(
      `
      SELECT *
      FROM emails
      WHERE contact_id = ?
        AND is_primary = 1
      LIMIT 1
      `,
      [contactId],
    );

    return row ? this.toDomain(row) : null;
  }

  async create(input: EmailInput): Promise<number> {
    if (input.isPrimary) {
      await this.clearPrimary(input.contactId);
    }

    const now = new Date().toISOString();

    const result = await this.db.runAsync(
      `
      INSERT INTO emails
      (
        contact_id,
        email_type,
        email_address,
        is_primary,
        created_at
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        input.contactId,
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
      await this.clearPrimary(input.contactId);
    }

    await this.db.runAsync(
      `
      UPDATE emails
      SET
        contact_id = ?,
        email_type = ?,
        email_address = ?,
        is_primary = ?
      WHERE id = ?
      `,
      [
        input.contactId,
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

  async deleteByContactId(contactId: number): Promise<void> {
    await this.db.runAsync(
      `
      DELETE FROM emails
      WHERE contact_id = ?
      `,
      [contactId],
    );
  }

  async setPrimary(id: number): Promise<void> {
    const email = await this.db.getFirstAsync<any>(
      `
        SELECT contact_id
        FROM emails
        WHERE id = ?
        `,
      [id],
    );

    if (!email) return;

    await this.clearPrimary(email.contact_id);

    await this.db.runAsync(
      `
      UPDATE emails
      SET is_primary = 1
      WHERE id = ?
      `,
      [id],
    );
  }

  private async clearPrimary(contactId: number) {
    await this.db.runAsync(
      `
      UPDATE emails
      SET is_primary = 0
      WHERE contact_id = ?
      `,
      [contactId],
    );
  }

  private toDomain(row: any): Email {
    return {
      id: row.id,
      contactId: row.contact_id,
      emailType: row.email_type,
      emailAddress: row.email_address,
      isPrimary: row.is_primary === 1,
      createdAt: row.created_at,
    };
  }
}
