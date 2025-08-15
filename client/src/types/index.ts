export interface Country {
  id: number;
  name: string;
  vatDirectory?: string;
  accountantName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VATRate {
  id: number;
  countryId: number;
  rateName: string;
  rateValue: number;
  countryName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Report {
  id: number;
  countryId: number;
  name: string;
  countryName?: string;
  createdAt?: string;
  updatedAt?: string;
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
  reportName?: string;
  countryName?: string;
  createdAt?: string;
  updatedAt?: string;
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

export interface ApiError {
  error: string;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
}

export interface SearchFilters {
  search?: string;
  countryId?: number;
  reportId?: number;
  fieldType?: FieldType;
}

// Form state interfaces
export interface CountryFormData {
  name: string;
  vatDirectory: string;
  accountantName: string;
}

export interface VATRateFormData {
  countryId: string;
  rateName: string;
  rateValue: string;
}

export interface ReportFormData {
  countryId: string;
  name: string;
}

export interface FieldFormData {
  reportId: string;
  name: string;
  type: FieldType;
  source: string;
  formula: string;
  inputValue: string;
}

// UI state interfaces
export interface LoadingState {
  countries: boolean;
  vatRates: boolean;
  reports: boolean;
  fields: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  generatingPDF: boolean;
}

export interface ModalState {
  isOpen: boolean;
  type: 'create' | 'edit' | 'delete' | 'view' | null;
  entity: 'country' | 'vatRate' | 'report' | 'field' | null;
  data?: any;
}

export interface NotificationState {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  isVisible: boolean;
}