import { Request, Response } from 'express';
import { CountryDAO } from '../dao/CountryDAO';
import { CreateCountryRequest } from '../types';
import { body, param, query, validationResult } from 'express-validator';

export class CountryController {
  private countryDAO: CountryDAO;

  constructor() {
    this.countryDAO = new CountryDAO();
  }

  // Validation rules
  static validateCreate = [
    body('name').notEmpty().withMessage('Country name is required'),
    body('vatDirectory').optional().isString(),
    body('accountantName').optional().isString(),
  ];

  static validateUpdate = [
    param('id').isInt({ min: 1 }).withMessage('Valid country ID is required'),
    body('name').optional().notEmpty().withMessage('Country name cannot be empty'),
    body('vatDirectory').optional().isString(),
    body('accountantName').optional().isString(),
  ];

  static validateId = [
    param('id').isInt({ min: 1 }).withMessage('Valid country ID is required'),
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

      const countryData: CreateCountryRequest = req.body;

      // Check if country name already exists
      const exists = await this.countryDAO.exists(countryData.name);
      if (exists) {
        res.status(409).json({ error: 'Country with this name already exists' });
        return;
      }

      const country = await this.countryDAO.create(countryData);
      res.status(201).json(country);
    } catch (error) {
      console.error('Error creating country:', error);
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
      const countries = await this.countryDAO.findAll(search);
      res.json(countries);
    } catch (error) {
      console.error('Error fetching countries:', error);
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
      const country = await this.countryDAO.findById(id);

      if (!country) {
        res.status(404).json({ error: 'Country not found' });
        return;
      }

      res.json(country);
    } catch (error) {
      console.error('Error fetching country:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getByIdWithDetails(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const id = parseInt(req.params.id);
      const country = await this.countryDAO.findByIdWithDetails(id);

      if (!country) {
        res.status(404).json({ error: 'Country not found' });
        return;
      }

      res.json(country);
    } catch (error) {
      console.error('Error fetching country with details:', error);
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
      const countryData: Partial<CreateCountryRequest> = req.body;

      // Check if country exists
      const existingCountry = await this.countryDAO.findById(id);
      if (!existingCountry) {
        res.status(404).json({ error: 'Country not found' });
        return;
      }

      // Check if name already exists (if being updated)
      if (countryData.name) {
        const nameExists = await this.countryDAO.exists(countryData.name, id);
        if (nameExists) {
          res.status(409).json({ error: 'Country with this name already exists' });
          return;
        }
      }

      const updatedCountry = await this.countryDAO.update(id, countryData);
      res.json(updatedCountry);
    } catch (error) {
      console.error('Error updating country:', error);
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

      // Check if country exists
      const existingCountry = await this.countryDAO.findById(id);
      if (!existingCountry) {
        res.status(404).json({ error: 'Country not found' });
        return;
      }

      const deleted = await this.countryDAO.delete(id);
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'Country not found' });
      }
    } catch (error) {
      console.error('Error deleting country:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}