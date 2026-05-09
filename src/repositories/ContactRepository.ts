import type { SQLiteDatabase } from "expo-sqlite";
import type { Contact, ContactInput } from "../domain/Contact";

export class ContactRepository {
  constructor(private db: SQLiteDatabase) {}

  async findAll(keyword = ""): Promise<Contact[]> {
    const rows = await this.db.getAllAsync<any>(
      `
      SELECT DISTINCT c.*
      FROM contacts c
      LEFT JOIN phones p ON p.contact_id = c.id
      LEFT JOIN emails e ON e.contact_id = c.id
      WHERE c.name LIKE ?
         OR c.nickname LIKE ?
         OR p.phone_number LIKE ?
         OR e.email_address LIKE ?
      ORDER BY c.is_favorite DESC, c.name ASC
      `,
      [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`],
    );

    const contacts = await Promise.all(
      rows.map((row) => this.findById(row.id)),
    );

    return contacts.filter(Boolean) as Contact[];
  }

  async findById(id: number): Promise<Contact | null> {
    const row = await this.db.getFirstAsync<any>(
      `SELECT * FROM contacts WHERE id = ?`,
      [id],
    );

    if (!row) return null;

    const phones = await this.db.getAllAsync<any>(
      `SELECT * FROM phones WHERE contact_id = ? ORDER BY is_primary DESC, id ASC`,
      [id],
    );

    const emails = await this.db.getAllAsync<any>(
      `SELECT * FROM emails WHERE contact_id = ? ORDER BY is_primary DESC, id ASC`,
      [id],
    );

    const addresses = await this.db.getAllAsync<any>(
      `SELECT * FROM addresses WHERE contact_id = ? ORDER BY is_primary DESC, id ASC`,
      [id],
    );

    const tags = await this.db.getAllAsync<any>(
      `
      SELECT t.name
      FROM tags t
      JOIN contact_tags ct ON ct.tag_id = t.id
      WHERE ct.contact_id = ?
      ORDER BY t.name ASC
      `,
      [id],
    );

    const groups = await this.db.getAllAsync<any>(
      `
      SELECT g.name
      FROM groups g
      JOIN contact_groups cg ON cg.group_id = g.id
      WHERE cg.contact_id = ?
      ORDER BY g.name ASC
      `,
      [id],
    );

    return {
      id: row.id,
      name: row.name,
      nickname: row.nickname,
      memo: row.memo,
      isFavorite: row.is_favorite === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,

      phones: phones.map((p) => ({
        id: p.id,
        contactId: p.contact_id,
        phoneType: p.phone_type,
        phoneNumber: p.phone_number,
        isPrimary: p.is_primary === 1,
      })),

      emails: emails.map((e) => ({
        id: e.id,
        contactId: e.contact_id,
        emailType: e.email_type,
        emailAddress: e.email_address,
        isPrimary: e.is_primary === 1,
      })),

      addresses: addresses.map((a) => ({
        id: a.id,
        contactId: a.contact_id,
        addressType: a.address_type,
        postalCode: a.postal_code,
        addressLine1: a.address_line1,
        addressLine2: a.address_line2,
        city: a.city,
        region: a.region,
        country: a.country,
        isPrimary: a.is_primary === 1,
      })),

      tags: tags.map((t) => t.name),
      groups: groups.map((g) => g.name),
    };
  }

  async create(input: ContactInput): Promise<number> {
    const now = new Date().toISOString();

    let contactId = 0;

    await this.db.withTransactionAsync(async () => {
      const result = await this.db.runAsync(
        `
        INSERT INTO contacts
        (name, nickname, memo, is_favorite, created_at, updated_at)
        VALUES (?, ?, ?, 0, ?, ?)
        `,
        [input.name, input.nickname ?? null, input.memo ?? null, now, now],
      );

      contactId = result.lastInsertRowId;
      await this.replaceRelations(contactId, input);
    });

    return contactId;
  }

  async update(id: number, input: ContactInput) {
    const now = new Date().toISOString();

    await this.db.withTransactionAsync(async () => {
      await this.db.runAsync(
        `
        UPDATE contacts
        SET name = ?, nickname = ?, memo = ?, updated_at = ?
        WHERE id = ?
        `,
        [input.name, input.nickname ?? null, input.memo ?? null, now, id],
      );

      await this.replaceRelations(id, input);
    });
  }

  async toggleFavorite(id: number, isFavorite: boolean) {
    await this.db.runAsync(`UPDATE contacts SET is_favorite = ? WHERE id = ?`, [
      isFavorite ? 1 : 0,
      id,
    ]);
  }

  async delete(id: number) {
    await this.db.runAsync(`DELETE FROM contacts WHERE id = ?`, [id]);
  }

  private unique(values?: string[]) {
    return [...new Set((values ?? []).map((value) => value.trim()))].filter(
      Boolean,
    );
  }

  private async replaceRelations(contactId: number, input: ContactInput) {
    await this.db.runAsync(`DELETE FROM phones WHERE contact_id = ?`, [
      contactId,
    ]);

    await this.db.runAsync(`DELETE FROM emails WHERE contact_id = ?`, [
      contactId,
    ]);

    await this.db.runAsync(`DELETE FROM addresses WHERE contact_id = ?`, [
      contactId,
    ]);

    await this.db.runAsync(`DELETE FROM contact_tags WHERE contact_id = ?`, [
      contactId,
    ]);

    await this.db.runAsync(`DELETE FROM contact_groups WHERE contact_id = ?`, [
      contactId,
    ]);

    const now = new Date().toISOString();

    const uniquePhones = this.unique(input.phones);

    for (const [index, phone] of uniquePhones.entries()) {
      await this.db.runAsync(
        `
        INSERT INTO phones
        (contact_id, phone_type, phone_number, is_primary, created_at)
        VALUES (?, 'mobile', ?, ?, ?)
        `,
        [contactId, phone, index === 0 ? 1 : 0, now],
      );
    }

    const uniqueEmails = this.unique(input.emails);

    for (const [index, email] of uniqueEmails.entries()) {
      await this.db.runAsync(
        `
        INSERT INTO emails
        (contact_id, email_type, email_address, is_primary, created_at)
        VALUES (?, 'personal', ?, ?, ?)
        `,
        [contactId, email, index === 0 ? 1 : 0, now],
      );
    }

    const uniqueAddresses = this.unique(input.addresses);

    for (const [index, address] of uniqueAddresses.entries()) {
      await this.db.runAsync(
        `
        INSERT INTO addresses
        (contact_id, address_type, address_line1, country, is_primary, created_at)
        VALUES (?, 'home', ?, 'KR', ?, ?)
        `,
        [contactId, address, index === 0 ? 1 : 0, now],
      );
    }

    const uniqueTags = this.unique(input.tags);

    for (const name of uniqueTags) {
      await this.db.runAsync(
        `
    INSERT OR IGNORE INTO tags (name, created_at)
    VALUES (?, ?)
    `,
        [name, now],
      );

      const tag = await this.db.getFirstAsync<{ id: number }>(
        `SELECT id FROM tags WHERE name = ?`,
        [name],
      );

      if (!tag) continue;

      await this.db.runAsync(
        `
    INSERT OR IGNORE INTO contact_tags
    (contact_id, tag_id)
    VALUES (?, ?)
    `,
        [contactId, tag.id],
      );
    }

    const uniqueGroups = this.unique(input.groups);

    for (const name of uniqueGroups) {
      await this.db.runAsync(
        `
    INSERT OR IGNORE INTO groups (name, created_at)
    VALUES (?, ?)
    `,
        [name, now],
      );

      const group = await this.db.getFirstAsync<{ id: number }>(
        `SELECT id FROM groups WHERE name = ?`,
        [name],
      );

      if (!group) continue;

      await this.db.runAsync(
        `
    INSERT OR IGNORE INTO contact_groups
    (contact_id, group_id)
    VALUES (?, ?)
    `,
        [contactId, group.id],
      );
    }
  }
}
