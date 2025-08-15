import { CountryDAO } from '../dao/CountryDAO';
import { VATRateDAO } from '../dao/VATRateDAO';
import { ReportDAO } from '../dao/ReportDAO';
import { FieldDAO } from '../dao/FieldDAO';
import { FieldType } from '../types';

async function seedDatabase(): Promise<void> {
  console.log('Starting database seeding...');

  const countryDAO = new CountryDAO();
  const vatRateDAO = new VATRateDAO();
  const reportDAO = new ReportDAO();
  const fieldDAO = new FieldDAO();

  try {
    // Seed Countries
    console.log('Seeding countries...');
    const countries = await Promise.all([
      countryDAO.create({
        name: 'United States',
        vatDirectory: '/usa/vat-documents/',
        accountantName: 'John Smith CPA'
      }),
      countryDAO.create({
        name: 'United Kingdom',
        vatDirectory: '/uk/hmrc-documents/',
        accountantName: 'Sarah Johnson ACCA'
      }),
      countryDAO.create({
        name: 'Germany',
        vatDirectory: '/de/steuer-dokumente/',
        accountantName: 'Klaus Mueller StB'
      }),
      countryDAO.create({
        name: 'France',
        vatDirectory: '/fr/documents-fiscaux/',
        accountantName: 'Marie Dubois Expert-Comptable'
      }),
      countryDAO.create({
        name: 'Canada',
        vatDirectory: '/ca/gst-hst-documents/',
        accountantName: 'Michael Brown CPA'
      })
    ]);

    // Seed VAT Rates
    console.log('Seeding VAT rates...');
    await Promise.all([
      // US rates
      vatRateDAO.create({ countryId: countries[0].id, rateName: 'Federal Sales Tax', rateValue: 0.00 }),
      vatRateDAO.create({ countryId: countries[0].id, rateName: 'California Sales Tax', rateValue: 7.25 }),
      vatRateDAO.create({ countryId: countries[0].id, rateName: 'New York Sales Tax', rateValue: 8.00 }),
      
      // UK rates
      vatRateDAO.create({ countryId: countries[1].id, rateName: 'Standard VAT', rateValue: 20.00 }),
      vatRateDAO.create({ countryId: countries[1].id, rateName: 'Reduced VAT', rateValue: 5.00 }),
      vatRateDAO.create({ countryId: countries[1].id, rateName: 'Zero VAT', rateValue: 0.00 }),
      
      // Germany rates
      vatRateDAO.create({ countryId: countries[2].id, rateName: 'Standard MwSt', rateValue: 19.00 }),
      vatRateDAO.create({ countryId: countries[2].id, rateName: 'Reduced MwSt', rateValue: 7.00 }),
      
      // France rates
      vatRateDAO.create({ countryId: countries[3].id, rateName: 'TVA Standard', rateValue: 20.00 }),
      vatRateDAO.create({ countryId: countries[3].id, rateName: 'TVA Réduite', rateValue: 10.00 }),
      vatRateDAO.create({ countryId: countries[3].id, rateName: 'TVA Super Réduite', rateValue: 2.10 }),
      
      // Canada rates
      vatRateDAO.create({ countryId: countries[4].id, rateName: 'GST', rateValue: 5.00 }),
      vatRateDAO.create({ countryId: countries[4].id, rateName: 'Ontario HST', rateValue: 13.00 }),
      vatRateDAO.create({ countryId: countries[4].id, rateName: 'Quebec GST+QST', rateValue: 14.975 })
    ]);

    // Seed Reports
    console.log('Seeding reports...');
    const reports = await Promise.all([
      // US Reports
      reportDAO.create({ countryId: countries[0].id, name: 'Q4 2023 Sales Tax Report' }),
      reportDAO.create({ countryId: countries[0].id, name: 'Annual Income Statement 2023' }),
      
      // UK Reports
      reportDAO.create({ countryId: countries[1].id, name: 'VAT Return Q4 2023' }),
      reportDAO.create({ countryId: countries[1].id, name: 'Annual Financial Statement' }),
      
      // Germany Reports
      reportDAO.create({ countryId: countries[2].id, name: 'Umsatzsteuervoranmeldung Q4' }),
      reportDAO.create({ countryId: countries[2].id, name: 'Jahresabschluss 2023' }),
      
      // France Reports
      reportDAO.create({ countryId: countries[3].id, name: 'Déclaration TVA T4 2023' }),
      
      // Canada Reports
      reportDAO.create({ countryId: countries[4].id, name: 'GST/HST Return Q4 2023' })
    ]);

    // Seed Fields
    console.log('Seeding fields...');
    
    // US Q4 Sales Tax Report Fields
    await Promise.all([
      fieldDAO.create({
        reportId: reports[0].id,
        name: 'Total Sales',
        type: FieldType.INPUT,
        inputValue: '1250000.00'
      }),
      fieldDAO.create({
        reportId: reports[0].id,
        name: 'Taxable Sales',
        type: FieldType.FORMULA,
        formula: 'Total Sales * 0.85'
      }),
      fieldDAO.create({
        reportId: reports[0].id,
        name: 'Reporting Period',
        type: FieldType.FIXED,
        source: 'Q4 2023 (October 1 - December 31, 2023)'
      }),
      fieldDAO.create({
        reportId: reports[0].id,
        name: 'Tax Rate Applied',
        type: FieldType.FIXED,
        source: '7.25% (California)'
      }),
      fieldDAO.create({
        reportId: reports[0].id,
        name: 'Tax Amount Due',
        type: FieldType.FORMULA,
        formula: 'Taxable Sales * 0.0725'
      })
    ]);

    // UK VAT Return Fields
    await Promise.all([
      fieldDAO.create({
        reportId: reports[2].id,
        name: 'VAT Output Tax',
        type: FieldType.INPUT,
        inputValue: '185000.00'
      }),
      fieldDAO.create({
        reportId: reports[2].id,
        name: 'VAT Input Tax',
        type: FieldType.INPUT,
        inputValue: '32000.00'
      }),
      fieldDAO.create({
        reportId: reports[2].id,
        name: 'Net VAT Due',
        type: FieldType.FORMULA,
        formula: 'VAT Output Tax - VAT Input Tax'
      }),
      fieldDAO.create({
        reportId: reports[2].id,
        name: 'VAT Period',
        type: FieldType.FIXED,
        source: '01/10/2023 to 31/12/2023'
      }),
      fieldDAO.create({
        reportId: reports[2].id,
        name: 'Standard Rate Sales',
        type: FieldType.INPUT,
        inputValue: '925000.00'
      })
    ]);

    // Germany Umsatzsteuer Fields
    await Promise.all([
      fieldDAO.create({
        reportId: reports[4].id,
        name: 'Umsätze 19% MwSt',
        type: FieldType.INPUT,
        inputValue: '567890.00'
      }),
      fieldDAO.create({
        reportId: reports[4].id,
        name: 'Umsätze 7% MwSt',
        type: FieldType.INPUT,
        inputValue: '123456.00'
      }),
      fieldDAO.create({
        reportId: reports[4].id,
        name: 'Geschuldete MwSt 19%',
        type: FieldType.FORMULA,
        formula: 'Umsätze 19% MwSt * 0.19'
      }),
      fieldDAO.create({
        reportId: reports[4].id,
        name: 'Geschuldete MwSt 7%',
        type: FieldType.FORMULA,
        formula: 'Umsätze 7% MwSt * 0.07'
      }),
      fieldDAO.create({
        reportId: reports[4].id,
        name: 'Berichtszeitraum',
        type: FieldType.FIXED,
        source: 'Oktober - Dezember 2023'
      })
    ]);

    // France TVA Fields
    await Promise.all([
      fieldDAO.create({
        reportId: reports[6].id,
        name: 'Chiffre d\'affaires HT',
        type: FieldType.INPUT,
        inputValue: '456789.00'
      }),
      fieldDAO.create({
        reportId: reports[6].id,
        name: 'TVA collectée',
        type: FieldType.FORMULA,
        formula: 'Chiffre d\'affaires HT * 0.20'
      }),
      fieldDAO.create({
        reportId: reports[6].id,
        name: 'TVA déductible',
        type: FieldType.INPUT,
        inputValue: '15678.00'
      }),
      fieldDAO.create({
        reportId: reports[6].id,
        name: 'Période de déclaration',
        type: FieldType.FIXED,
        source: 'Trimestre 4 - 2023'
      })
    ]);

    // Canada GST/HST Fields
    await Promise.all([
      fieldDAO.create({
        reportId: reports[7].id,
        name: 'Total Sales',
        type: FieldType.INPUT,
        inputValue: '789123.00'
      }),
      fieldDAO.create({
        reportId: reports[7].id,
        name: 'GST Collected',
        type: FieldType.FORMULA,
        formula: 'Total Sales * 0.05'
      }),
      fieldDAO.create({
        reportId: reports[7].id,
        name: 'GST Paid',
        type: FieldType.INPUT,
        inputValue: '12345.00'
      }),
      fieldDAO.create({
        reportId: reports[7].id,
        name: 'Net GST',
        type: FieldType.FORMULA,
        formula: 'GST Collected - GST Paid'
      }),
      fieldDAO.create({
        reportId: reports[7].id,
        name: 'Reporting Period',
        type: FieldType.FIXED,
        source: 'October 1 - December 31, 2023'
      })
    ]);

    // Add some additional fields to Annual Reports
    await Promise.all([
      // US Annual Income Statement
      fieldDAO.create({
        reportId: reports[1].id,
        name: 'Total Revenue',
        type: FieldType.INPUT,
        inputValue: '4850000.00'
      }),
      fieldDAO.create({
        reportId: reports[1].id,
        name: 'Operating Expenses',
        type: FieldType.INPUT,
        inputValue: '3200000.00'
      }),
      fieldDAO.create({
        reportId: reports[1].id,
        name: 'Net Income',
        type: FieldType.FORMULA,
        formula: 'Total Revenue - Operating Expenses'
      }),
      fieldDAO.create({
        reportId: reports[1].id,
        name: 'Fiscal Year',
        type: FieldType.FIXED,
        source: 'January 1 - December 31, 2023'
      }),

      // UK Annual Financial Statement
      fieldDAO.create({
        reportId: reports[3].id,
        name: 'Turnover',
        type: FieldType.INPUT,
        inputValue: '3675000.00'
      }),
      fieldDAO.create({
        reportId: reports[3].id,
        name: 'Cost of Sales',
        type: FieldType.INPUT,
        inputValue: '2456000.00'
      }),
      fieldDAO.create({
        reportId: reports[3].id,
        name: 'Gross Profit',
        type: FieldType.FORMULA,
        formula: 'Turnover - Cost of Sales'
      }),
      fieldDAO.create({
        reportId: reports[3].id,
        name: 'Financial Year',
        type: FieldType.FIXED,
        source: '1 April 2023 to 31 March 2024'
      }),

      // Germany Jahresabschluss
      fieldDAO.create({
        reportId: reports[5].id,
        name: 'Umsatzerlöse',
        type: FieldType.INPUT,
        inputValue: '2890000.00'
      }),
      fieldDAO.create({
        reportId: reports[5].id,
        name: 'Materialaufwand',
        type: FieldType.INPUT,
        inputValue: '1567000.00'
      }),
      fieldDAO.create({
        reportId: reports[5].id,
        name: 'Rohertrag',
        type: FieldType.FORMULA,
        formula: 'Umsatzerlöse - Materialaufwand'
      }),
      fieldDAO.create({
        reportId: reports[5].id,
        name: 'Geschäftsjahr',
        type: FieldType.FIXED,
        source: '1. Januar - 31. Dezember 2023'
      })
    ]);

    console.log('Database seeding completed successfully!');
    console.log(`
📊 Seeded data summary:
├── Countries: ${countries.length}
├── VAT Rates: 14
├── Reports: ${reports.length}
└── Fields: 41

🌍 Countries with data:
├── United States (2 reports, 3 VAT rates)
├── United Kingdom (2 reports, 3 VAT rates)
├── Germany (2 reports, 2 VAT rates)
├── France (1 report, 3 VAT rates)
└── Canada (1 report, 3 VAT rates)
    `);

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };