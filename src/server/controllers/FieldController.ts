import { Request, Response } from 'express';
import { FieldDAO } from '../dao/FieldDAO';
import { ReportDAO } from '../dao/ReportDAO';
import { CreateFieldRequest, FieldType } from '../types';
import { body, param, validationResult } from 'express-validator';

export class FieldController {
  private fieldDAO: FieldDAO;
  private reportDAO: ReportDAO;

  constructor() {
    this.fieldDAO = new FieldDAO();
    this.reportDAO = new ReportDAO();
  }

  // Validation rules
  static validateCreate = [
    body('reportId').isInt({ min: 1 }).withMessage('Valid report ID is required'),
    body('name').notEmpty().withMessage('Field name is required'),
    body('type').isIn(['FIXED', 'FORMULA', 'INPUT']).withMessage('Type must be FIXED, FORMULA, or INPUT'),
    body('source').optional().isString(),
    body('formula').optional().isString(),
    body('inputValue').optional().isString(),
  ];

  static validateUpdate = [
    param('id').isInt({ min: 1 }).withMessage('Valid field ID is required'),
    body('reportId').optional().isInt({ min: 1 }).withMessage('Valid report ID is required'),
    body('name').optional().notEmpty().withMessage('Field name cannot be empty'),
    body('type').optional().isIn(['FIXED', 'FORMULA', 'INPUT']).withMessage('Type must be FIXED, FORMULA, or INPUT'),
    body('source').optional().isString(),
    body('formula').optional().isString(),
    body('inputValue').optional().isString(),
  ];

  static validateId = [
    param('id').isInt({ min: 1 }).withMessage('Valid field ID is required'),
  ];

  static validateReportId = [
    param('reportId').isInt({ min: 1 }).withMessage('Valid report ID is required'),
  ];

  async create(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const fieldData: CreateFieldRequest = req.body;

      // Check if report exists
      const report = await this.reportDAO.findById(fieldData.reportId);
      if (!report) {
        res.status(404).json({ error: 'Report not found' });
        return;
      }

      // Check if field with same name already exists for this report
      const exists = await this.fieldDAO.exists(fieldData.reportId, fieldData.name);
      if (exists) {
        res.status(409).json({ error: 'Field with this name already exists for this report' });
        return;
      }

      const field = await this.fieldDAO.create(fieldData);
      res.status(201).json(field);
    } catch (error) {
      console.error('Error creating field:', error);
      if (error instanceof Error && error.message.includes('field type')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const fields = await this.fieldDAO.findAll();
      res.json(fields);
    } catch (error) {
      console.error('Error fetching fields:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getByReportId(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const reportId = parseInt(req.params.reportId);
      
      // Check if report exists
      const report = await this.reportDAO.findById(reportId);
      if (!report) {
        res.status(404).json({ error: 'Report not found' });
        return;
      }

      const fields = await this.fieldDAO.findByReportId(reportId);
      res.json(fields);
    } catch (error) {
      console.error('Error fetching fields by report:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const id = parseInt(req.params.id);
      const field = await this.fieldDAO.findById(id);

      if (!field) {
        res.status(404).json({ error: 'Field not found' });
        return;
      }

      res.json(field);
    } catch (error) {
      console.error('Error fetching field:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const id = parseInt(req.params.id);
      const fieldData: Partial<CreateFieldRequest> = req.body;

      // Check if field exists
      const existingField = await this.fieldDAO.findById(id);
      if (!existingField) {
        res.status(404).json({ error: 'Field not found' });
        return;
      }

      // Check if report exists (if being updated)
      if (fieldData.reportId) {
        const report = await this.reportDAO.findById(fieldData.reportId);
        if (!report) {
          res.status(404).json({ error: 'Report not found' });
          return;
        }
      }

      // Check if field name already exists for the report (if being updated)
      if (fieldData.name || fieldData.reportId) {
        const reportId = fieldData.reportId || existingField.reportId;
        const name = fieldData.name || existingField.name;
        const nameExists = await this.fieldDAO.exists(reportId, name, id);
        if (nameExists) {
          res.status(409).json({ error: 'Field with this name already exists for this report' });
          return;
        }
      }

      const updatedField = await this.fieldDAO.update(id, fieldData);
      res.json(updatedField);
    } catch (error) {
      console.error('Error updating field:', error);
      if (error instanceof Error && error.message.includes('field type')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const id = parseInt(req.params.id);

      // Check if field exists
      const existingField = await this.fieldDAO.findById(id);
      if (!existingField) {
        res.status(404).json({ error: 'Field not found' });
        return;
      }

      const deleted = await this.fieldDAO.delete(id);
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'Field not found' });
      }
    } catch (error) {
      console.error('Error deleting field:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getFieldsByType(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const reportId = parseInt(req.params.reportId);
      const type = req.params.type as FieldType;

      // Validate field type
      if (!Object.values(FieldType).includes(type)) {
        res.status(400).json({ error: 'Invalid field type' });
        return;
      }

      // Check if report exists
      const report = await this.reportDAO.findById(reportId);
      if (!report) {
        res.status(404).json({ error: 'Report not found' });
        return;
      }

      const fields = await this.fieldDAO.getFieldsByType(reportId, type);
      res.json(fields);
    } catch (error) {
      console.error('Error fetching fields by type:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}