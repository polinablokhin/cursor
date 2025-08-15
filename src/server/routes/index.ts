import { Router } from 'express';
import { CountryController } from '../controllers/CountryController';
import { VATRateController } from '../controllers/VATRateController';
import { ReportController } from '../controllers/ReportController';
import { FieldController } from '../controllers/FieldController';

const router = Router();

// Initialize controllers
const countryController = new CountryController();
const vatRateController = new VATRateController();
const reportController = new ReportController();
const fieldController = new FieldController();

// Countries routes
router.get('/countries', CountryController.validateSearch, (req, res) => countryController.getAll(req, res));
router.get('/countries/:id', CountryController.validateId, (req, res) => countryController.getById(req, res));
router.get('/countries/:id/details', CountryController.validateId, (req, res) => countryController.getByIdWithDetails(req, res));
router.post('/countries', CountryController.validateCreate, (req, res) => countryController.create(req, res));
router.put('/countries/:id', CountryController.validateUpdate, (req, res) => countryController.update(req, res));
router.delete('/countries/:id', CountryController.validateId, (req, res) => countryController.delete(req, res));

// VAT Rates routes
router.get('/vat-rates', (req, res) => vatRateController.getAll(req, res));
router.get('/vat-rates/:id', VATRateController.validateId, (req, res) => vatRateController.getById(req, res));
router.get('/countries/:countryId/vat-rates', VATRateController.validateCountryId, (req, res) => vatRateController.getByCountryId(req, res));
router.post('/vat-rates', VATRateController.validateCreate, (req, res) => vatRateController.create(req, res));
router.put('/vat-rates/:id', VATRateController.validateUpdate, (req, res) => vatRateController.update(req, res));
router.delete('/vat-rates/:id', VATRateController.validateId, (req, res) => vatRateController.delete(req, res));

// Reports routes
router.get('/reports', ReportController.validateSearch, (req, res) => reportController.getAll(req, res));
router.get('/reports/:id', ReportController.validateId, (req, res) => reportController.getById(req, res));
router.get('/reports/:id/details', ReportController.validateId, (req, res) => reportController.getByIdWithFields(req, res));
router.get('/countries/:countryId/reports', ReportController.validateCountryId, (req, res) => reportController.getByCountryId(req, res));
router.post('/reports', ReportController.validateCreate, (req, res) => reportController.create(req, res));
router.put('/reports/:id', ReportController.validateUpdate, (req, res) => reportController.update(req, res));
router.delete('/reports/:id', ReportController.validateId, (req, res) => reportController.delete(req, res));
router.post('/reports/:id/pdf', ReportController.validateId, (req, res) => reportController.generatePDF(req, res));

// Fields routes
router.get('/fields', (req, res) => fieldController.getAll(req, res));
router.get('/fields/:id', FieldController.validateId, (req, res) => fieldController.getById(req, res));
router.get('/reports/:reportId/fields', FieldController.validateReportId, (req, res) => fieldController.getByReportId(req, res));
router.get('/reports/:reportId/fields/:type', FieldController.validateReportId, (req, res) => fieldController.getFieldsByType(req, res));
router.post('/fields', FieldController.validateCreate, (req, res) => fieldController.create(req, res));
router.put('/fields/:id', FieldController.validateUpdate, (req, res) => fieldController.update(req, res));
router.delete('/fields/:id', FieldController.validateId, (req, res) => fieldController.delete(req, res));

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

export default router;