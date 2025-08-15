import React, { useState, useEffect } from 'react';
import { X, Globe, Save } from 'lucide-react';
import { Country, CountryFormData } from '../types';

interface CountryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CountryFormData) => Promise<void>;
  country?: Country | null;
  mode: 'create' | 'edit';
}

const CountryModal: React.FC<CountryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  country,
  mode
}) => {
  const [formData, setFormData] = useState<CountryFormData>({
    name: '',
    vatDirectory: '',
    accountantName: ''
  });
  const [errors, setErrors] = useState<Partial<CountryFormData>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && country) {
        setFormData({
          name: country.name,
          vatDirectory: country.vatDirectory || '',
          accountantName: country.accountantName || ''
        });
      } else {
        setFormData({
          name: '',
          vatDirectory: '',
          accountantName: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, country]);

  const validateForm = (): boolean => {
    const newErrors: Partial<CountryFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Country name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Country name must be at least 2 characters';
    }

    if (formData.vatDirectory && formData.vatDirectory.trim().length > 0) {
      if (!formData.vatDirectory.startsWith('/')) {
        newErrors.vatDirectory = 'VAT directory must start with /';
      }
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
        const apiErrors: Partial<CountryFormData> = {};
        error.errors.forEach((err: any) => {
          if (err.field && err.message) {
            apiErrors[err.field as keyof CountryFormData] = err.message;
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

  const handleChange = (field: keyof CountryFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
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
        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded-lg mr-3">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {mode === 'create' ? 'Add New Country' : 'Edit Country'}
                </h3>
                <p className="text-sm text-gray-500">
                  {mode === 'create' 
                    ? 'Create a new country entry in the system'
                    : `Update information for ${country?.name}`
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
            {/* Country Name */}
            <div>
              <label className="form-label">
                Country Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`form-input ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter country name"
                disabled={loading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* VAT Directory */}
            <div>
              <label className="form-label">
                VAT Directory
              </label>
              <input
                type="text"
                value={formData.vatDirectory}
                onChange={(e) => handleChange('vatDirectory', e.target.value)}
                className={`form-input ${errors.vatDirectory ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="/path/to/vat/documents/"
                disabled={loading}
              />
              {errors.vatDirectory && (
                <p className="mt-1 text-sm text-red-600">{errors.vatDirectory}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Optional: File system path for VAT documents
              </p>
            </div>

            {/* Accountant Name */}
            <div>
              <label className="form-label">
                Accountant Name
              </label>
              <input
                type="text"
                value={formData.accountantName}
                onChange={(e) => handleChange('accountantName', e.target.value)}
                className="form-input"
                placeholder="Enter accountant name"
                disabled={loading}
              />
              <p className="mt-1 text-sm text-gray-500">
                Optional: Primary accountant for this country
              </p>
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
                    {mode === 'create' ? 'Create Country' : 'Update Country'}
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

export default CountryModal;