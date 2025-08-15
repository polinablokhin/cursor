import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import { ReportDAO } from '../dao/ReportDAO';

export class PDFService {
  private reportDAO: ReportDAO;

  constructor() {
    this.reportDAO = new ReportDAO();
  }

  async generateReportPDF(reportId: number, customTemplate?: string): Promise<Buffer> {
    try {
      // Get report data
      const reportData = await this.reportDAO.getReportFieldsForPDF(reportId);
      if (!reportData) {
        throw new Error('Report not found');
      }

      // Use custom template or default
      const template = customTemplate || this.getDefaultTemplate();
      
      // Compile template
      const compiledTemplate = handlebars.compile(template);
      const html = compiledTemplate(reportData);

      // Generate PDF
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        }
      });

      await browser.close();
      return pdf;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  private getDefaultTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{report.name}} - Financial Report</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            line-height: 1.6;
        }
        
        .header {
            border-bottom: 3px solid #2c3e50;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #2c3e50;
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        
        .header .subtitle {
            color: #7f8c8d;
            font-size: 16px;
            margin-top: 5px;
        }
        
        .report-info {
            background-color: #ecf0f1;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 30px;
        }
        
        .report-info h2 {
            margin: 0 0 10px 0;
            color: #2c3e50;
            font-size: 20px;
        }
        
        .info-item {
            margin-bottom: 5px;
        }
        
        .info-label {
            font-weight: bold;
            color: #34495e;
        }
        
        .fields-section {
            margin-top: 30px;
        }
        
        .fields-title {
            color: #2c3e50;
            font-size: 22px;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        
        .field-group {
            margin-bottom: 25px;
        }
        
        .field-type-header {
            background-color: #3498db;
            color: white;
            padding: 10px 15px;
            font-weight: bold;
            font-size: 16px;
            border-radius: 5px 5px 0 0;
            margin: 0;
        }
        
        .field-type-header.fixed {
            background-color: #27ae60;
        }
        
        .field-type-header.formula {
            background-color: #e74c3c;
        }
        
        .field-type-header.input {
            background-color: #f39c12;
        }
        
        .field-items {
            border: 1px solid #bdc3c7;
            border-top: none;
            border-radius: 0 0 5px 5px;
        }
        
        .field-item {
            padding: 12px 15px;
            border-bottom: 1px solid #ecf0f1;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .field-item:last-child {
            border-bottom: none;
        }
        
        .field-item:nth-child(even) {
            background-color: #f8f9fa;
        }
        
        .field-name {
            font-weight: bold;
            color: #2c3e50;
            flex: 1;
        }
        
        .field-value {
            color: #7f8c8d;
            font-family: 'Courier New', monospace;
            background-color: #f4f4f4;
            padding: 4px 8px;
            border-radius: 3px;
            max-width: 60%;
            word-wrap: break-word;
        }
        
        .no-fields {
            padding: 20px;
            text-align: center;
            color: #7f8c8d;
            font-style: italic;
        }
        
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #bdc3c7;
            text-align: center;
            color: #7f8c8d;
            font-size: 12px;
        }
        
        @media print {
            body {
                margin: 0;
                padding: 15px;
            }
            
            .header {
                page-break-inside: avoid;
            }
            
            .field-group {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{report.name}}</h1>
        <div class="subtitle">Financial Report</div>
    </div>
    
    <div class="report-info">
        <h2>Report Information</h2>
        <div class="info-item">
            <span class="info-label">Country:</span> {{report.country}}
        </div>
        <div class="info-item">
            <span class="info-label">Generated:</span> {{formatDate}}
        </div>
        <div class="info-item">
            <span class="info-label">Total Fields:</span> {{fields.length}}
        </div>
    </div>

    <div class="fields-section">
        <h2 class="fields-title">Report Fields</h2>
        
        {{#groupBy fields 'type'}}
            <div class="field-group">
                <h3 class="field-type-header {{toLowerCase type}}">
                    {{#if (eq type 'FIXED')}}Fixed Fields{{/if}}
                    {{#if (eq type 'FORMULA')}}Formula Fields{{/if}}
                    {{#if (eq type 'INPUT')}}Input Fields{{/if}}
                </h3>
                
                <div class="field-items">
                    {{#if items}}
                        {{#each items}}
                            <div class="field-item">
                                <div class="field-name">{{name}}</div>
                                <div class="field-value">{{#if value}}{{value}}{{else}}<em>No value</em>{{/if}}</div>
                            </div>
                        {{/each}}
                    {{else}}
                        <div class="no-fields">No {{toLowerCase type}} fields found</div>
                    {{/if}}
                </div>
            </div>
        {{/groupBy}}
    </div>
    
    <div class="footer">
        <p>Generated by Financial Reporting Tool on {{formatDate}}</p>
    </div>

    <script>
        // Add current date
        document.addEventListener('DOMContentLoaded', function() {
            const elements = document.querySelectorAll('[data-date]');
            const now = new Date().toLocaleDateString();
            elements.forEach(el => el.textContent = now);
        });
    </script>
</body>
</html>
    `;
  }
}

// Register Handlebars helpers
handlebars.registerHelper('formatDate', function() {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

handlebars.registerHelper('toLowerCase', function(str: string) {
  return str ? str.toLowerCase() : '';
});

handlebars.registerHelper('eq', function(a: any, b: any) {
  return a === b;
});

handlebars.registerHelper('groupBy', function(array: any[], property: string, options: any) {
  if (!array || !Array.isArray(array)) return '';
  
  const groups: { [key: string]: any[] } = {};
  
  array.forEach(item => {
    const key = item[property];
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
  });
  
  let result = '';
  Object.keys(groups).forEach(key => {
    result += options.fn({
      type: key,
      items: groups[key]
    });
  });
  
  return result;
});