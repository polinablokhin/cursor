import { database } from '../database/config';
import { Field, CreateFieldRequest, FieldType } from '../types';

export class FieldDAO {
  async create(fieldData: CreateFieldRequest): Promise<Field> {
    // Validate field data based on type
    this.validateFieldData(fieldData);

    const result = await database.run(
      `INSERT INTO fields (reportId, name, type, source, formula, inputValue) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        fieldData.reportId,
        fieldData.name,
        fieldData.type,
        fieldData.source || null,
        fieldData.formula || null,
        fieldData.inputValue || null
      ]
    );
    
    const newField = await database.get(
      `SELECT * FROM fields WHERE id = ?`,
      [result.lastID]
    );
    
    return newField;
  }

  async findAll(): Promise<Field[]> {
    return await database.all(
      `SELECT f.*, r.name as reportName, c.name as countryName 
       FROM fields f 
       LEFT JOIN reports r ON f.reportId = r.id 
       LEFT JOIN countries c ON r.countryId = c.id 
       ORDER BY c.name ASC, r.name ASC, f.name ASC`
    );
  }

  async findByReportId(reportId: number): Promise<Field[]> {
    return await database.all(
      `SELECT * FROM fields WHERE reportId = ? ORDER BY name ASC`,
      [reportId]
    );
  }

  async findById(id: number): Promise<Field | null> {
    const field = await database.get(
      `SELECT * FROM fields WHERE id = ?`,
      [id]
    );
    
    return field || null;
  }

  async update(id: number, fieldData: Partial<CreateFieldRequest>): Promise<Field | null> {
    // If type is being updated, validate the entire field data
    if (fieldData.type) {
      const currentField = await this.findById(id);
      if (currentField) {
        const updatedField = { ...currentField, ...fieldData };
        this.validateFieldData(updatedField);
      }
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (fieldData.reportId !== undefined) {
      fields.push('reportId = ?');
      values.push(fieldData.reportId);
    }
    if (fieldData.name !== undefined) {
      fields.push('name = ?');
      values.push(fieldData.name);
    }
    if (fieldData.type !== undefined) {
      fields.push('type = ?');
      values.push(fieldData.type);
    }
    if (fieldData.source !== undefined) {
      fields.push('source = ?');
      values.push(fieldData.source);
    }
    if (fieldData.formula !== undefined) {
      fields.push('formula = ?');
      values.push(fieldData.formula);
    }
    if (fieldData.inputValue !== undefined) {
      fields.push('inputValue = ?');
      values.push(fieldData.inputValue);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(id);

    await database.run(
      `UPDATE fields SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await database.run(
      `DELETE FROM fields WHERE id = ?`,
      [id]
    );

    return result.changes > 0;
  }

  async exists(reportId: number, name: string, excludeId?: number): Promise<boolean> {
    let query = `SELECT 1 FROM fields WHERE reportId = ? AND name = ?`;
    let params: any[] = [reportId, name];

    if (excludeId) {
      query += ` AND id != ?`;
      params.push(excludeId);
    }

    const result = await database.get(query, params);
    return !!result;
  }

  private validateFieldData(fieldData: Partial<CreateFieldRequest>): void {
    if (!fieldData.type) return;

    switch (fieldData.type) {
      case FieldType.FIXED:
        if (!fieldData.source) {
          throw new Error('FIXED field type requires a source value');
        }
        if (fieldData.formula) {
          throw new Error('FIXED field type should not have a formula');
        }
        if (fieldData.inputValue) {
          throw new Error('FIXED field type should not have an input value');
        }
        break;

      case FieldType.FORMULA:
        if (!fieldData.formula) {
          throw new Error('FORMULA field type requires a formula value');
        }
        if (fieldData.source) {
          throw new Error('FORMULA field type should not have a source');
        }
        if (fieldData.inputValue) {
          throw new Error('FORMULA field type should not have an input value');
        }
        break;

      case FieldType.INPUT:
        if (fieldData.source) {
          throw new Error('INPUT field type should not have a source');
        }
        if (fieldData.formula) {
          throw new Error('INPUT field type should not have a formula');
        }
        // inputValue is optional for INPUT fields as it can be empty initially
        break;

      default:
        throw new Error(`Invalid field type: ${fieldData.type}`);
    }
  }

  async getFieldsByType(reportId: number, type: FieldType): Promise<Field[]> {
    return await database.all(
      `SELECT * FROM fields WHERE reportId = ? AND type = ? ORDER BY name ASC`,
      [reportId, type]
    );
  }
}