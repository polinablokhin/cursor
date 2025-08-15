import { database } from './config';

export async function runMigrations(): Promise<void> {
  try {
    console.log('Starting database migrations...');

    // Create Countries table
    await database.run(`
      CREATE TABLE IF NOT EXISTS countries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL UNIQUE,
        vatDirectory VARCHAR(500),
        accountantName VARCHAR(255),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create VAT Rates table
    await database.run(`
      CREATE TABLE IF NOT EXISTS vat_rates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        countryId INTEGER NOT NULL,
        rateName VARCHAR(255) NOT NULL,
        rateValue DECIMAL(5,2) NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (countryId) REFERENCES countries(id) ON DELETE CASCADE,
        UNIQUE(countryId, rateName)
      )
    `);

    // Create Reports table
    await database.run(`
      CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        countryId INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (countryId) REFERENCES countries(id) ON DELETE CASCADE,
        UNIQUE(countryId, name)
      )
    `);

    // Create Fields table
    await database.run(`
      CREATE TABLE IF NOT EXISTS fields (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reportId INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('FIXED', 'FORMULA', 'INPUT')),
        source TEXT,
        formula TEXT,
        inputValue TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (reportId) REFERENCES reports(id) ON DELETE CASCADE,
        UNIQUE(reportId, name)
      )
    `);

    // Create indexes for better performance
    await database.run(`CREATE INDEX IF NOT EXISTS idx_vat_rates_country ON vat_rates(countryId)`);
    await database.run(`CREATE INDEX IF NOT EXISTS idx_reports_country ON reports(countryId)`);
    await database.run(`CREATE INDEX IF NOT EXISTS idx_fields_report ON fields(reportId)`);

    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('Migrations completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration error:', error);
      process.exit(1);
    });
}