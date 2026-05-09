import type { SQLiteDatabase } from "expo-sqlite";
import type { Phone } from "../../domain/Contact";

export type PhoneInput = {
  phoneType?: string;
  phoneNumber: string;
  isPrimary?: boolean;
};

export class PhoneRepository {
  constructor(private db: SQLiteDatabase) {}

  async findAll(): Promise<Phone[]> {
    const rows = await this.db.getAllAsync<any>(
      `
      SELECT *
      FROM phones      
      ORDER BY is_primary DESC, id ASC
      `,
    );

    return rows.map(this.toDomain);
  }

  async findById(id: number): Promise<Phone | null> {
    const row = await this.db.getFirstAsync<any>(
      `
      SELECT *
      FROM phones
      WHERE id = ?
      `,
      [id],
    );

    return row ? this.toDomain(row) : null;
  }

  async create(input: PhoneInput): Promise<number> {
    if (input.isPrimary ?? true) {
      await this.clearPrimary();
    }

    const now = new Date().toISOString();

    const result = await this.db.runAsync(
      `
      INSERT INTO phones
      (phone_type, phone_number, is_primary, created_at)
      VALUES (?, ?, ?, ?)
      `,
      [
        input.phoneType ?? "mobile",
        input.phoneNumber.trim(),
        (input.isPrimary ?? true) ? 1 : 0,
        now,
      ],
    );

    return result.lastInsertRowId;
  }

  async update(
    id: number,
    input: {
      phoneType?: string;
      phoneNumber: string;
      isPrimary?: boolean;
    },
  ): Promise<void> {
    if (input.isPrimary) {
      await this.clearPrimary();
    }

    await this.db.runAsync(
      `
      UPDATE phones
      SET phone_type = ?,
          phone_number = ?,
          is_primary = ?
      WHERE id = ?
      `,
      [
        input.phoneType ?? "mobile",
        input.phoneNumber.trim(),
        input.isPrimary ? 1 : 0,
        id,
      ],
    );
  }

  async setPrimary(id: number): Promise<void> {
    await this.clearPrimary();

    await this.db.runAsync(`UPDATE phones SET is_primary = 1 WHERE id = ?`, [
      id,
    ]);
  }

  async delete(id: number): Promise<void> {
    await this.db.runAsync(`DELETE FROM phones WHERE id = ?`, [id]);
  }

  private async clearPrimary(): Promise<void> {
    await this.db.runAsync(
      `
      UPDATE phones
      SET is_primary = 0
      `,
    );
  }

  private toDomain(row: any): Phone {
    return {
      id: row.id,
      phoneType: row.phone_type,
      phoneNumber: row.phone_number,
      isPrimary: row.is_primary === 1,
      createdAt: row.createdAt,
    };
  }
}
