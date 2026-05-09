import type { SQLiteDatabase } from "expo-sqlite";
import { Address } from "../../domain/Contact";

export type AddressInput = {
  addressType?: string;
  postalCode?: string;
  addressLine1: string;
  addressLine2?: string;
  city?: string;
  region?: string;
  country?: string;
  isPrimary?: boolean;
};

export class AddressRepository {
  constructor(private db: SQLiteDatabase) {}

  async findAll(): Promise<Address[]> {
    const rows = await this.db.getAllAsync<any>(
      `
      SELECT *
      FROM addresses
      ORDER BY is_primary DESC, id DESC
      `,
    );

    return rows.map(this.toDomain);
  }

  async findById(id: number): Promise<Address | null> {
    const row = await this.db.getFirstAsync<any>(
      `
      SELECT *
      FROM addresses
      WHERE id = ?
      `,
      [id],
    );

    return row ? this.toDomain(row) : null;
  }

  async create(input: AddressInput): Promise<number> {
    if (input.isPrimary) {
      await this.clearPrimary();
    }

    const now = new Date().toISOString();

    const result = await this.db.runAsync(
      `
      INSERT INTO addresses
      (
        address_type,
        postal_code,
        address_line1,
        address_line2,
        city,
        region,
        country,
        is_primary,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        input.addressType ?? "home",
        input.postalCode ?? null,
        input.addressLine1.trim(),
        input.addressLine2 ?? null,
        input.city ?? null,
        input.region ?? null,
        input.country ?? "KR",
        input.isPrimary ? 1 : 0,
        now,
      ],
    );

    return result.lastInsertRowId;
  }

  async update(id: number, input: AddressInput): Promise<void> {
    if (input.isPrimary) {
      await this.clearPrimary();
    }

    await this.db.runAsync(
      `
      UPDATE addresses
      SET
        address_type = ?,
        postal_code = ?,
        address_line1 = ?,
        address_line2 = ?,
        city = ?,
        region = ?,
        country = ?,
        is_primary = ?
      WHERE id = ?
      `,
      [
        input.addressType ?? "home",
        input.postalCode ?? null,
        input.addressLine1.trim(),
        input.addressLine2 ?? null,
        input.city ?? null,
        input.region ?? null,
        input.country ?? "KR",
        input.isPrimary ? 1 : 0,
        id,
      ],
    );
  }

  async delete(id: number): Promise<void> {
    await this.db.runAsync(
      `
      DELETE FROM addresses
      WHERE id = ?
      `,
      [id],
    );
  }

  async setPrimary(id: number): Promise<void> {
    await this.clearPrimary();

    await this.db.runAsync(
      `
      UPDATE addresses
      SET is_primary = 1
      WHERE id = ?
      `,
      [id],
    );
  }

  private async clearPrimary() {
    await this.db.runAsync(
      `
      UPDATE addresses
      SET is_primary = 0
      `,
    );
  }

  private toDomain(row: any): Address {
    return {
      id: row.id,
      addressType: row.address_type,
      postalCode: row.postal_code,
      addressLine1: row.address_line1,
      addressLine2: row.address_line2,
      city: row.city,
      region: row.region,
      country: row.country,
      isPrimary: row.is_primary === 1,
      createdAt: row.created_at,
    };
  }
}
