# Financial Reporting Tool

A complete internal financial reporting application with database, REST API, and React frontend featuring conditional form logic and PDF generation.

## 🚀 Features

### Core Functionality
- **Full CRUD Operations** for Countries, VAT Rates, Reports, and Fields
- **Relational Database Structure** with proper foreign key relationships
- **Search & Filtering** across all entities
- **PDF Report Generation** with beautiful templates
- **Conditional Form Logic** - field types show only relevant inputs
- **Card-based UI** with modern, responsive design

### Database Entities

#### Countries
- Country management with VAT directory and accountant information
- One-to-many relationships with VAT rates and reports

#### VAT Rates
- Country-specific VAT rate management
- Support for multiple rates per country (standard, reduced, zero, etc.)

#### Reports
- Financial reports linked to countries
- Support for multiple reports per country

#### Fields
- **FIXED** - Static values with source information
- **FORMULA** - Calculated values with mathematical formulas
- **INPUT** - User-entered values with optional defaults

### Conditional Form Logic
The field creation/editing forms dynamically show only relevant inputs based on the selected field type:
- **FIXED fields** → Show only source input
- **FORMULA fields** → Show only formula input  
- **INPUT fields** → Show only default value input

## 🏗️ Architecture

### Backend (Node.js + TypeScript + Express)
- **Database**: SQLite with custom DAO layer
- **API**: RESTful endpoints with validation
- **PDF Generation**: Puppeteer + Handlebars templates
- **Migrations**: Automated database setup
- **Seeding**: Pre-populated example data

### Frontend (React + TypeScript + Tailwind CSS)
- **Routing**: React Router with protected routes
- **State Management**: React hooks and context
- **UI Components**: Reusable modal and form components
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React icon library

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Quick Start

1. **Clone and install dependencies**
```bash
git clone <repo-url>
cd financial-reporting-tool
npm install
```

2. **Set up the frontend**
```bash
cd client
npm install
cd ..
```

3. **Initialize the database**
```bash
npm run migrate
npm run seed
```

4. **Start the development servers**
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:3001
- Frontend development server on http://localhost:3000

### Manual Setup

**Backend only:**
```bash
npm run dev:server
```

**Frontend only:**
```bash
npm run dev:client
```

## 🎯 API Endpoints

### Countries
- `GET /api/countries` - List all countries (with search)
- `GET /api/countries/:id` - Get country by ID
- `GET /api/countries/:id/details` - Get country with VAT rates and reports
- `POST /api/countries` - Create new country
- `PUT /api/countries/:id` - Update country
- `DELETE /api/countries/:id` - Delete country

### VAT Rates
- `GET /api/vat-rates` - List all VAT rates
- `GET /api/vat-rates/:id` - Get VAT rate by ID
- `GET /api/countries/:countryId/vat-rates` - Get VAT rates for country
- `POST /api/vat-rates` - Create new VAT rate
- `PUT /api/vat-rates/:id` - Update VAT rate
- `DELETE /api/vat-rates/:id` - Delete VAT rate

### Reports
- `GET /api/reports` - List all reports (with search)
- `GET /api/reports/:id` - Get report by ID
- `GET /api/reports/:id/details` - Get report with fields
- `GET /api/countries/:countryId/reports` - Get reports for country
- `POST /api/reports` - Create new report
- `PUT /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report
- `POST /api/reports/:id/pdf` - Generate PDF report

### Fields
- `GET /api/fields` - List all fields
- `GET /api/fields/:id` - Get field by ID
- `GET /api/reports/:reportId/fields` - Get fields for report
- `GET /api/reports/:reportId/fields/:type` - Get fields by type
- `POST /api/fields` - Create new field
- `PUT /api/fields/:id` - Update field
- `DELETE /api/fields/:id` - Delete field

## 💾 Database Schema

```sql
-- Countries table
CREATE TABLE countries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE,
  vatDirectory VARCHAR(500),
  accountantName VARCHAR(255),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- VAT Rates table
CREATE TABLE vat_rates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  countryId INTEGER NOT NULL,
  rateName VARCHAR(255) NOT NULL,
  rateValue DECIMAL(5,2) NOT NULL,
  FOREIGN KEY (countryId) REFERENCES countries(id) ON DELETE CASCADE,
  UNIQUE(countryId, rateName)
);

-- Reports table
CREATE TABLE reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  countryId INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  FOREIGN KEY (countryId) REFERENCES countries(id) ON DELETE CASCADE,
  UNIQUE(countryId, name)
);

