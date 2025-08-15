import React, { useState, useEffect } from 'react';
import { X, BarChart3, Save } from 'lucide-react';
import { Field, FieldFormData, FieldType, Report } from '../types';

interface FieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FieldFormData) => Promise<void>;
  field?: Field | null;
  mode: 'create' | 'edit';
  reports: Report[];
  selectedReportId?: number;
}

const FieldModal: React.FC<FieldModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  field,
  mode,
  reports,
  selectedReportId
}) => {
  const [formData, setFormData] = useState<FieldFormData>({
    reportId: '',
    name: '',
    type: FieldType.INPUT,
    source: '',
    formula: '',
    inputValue: ''
  });
  const [errors, setErrors] = useState<Partial<FieldFormData>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && field) {
        setFormData({
          reportId: field.reportId.toString(),
          name: field.name,
          type: field.type,
          source: field.source || '',
          formula: field.formula || '',
          inputValue: field.inputValue || ''
        });
      } else {
        setFormData({
          reportId: selectedReportId?.toString() || '',
          name: '',
          type: FieldType.INPUT,
          source: '',
          formula: '',
          inputValue: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, field, selectedReportId]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FieldFormData> = {};

    if (!formData.reportId) {
      newErrors.reportId = 'Report selection is required';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Field name is required';
    }

    // Conditional validation based on field type
    switch (formData.type) {
      case FieldType.FIXED:
        if (!formData.source.trim()) {
          newErrors.source = 'Source is required for FIXED field types';
        }
        break;
      case FieldType.FORMULA:
        if (!formData.formula.trim()) {
          newErrors.formula = 'Formula is required for FORMULA field types';
        }
        break;
      case FieldType.INPUT:
        // Input value is optional for INPUT fields
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      if (error.errors) {
        const apiErrors: Partial<FieldFormData> = {};
        error.errors.forEach((err: any) => {
          if (err.field && err.message) {
            apiErrors[err.field as keyof FieldFormData] = err.message;
          }
        });
        setErrors(apiErrors);
      } else if (error.error) {
        setErrors({ name: error.error });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof FieldFormData, value: string | FieldType) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleTypeChange = (newType: FieldType) => {
    setFormData(prev => ({
      ...prev,
      type: newType,
      // Clear other field type values when switching types
      source: '',
      formula: '',
      inputValue: ''
    }));
    // Clear any existing errors for type-specific fields
    setErrors(prev => ({
      ...prev,
      source: undefined,
      formula: undefined,
      inputValue: undefined
    }));
  };

  const getFieldTypeDescription = (type: FieldType): string => {
    switch (type) {
      case FieldType.FIXED:
        return 'Contains a fixed value that doesn\'t change';
      case FieldType.FORMULA:
        return 'Calculated value based on a formula';
      case FieldType.INPUT:
        return 'User-entered value that can be modified';
      default:
        return '';
    }
  };

  const getFieldTypeColor = (type: FieldType): string => {
    switch (type) {
      case FieldType.FIXED:
        return 'text-green-600 bg-green-50 border-green-200';
      case FieldType.FORMULA:
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case FieldType.INPUT:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-50 rounded-lg mr-3">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {mode === 'create' ? 'Add New Field' : 'Edit Field'}
                </h3>
                <p className="text-sm text-gray-500">
                  {mode === 'create' 
                    ? 'Create a new field for a report'
                    : `Update field "${field?.name}"`
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Report Selection */}
            <div>
              <label className="form-label">
                Report <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.reportId}
                onChange={(e) => handleChange('reportId', e.target.value)}
                className={`form-select ${errors.reportId ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                disabled={loading || mode === 'edit'}
              >
                <option value="">Select a report</option>
                {reports.map((report) => (
                  <option key={report.id} value={report.id}>
                    {report.name} ({report.countryName})
                  </option>
                ))}
              </select>
              {errors.reportId && (
                <p className="mt-1 text-sm text-red-600">{errors.reportId}</p>
              )}
            </div>

            {/* Field Name */}
            <div>
              <label className="form-label">
                Field Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`form-input ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter field name"
                disabled={loading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Field Type */}
            <div>
              <label className="form-label">
                Field Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 gap-3">
                {Object.values(FieldType).map((type) => (
                  <label
                    key={type}
                    className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                      formData.type === type
                        ? getFieldTypeColor(type)
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="fieldType"
                      value={type}
                      className="sr-only"
                      checked={formData.type === type}
                      onChange={() => handleTypeChange(type)}
                      disabled={loading}
                    />
                    <div className="flex w-full justify-between">
                      <div>
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">{type}</div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {getFieldTypeDescription(type)}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {formData.type === type && (
                          <div className="w-4 h-4 bg-current rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Conditional Fields Based on Type */}
            <div className="field-transition">
              {formData.type === FieldType.FIXED && (
                <div className="field-transition entered">
                  <label className="form-label">
                    Source Value <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.source}
                    onChange={(e) => handleChange('source', e.target.value)}
                    className={`form-input ${errors.source ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Enter the fixed source value"
                    rows={3}
                    disabled={loading}
                  />
                  {errors.source && (
                    <p className="mt-1 text-sm text-red-600">{errors.source}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    This value will remain constant in the report
                  </p>
                </div>
              )}

              {formData.type === FieldType.FORMULA && (
                <div className="field-transition entered">
                  <label className="form-label">
                    Formula <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.formula}
                    onChange={(e) => handleChange('formula', e.target.value)}
                    className={`form-input ${errors.formula ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Enter the calculation formula"
                    rows={3}
                    disabled={loading}
                  />
                  {errors.formula && (
                    <p className="mt-1 text-sm text-red-600">{errors.formula}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Example: "Total Sales * 0.20" or "Field1 + Field2"
                  </p>
                </div>
              )}

              {formData.type === FieldType.INPUT && (
                <div className="field-transition entered">
                  <label className="form-label">
                    Default Input Value
                  </label>
                  <input
                    type="text"
                    value={formData.inputValue}
                    onChange={(e) => handleChange('inputValue', e.target.value)}
                    className="form-input"
                    placeholder="Enter default value (optional)"
                    disabled={loading}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Optional: Default value for this input field
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary inline-flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {mode === 'create' ? 'Create Field' : 'Update Field'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FieldModal;