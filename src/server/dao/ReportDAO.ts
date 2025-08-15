import { database } from '../database/config';
import { Report, CreateReportRequest, ReportWithFields } from '../types';

export class ReportDAO {
  async create(reportData: CreateReportRequest): Promise<Report> {
    const result = await database.run(
      `INSERT INTO reports (countryId, name) VALUES (?, ?)`,
      [reportData.countryId, reportData.name]
    );
    
    const newReport = await database.get(
      `SELECT * FROM reports WHERE id = ?`,
      [result.lastID]
    );
    
    return newReport;
  }

  async findAll(search?: string): Promise<Report[]> {
    let query = `
      SELECT r.*, c.name as countryName 
      FROM reports r 
      LEFT JOIN countries c ON r.countryId = c.id
    `;
    let params: any[] = [];

    if (search) {
      query += ` WHERE r.name LIKE ? OR c.name LIKE ?`;
      const searchPattern = `%${search}%`;
      params = [searchPattern, searchPattern];
    }

    query += ` ORDER BY c.name ASC, r.name ASC`;

    return await database.all(query, params);
  }

  async findByCountryId(countryId: number): Promise<Report[]> {
    return await database.all(
      `SELECT * FROM reports WHERE countryId = ? ORDER BY name ASC`,
      [countryId]
    );
  }

  async findById(id: number): Promise<Report | null> {
    const report = await database.get(
      `SELECT r.*, c.name as countryName 
       FROM reports r 
       LEFT JOIN countries c ON r.countryId = c.id 
       WHERE r.id = ?`,
      [id]
    );
    
    return report || null;
  }

  async findByIdWithFields(id: number): Promise<ReportWithFields | null> {
    const report = await this.findById(id);
    if (!report) return null;

    // Get country details
    const country = await database.get(
      `SELECT * FROM countries WHERE id = ?`,
      [report.countryId]
    );

    // Get fields
    const fields = await database.all(
      `SELECT * FROM fields WHERE reportId = ? ORDER BY name ASC`,
      [id]
    );

    return {
      ...report,
      country,
      fields
    };
  }

  async update(id: number, reportData: Partial<CreateReportRequest>): Promise<Report | null> {
    const fields: string[] = [];
    const values: any[] = [];

    if (reportData.countryId !== undefined) {
      fields.push('countryId = ?');
      values.push(reportData.countryId);
    }
    if (reportData.name !== undefined) {
      fields.push('name = ?');
      values.push(reportData.name);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(id);

    await database.run(
      `UPDATE reports SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await database.run(
      `DELETE FROM reports WHERE id = ?`,
      [id]
    );

    return result.changes > 0;
  }

  async exists(countryId: number, name: string, excludeId?: number): Promise<boolean> {
    let query = `SELECT 1 FROM reports WHERE countryId = ? AND name = ?`;
    let params: any[] = [countryId, name];

    if (excludeId) {
      query += ` AND id != ?`;
      params.push(excludeId);
    }

    const result = await database.get(query, params);
    return !!result;
  }

  async getReportFieldsForPDF(id: number): Promise<any> {
    const report = await this.findByIdWithFields(id);
    if (!report) return null;

    const formattedFields = report.fields?.map(field => {
      let value = '';
      
      switch (field.type) {
        case 'FIXED':
          value = field.source || '';
          break;
        case 'FORMULA':
          value = field.formula || '';
          break;
        case 'INPUT':
          value = field.inputValue || '';
          break;
      }

      return {
        name: field.name,
        type: field.type,
        value
      };
    });

    return {
      report: {
        name: report.name,
        country: report.country?.name
      },
      fields: formattedFields
    };
  }
}