-- Fields table
CREATE TABLE fields (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reportId INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('FIXED', 'FORMULA', 'INPUT')),
  source TEXT,
  formula TEXT,
  inputValue TEXT,
  FOREIGN KEY (reportId) REFERENCES reports(id) ON DELETE CASCADE,
  UNIQUE(reportId, name)
);
```

## 🎨 UI Features

### Dashboard
- Overview statistics and quick navigation
- Recent reports list
- Quick action buttons
- System status indicators

### Countries Page
- Card-based country display
- Search functionality
- Add/Edit/Delete operations with modals
- Navigate to country details

### Reports Page
- Report listing with country information
- PDF generation with one-click download
- Search and filtering capabilities

### Fields Page
- Fields grouped by type (FIXED, FORMULA, INPUT)
- Conditional form logic demonstration
- Type-based filtering and search
- Visual field type indicators

### Conditional Forms
The field creation/editing forms showcase advanced conditional logic:

```typescript
// Example: Field type selection affects visible form fields
{formData.type === FieldType.FIXED && (
  <div className="field-transition entered">
    <label>Source Value *</label>
    <textarea
      value={formData.source}
      onChange={(e) => handleChange('source', e.target.value)}
      placeholder="Enter the fixed source value"
    />
  </div>
)}

{formData.type === FieldType.FORMULA && (
  <div className="field-transition entered">
    <label>Formula *</label>
    <textarea
      value={formData.formula}
      onChange={(e) => handleChange('formula', e.target.value)}
      placeholder="Enter the calculation formula"
    />
  </div>
)}
```

## 📄 PDF Generation

The application includes a sophisticated PDF generation system:

### Features
- Beautiful, professional report templates
- Handlebars template engine for customization
- Grouped fields by type with color coding
- Automatic date/time stamping
- Company branding and styling

### Template Structure
- Header with report name and metadata
- Report information section
- Fields grouped by type (FIXED, FORMULA, INPUT)
- Footer with generation timestamp

### Usage
```javascript
// Generate PDF for a report
const pdfBlob = await reportApi.generatePDF(reportId);
downloadPDF(pdfBlob, `${reportName}_report.pdf`);
```

## 🗂️ Sample Data

The application comes pre-seeded with realistic financial data:

### Countries (5)
- United States (with California and New York tax rates)
- United Kingdom (with standard, reduced, and zero VAT)
- Germany (with standard and reduced MwSt)
- France (with standard, reduced, and super-reduced TVA)
- Canada (with GST and provincial rates)

### Reports (8)
- Quarterly tax returns for each country
- Annual financial statements
- VAT return forms

### Fields (41)
- Mix of FIXED, FORMULA, and INPUT field types
- Real-world financial field examples
- Proper formulas and calculations

## 🚀 Production Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
```bash
# .env file
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-domain.com
```

### Docker Support (Optional)
The application can be containerized for deployment:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## 🔧 Development

### Scripts
- `npm run dev` - Start both frontend and backend in development
- `npm run dev:server` - Start backend only
- `npm run dev:client` - Start frontend only
- `npm run build` - Build both frontend and backend
- `npm run start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data

### Project Structure
```
financial-reporting-tool/
├── src/server/                 # Backend application
│   ├── controllers/           # API route handlers
│   ├── dao/                   # Data access objects
│   ├── database/              # Database configuration and migrations
│   ├── routes/                # API route definitions
│   ├── services/              # Business logic services
│   ├── types/                 # TypeScript type definitions
│   └── index.ts               # Server entry point
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API service layer
│   │   ├── types/             # TypeScript types
│   │   └── App.tsx            # Main app component
│   └── public/                # Static assets
├── database.sqlite            # SQLite database file (auto-generated)
├── package.json               # Project configuration
└── README.md                  # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 Todo / Future Enhancements

- [ ] Add user authentication and authorization
- [ ] Implement role-based access control
- [ ] Add data export functionality (Excel, CSV)
- [ ] Create advanced reporting dashboard with charts
- [ ] Add email notification system
- [ ] Implement audit logging
- [ ] Add data backup and restore functionality
- [ ] Create mobile-responsive improvements
- [ ] Add multi-language support
- [ ] Implement advanced formula evaluation engine

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with React, TypeScript, Node.js, and Express
- UI components styled with Tailwind CSS
- Icons provided by Lucide React
- PDF generation powered by Puppeteer
- Database management with SQLite

---

**Financial Reporting Tool v1.0** - A complete solution for international financial compliance and reporting.