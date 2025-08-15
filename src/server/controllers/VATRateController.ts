import { Request, Response } from 'express';
import { VATRateDAO } from '../dao/VATRateDAO';
import { CountryDAO } from '../dao/CountryDAO';
import { CreateVATRateRequest } from '../types';
import { body, param, validationResult } from 'express-validator';

export class VATRateController {
  private vatRateDAO: VATRateDAO;
  private countryDAO: CountryDAO;

  constructor() {
    this.vatRateDAO = new VATRateDAO();
    this.countryDAO = new CountryDAO();
  }

  // Validation rules
  static validateCreate = [
    body('countryId').isInt({ min: 1 }).withMessage('Valid country ID is required'),
    body('rateName').notEmpty().withMessage('Rate name is required'),
    body('rateValue').isFloat({ min: 0, max: 100 }).withMessage('Rate value must be between 0 and 100'),
  ];

  static validateUpdate = [
    param('id').isInt({ min: 1 }).withMessage('Valid VAT rate ID is required'),
    body('countryId').optional().isInt({ min: 1 }).withMessage('Valid country ID is required'),
    body('rateName').optional().notEmpty().withMessage('Rate name cannot be empty'),
    body('rateValue').optional().isFloat({ min: 0, max: 100 }).withMessage('Rate value must be between 0 and 100'),
  ];

  static validateId = [
    param('id').isInt({ min: 1 }).withMessage('Valid VAT rate ID is required'),
  ];

  static validateCountryId = [
    param('countryId').isInt({ min: 1 }).withMessage('Valid country ID is required'),
  ];

  async create(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const vatRateData: CreateVATRateRequest = req.body;

      // Check if country exists
      const country = await this.countryDAO.findById(vatRateData.countryId);
      if (!country) {
        res.status(404).json({ error: 'Country not found' });
        return;
      }

      // Check if VAT rate with same name already exists for this country
      const exists = await this.vatRateDAO.exists(vatRateData.countryId, vatRateData.rateName);
      if (exists) {
        res.status(409).json({ error: 'VAT rate with this name already exists for this country' });
        return;
      }

      const vatRate = await this.vatRateDAO.create(vatRateData);
      res.status(201).json(vatRate);
    } catch (error) {
      console.error('Error creating VAT rate:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const vatRates = await this.vatRateDAO.findAll();
      res.json(vatRates);
    } catch (error) {
      console.error('Error fetching VAT rates:', error);
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

      const vatRates = await this.vatRateDAO.findByCountryId(countryId);
      res.json(vatRates);
    } catch (error) {
      console.error('Error fetching VAT rates by country:', error);
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
      const vatRate = await this.vatRateDAO.findById(id);

      if (!vatRate) {
        res.status(404).json({ error: 'VAT rate not found' });
        return;
      }

      res.json(vatRate);
    } catch (error) {
      console.error('Error fetching VAT rate:', error);
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
      const vatRateData: Partial<CreateVATRateRequest> = req.body;

      // Check if VAT rate exists
      const existingVATRate = await this.vatRateDAO.findById(id);
      if (!existingVATRate) {
        res.status(404).json({ error: 'VAT rate not found' });
        return;
      }

      // Check if country exists (if being updated)
      if (vatRateData.countryId) {
        const country = await this.countryDAO.findById(vatRateData.countryId);
        if (!country) {
          res.status(404).json({ error: 'Country not found' });
          return;
        }
      }

      // Check if rate name already exists for the country (if being updated)
      if (vatRateData.rateName || vatRateData.countryId) {
        const countryId = vatRateData.countryId || existingVATRate.countryId;
        const rateName = vatRateData.rateName || existingVATRate.rateName;
        const nameExists = await this.vatRateDAO.exists(countryId, rateName, id);
        if (nameExists) {
          res.status(409).json({ error: 'VAT rate with this name already exists for this country' });
          return;
        }
      }

      const updatedVATRate = await this.vatRateDAO.update(id, vatRateData);
      res.json(updatedVATRate);
    } catch (error) {
      console.error('Error updating VAT rate:', error);
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

      // Check if VAT rate exists
      const existingVATRate = await this.vatRateDAO.findById(id);
      if (!existingVATRate) {
        res.status(404).json({ error: 'VAT rate not found' });
        return;
      }

      const deleted = await this.vatRateDAO.delete(id);
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'VAT rate not found' });
      }
    } catch (error) {
      console.error('Error deleting VAT rate:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}