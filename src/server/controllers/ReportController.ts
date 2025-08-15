import { Request, Response } from 'express';
import { ReportDAO } from '../dao/ReportDAO';
import { CountryDAO } from '../dao/CountryDAO';
import { CreateReportRequest, PDFGenerationRequest } from '../types';
import { body, param, query, validationResult } from 'express-validator';
import { PDFService } from '../services/PDFService';

export class ReportController {
  private reportDAO: ReportDAO;
  private countryDAO: CountryDAO;
  private pdfService: PDFService;

  constructor() {
    this.reportDAO = new ReportDAO();
    this.countryDAO = new CountryDAO();
    this.pdfService = new PDFService();
  }

  // Validation rules
  static validateCreate = [
    body('countryId').isInt({ min: 1 }).withMessage('Valid country ID is required'),
    body('name').notEmpty().withMessage('Report name is required'),
  ];

  static validateUpdate = [
    param('id').isInt({ min: 1 }).withMessage('Valid report ID is required'),
    body('countryId').optional().isInt({ min: 1 }).withMessage('Valid country ID is required'),
    body('name').optional().notEmpty().withMessage('Report name cannot be empty'),
  ];

  static validateId = [
    param('id').isInt({ min: 1 }).withMessage('Valid report ID is required'),
  ];

  static validateCountryId = [
    param('countryId').isInt({ min: 1 }).withMessage('Valid country ID is required'),
  ];

  static validateSearch = [
    query('search').optional().isString(),
  ];

  async create(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const reportData: CreateReportRequest = req.body;

      // Check if country exists
      const country = await this.countryDAO.findById(reportData.countryId);
      if (!country) {
        res.status(404).json({ error: 'Country not found' });
        return;
      }

      // Check if report with same name already exists for this country
      const exists = await this.reportDAO.exists(reportData.countryId, reportData.name);
      if (exists) {
        res.status(409).json({ error: 'Report with this name already exists for this country' });
        return;
      }

      const report = await this.reportDAO.create(reportData);
      res.status(201).json(report);
    } catch (error) {
      console.error('Error creating report:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const search = req.query.search as string;
      const reports = await this.reportDAO.findAll(search);
      res.json(reports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getByCountryId(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const countryId = parseInt(req.params.countryId);
      
      // Check if country exists
      const country = await this.countryDAO.findById(countryId);
      if (!country) {
        res.status(404).json({ error: 'Country not found' });
        return;
      }

      const reports = await this.reportDAO.findByCountryId(countryId);
      res.json(reports);
    } catch (error) {
      console.error('Error fetching reports by country:', error);
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
      const report = await this.reportDAO.findById(id);

      if (!report) {
        res.status(404).json({ error: 'Report not found' });
        return;
      }

      res.json(report);
    } catch (error) {
      console.error('Error fetching report:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getByIdWithFields(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const id = parseInt(req.params.id);
      const report = await this.reportDAO.findByIdWithFields(id);

      if (!report) {
        res.status(404).json({ error: 'Report not found' });
        return;
      }

      res.json(report);
    } catch (error) {
      console.error('Error fetching report with fields:', error);
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
      const reportData: Partial<CreateReportRequest> = req.body;

      // Check if report exists
      const existingReport = await this.reportDAO.findById(id);
      if (!existingReport) {
        res.status(404).json({ error: 'Report not found' });
        return;
      }

      // Check if country exists (if being updated)
      if (reportData.countryId) {
        const country = await this.countryDAO.findById(reportData.countryId);
        if (!country) {
          res.status(404).json({ error: 'Country not found' });
          return;
        }
      }

      // Check if report name already exists for the country (if being updated)
      if (reportData.name || reportData.countryId) {
        const countryId = reportData.countryId || existingReport.countryId;
        const name = reportData.name || existingReport.name;
        const nameExists = await this.reportDAO.exists(countryId, name, id);
        if (nameExists) {
          res.status(409).json({ error: 'Report with this name already exists for this country' });
          return;
        }
      }

      const updatedReport = await this.reportDAO.update(id, reportData);
      res.json(updatedReport);
    } catch (error) {
      console.error('Error updating report:', error);
      res.status(500).json({ error: 'Internal server error' });
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

      // Check if report exists
      const existingReport = await this.reportDAO.findById(id);
      if (!existingReport) {
        res.status(404).json({ error: 'Report not found' });
        return;
      }

      const deleted = await this.reportDAO.delete(id);
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'Report not found' });
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async generatePDF(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const id = parseInt(req.params.id);
      const template = req.body.template as string;

      // Check if report exists
      const report = await this.reportDAO.findByIdWithFields(id);
      if (!report) {
        res.status(404).json({ error: 'Report not found' });
        return;
      }

      const pdfBuffer = await this.pdfService.generateReportPDF(id, template);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${report.name}_report.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error generating PDF:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}