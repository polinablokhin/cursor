import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe,
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  User,
  FolderOpen,
  MoreHorizontal
} from 'lucide-react';
import { countryApi } from '../services/api';
import { Country, CountryFormData } from '../types';
import CountryModal from '../components/CountryModal';
import DeleteModal from '../components/DeleteModal';

const CountriesPage: React.FC = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  useEffect(() => {
    loadCountries();
  }, []);

  useEffect(() => {
    // Filter countries based on search term
    if (searchTerm.trim() === '') {
      setFilteredCountries(countries);
    } else {
      const filtered = countries.filter(country =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.vatDirectory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.accountantName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCountries(filtered);
    }
  }, [searchTerm, countries]);

  const loadCountries = async () => {
    try {
      setLoading(true);
      const data = await countryApi.getAll();
      setCountries(data);
    } catch (error) {
      console.error('Error loading countries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedCountry(null);
    setModalMode('create');
    setShowCountryModal(true);
  };

  const handleEdit = (country: Country) => {
    setSelectedCountry(country);
    setModalMode('edit');
    setShowCountryModal(true);
  };

  const handleDelete = (country: Country) => {
    setSelectedCountry(country);
    setShowDeleteModal(true);
  };

  const handleCountrySubmit = async (formData: CountryFormData) => {
    try {
      if (modalMode === 'create') {
        await countryApi.create({
          name: formData.name,
          vatDirectory: formData.vatDirectory || undefined,
          accountantName: formData.accountantName || undefined
        });
      } else if (selectedCountry) {
        await countryApi.update(selectedCountry.id, {
          name: formData.name,
          vatDirectory: formData.vatDirectory || undefined,
          accountantName: formData.accountantName || undefined
        });
      }
      
      setShowCountryModal(false);
      await loadCountries();
    } catch (error) {
      console.error('Error saving country:', error);
      throw error;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCountry) return;
    
    try {
      await countryApi.delete(selectedCountry.id);
      setShowDeleteModal(false);
      await loadCountries();
    } catch (error) {
      console.error('Error deleting country:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
        <span className="ml-2 text-gray-600">Loading countries...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Countries</h1>
          <p className="text-gray-600">Manage countries and their financial settings</p>
        </div>
        <button
          onClick={handleCreate}
          className="btn-primary mt-4 sm:mt-0 inline-flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Country
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search countries, VAT directories, or accountants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10 w-full"
          />
        </div>
      </div>

      {/* Countries Grid */}
      {filteredCountries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCountries.map((country) => (
            <div
              key={country.id}
              className="country-card bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <Globe className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {country.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        ID: {country.id}
                      </p>
                    </div>
                  </div>
                  
                  {/* Actions dropdown */}
                  <div className="relative group">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                    <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <Link
                        to={`/countries/${country.id}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => handleEdit(country)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Edit className="w-4 h-4 inline mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(country)}
                        className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 inline mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="px-6 pb-4 space-y-3">
                {country.vatDirectory && (
                  <div className="flex items-center text-sm">
                    <FolderOpen className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">VAT Directory:</span>
                    <span className="ml-1 text-gray-900 font-medium truncate">
                      {country.vatDirectory}
                    </span>
                  </div>
                )}
                
                {country.accountantName && (
                  <div className="flex items-center text-sm">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Accountant:</span>
                    <span className="ml-1 text-gray-900 font-medium">
                      {country.accountantName}
                    </span>
                  </div>
                )}

                {(!country.vatDirectory && !country.accountantName) && (
                  <div className="text-sm text-gray-500 italic">
                    No additional information provided
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <Link
                  to={`/countries/${country.id}`}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Reports & VAT Rates →
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No countries found' : 'No countries yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm 
              ? 'Try adjusting your search terms or clear the search to see all countries.'
              : 'Get started by adding your first country to the system.'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={handleCreate}
              className="btn-primary inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Country
            </button>
          )}
        </div>
      )}

      {/* Country Modal */}
      {showCountryModal && (
        <CountryModal
          isOpen={showCountryModal}
          onClose={() => setShowCountryModal(false)}
          onSubmit={handleCountrySubmit}
          country={selectedCountry}
          mode={modalMode}
        />
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedCountry && (
        <DeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Country"
          message={`Are you sure you want to delete "${selectedCountry.name}"? This will also delete all associated reports, fields, and VAT rates.`}
        />
      )}
    </div>
  );
};

export default CountriesPage;