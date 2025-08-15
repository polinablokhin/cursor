export interface Country {
  id: number;
  name: string;
  vatDirectory?: string;
  accountantName?: string;
}

export interface VATRate {
  id: number;
  countryId: number;
  rateName: string;
  rateValue: number;
}

export interface Report {
  id: number;
  countryId: number;
  name: string;
}

export enum FieldType {
  FIXED = 'FIXED',
  FORMULA = 'FORMULA',
  INPUT = 'INPUT'
}

export interface Field {
  id: number;
  reportId: number;
  name: string;
  type: FieldType;
  source?: string;
  formula?: string;
  inputValue?: string;
}

export interface CreateCountryRequest {
  name: string;
  vatDirectory?: string;
  accountantName?: string;
}

export interface CreateVATRateRequest {
  countryId: number;
  rateName: string;
  rateValue: number;
}

export interface CreateReportRequest {
  countryId: number;
  name: string;
}

export interface CreateFieldRequest {
  reportId: number;
  name: string;
  type: FieldType;
  source?: string;
  formula?: string;
  inputValue?: string;
}

export interface CountryWithDetails extends Country {
  vatRates?: VATRate[];
  reports?: Report[];
}

export interface ReportWithFields extends Report {
  fields?: Field[];
  country?: Country;
}

export interface PDFGenerationRequest {
  reportId: number;
  template?: string;
}