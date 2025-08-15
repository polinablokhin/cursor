import { database } from '../database/config';
import { Country, CreateCountryRequest, CountryWithDetails } from '../types';

export class CountryDAO {
  async create(countryData: CreateCountryRequest): Promise<Country> {
    const result = await database.run(
      `INSERT INTO countries (name, vatDirectory, accountantName) VALUES (?, ?, ?)`,
      [countryData.name, countryData.vatDirectory, countryData.accountantName]
    );
    
    const newCountry = await database.get(
      `SELECT * FROM countries WHERE id = ?`,
      [result.lastID]
    );
    
    return newCountry;
  }

  async findAll(search?: string): Promise<Country[]> {
    let query = `SELECT * FROM countries`;
    let params: any[] = [];

    if (search) {
      query += ` WHERE name LIKE ? OR vatDirectory LIKE ? OR accountantName LIKE ?`;
      const searchPattern = `%${search}%`;
      params = [searchPattern, searchPattern, searchPattern];
    }

    query += ` ORDER BY name ASC`;

    return await database.all(query, params);
  }

  async findById(id: number): Promise<Country | null> {
    const country = await database.get(
      `SELECT * FROM countries WHERE id = ?`,
      [id]
    );
    
    return country || null;
  }

  async findByIdWithDetails(id: number): Promise<CountryWithDetails | null> {
    const country = await this.findById(id);
    if (!country) return null;

    // Get VAT rates
    const vatRates = await database.all(
      `SELECT * FROM vat_rates WHERE countryId = ? ORDER BY rateName ASC`,
      [id]
    );

    // Get reports
    const reports = await database.all(
      `SELECT * FROM reports WHERE countryId = ? ORDER BY name ASC`,
      [id]
    );

    return {
      ...country,
      vatRates,
      reports
    };
  }

  async update(id: number, countryData: Partial<CreateCountryRequest>): Promise<Country | null> {
    const fields: string[] = [];
    const values: any[] = [];

    if (countryData.name !== undefined) {
      fields.push('name = ?');
      values.push(countryData.name);
    }
    if (countryData.vatDirectory !== undefined) {
      fields.push('vatDirectory = ?');
      values.push(countryData.vatDirectory);
    }
    if (countryData.accountantName !== undefined) {
      fields.push('accountantName = ?');
      values.push(countryData.accountantName);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(id);

    await database.run(
      `UPDATE countries SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await database.run(
      `DELETE FROM countries WHERE id = ?`,
      [id]
    );

    return result.changes > 0;
  }

  async exists(name: string, excludeId?: number): Promise<boolean> {
    let query = `SELECT 1 FROM countries WHERE name = ?`;
    let params: any[] = [name];

    if (excludeId) {
      query += ` AND id != ?`;
      params.push(excludeId);
    }

    const result = await database.get(query, params);
    return !!result;
  }
}