import { database } from '../database/config';
import { VATRate, CreateVATRateRequest } from '../types';

export class VATRateDAO {
  async create(vatRateData: CreateVATRateRequest): Promise<VATRate> {
    const result = await database.run(
      `INSERT INTO vat_rates (countryId, rateName, rateValue) VALUES (?, ?, ?)`,
      [vatRateData.countryId, vatRateData.rateName, vatRateData.rateValue]
    );
    
    const newVATRate = await database.get(
      `SELECT * FROM vat_rates WHERE id = ?`,
      [result.lastID]
    );
    
    return newVATRate;
  }

  async findAll(): Promise<VATRate[]> {
    return await database.all(
      `SELECT vr.*, c.name as countryName 
       FROM vat_rates vr 
       LEFT JOIN countries c ON vr.countryId = c.id 
       ORDER BY c.name ASC, vr.rateName ASC`
    );
  }

  async findByCountryId(countryId: number): Promise<VATRate[]> {
    return await database.all(
      `SELECT * FROM vat_rates WHERE countryId = ? ORDER BY rateName ASC`,
      [countryId]
    );
  }

  async findById(id: number): Promise<VATRate | null> {
    const vatRate = await database.get(
      `SELECT * FROM vat_rates WHERE id = ?`,
      [id]
    );
    
    return vatRate || null;
  }

  async update(id: number, vatRateData: Partial<CreateVATRateRequest>): Promise<VATRate | null> {
    const fields: string[] = [];
    const values: any[] = [];

    if (vatRateData.countryId !== undefined) {
      fields.push('countryId = ?');
      values.push(vatRateData.countryId);
    }
    if (vatRateData.rateName !== undefined) {
      fields.push('rateName = ?');
      values.push(vatRateData.rateName);
    }
    if (vatRateData.rateValue !== undefined) {
      fields.push('rateValue = ?');
      values.push(vatRateData.rateValue);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(id);

    await database.run(
      `UPDATE vat_rates SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await database.run(
      `DELETE FROM vat_rates WHERE id = ?`,
      [id]
    );

    return result.changes > 0;
  }

  async exists(countryId: number, rateName: string, excludeId?: number): Promise<boolean> {
    let query = `SELECT 1 FROM vat_rates WHERE countryId = ? AND rateName = ?`;
    let params: any[] = [countryId, rateName];

    if (excludeId) {
      query += ` AND id != ?`;
      params.push(excludeId);
    }

    const result = await database.get(query, params);
    return !!result;
  }
}