import type { SQLiteDatabase } from "expo-sqlite";
import type { Phone } from "../../domain/Contact";

export type PhoneInput = {
  contactId: number;
  phoneType?: string;
  phoneNumber: string;
  isPrimary?: boolean;
};

export class PhoneRepository {
  constructor(private db: SQLiteDatabase) {}

  async findByContactId(contactId: number): Promise<Phone[]> {
    const rows = await this.db.getAllAsync<any>(
      `
      SELECT *
      FROM phones
      WHERE contact_id = ?
      ORDER BY is_primary DESC, id ASC
      `,
      [contactId],
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
      await this.clearPrimary(input.contactId);
    }

    const result = await this.db.runAsync(
      `
      INSERT INTO phones
      (contact_id, phone_type, phone_number, is_primary)
      VALUES (?, ?, ?, ?)
      `,
      [
        input.contactId,
        input.phoneType ?? "mobile",
        input.phoneNumber.trim(),
        (input.isPrimary ?? true) ? 1 : 0,
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
    const current = await this.db.getFirstAsync<any>(
      `SELECT contact_id FROM phones WHERE id = ?`,
      [id],
    );

    if (!current) return;

    if (input.isPrimary) {
      await this.clearPrimary(current.contact_id);
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
    const phone = await this.db.getFirstAsync<any>(
      `SELECT contact_id FROM phones WHERE id = ?`,
      [id],
    );

    if (!phone) return;

    await this.clearPrimary(phone.contact_id);

    await this.db.runAsync(`UPDATE phones SET is_primary = 1 WHERE id = ?`, [
      id,
    ]);
  }

  async delete(id: number): Promise<void> {
    await this.db.runAsync(`DELETE FROM phones WHERE id = ?`, [id]);
  }

  async deleteByContactId(contactId: number): Promise<void> {
    await this.db.runAsync(`DELETE FROM phones WHERE contact_id = ?`, [
      contactId,
    ]);
  }

  async replaceByContactId(
    contactId: number,
    phones: {
      phoneType?: string;
      phoneNumber: string;
      isPrimary?: boolean;
    }[],
  ): Promise<void> {
    await this.deleteByContactId(contactId);

    for (let i = 0; i < phones.length; i++) {
      const phone = phones[i];

      if (!phone.phoneNumber.trim()) continue;

      await this.create({
        contactId,
        phoneType: phone.phoneType ?? "mobile",
        phoneNumber: phone.phoneNumber,
        isPrimary: phone.isPrimary ?? i === 0,
      });
    }
  }

  private async clearPrimary(contactId: number): Promise<void> {
    await this.db.runAsync(
      `
      UPDATE phones
      SET is_primary = 0
      WHERE contact_id = ?
      `,
      [contactId],
    );
  }

  private toDomain(row: any): Phone {
    return {
      id: row.id,
      contactId: row.contact_id,
      phoneType: row.phone_type,
      phoneNumber: row.phone_number,
      isPrimary: row.is_primary === 1,
    };
  }
}
