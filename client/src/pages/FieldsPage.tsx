import React, { useState, useEffect } from 'react';
import { Plus, Search, BarChart3, Edit, Trash2 } from 'lucide-react';
import { fieldApi, reportApi } from '../services/api';
import { Field, FieldFormData, FieldType, Report } from '../types';
import FieldModal from '../components/FieldModal';
import DeleteModal from '../components/DeleteModal';

const FieldsPage: React.FC = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<FieldType | 'ALL'>('ALL');
  
  // Modal states
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fieldsData, reportsData] = await Promise.all([
        fieldApi.getAll(),
        reportApi.getAll()
      ]);
      setFields(fieldsData);
      setReports(reportsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFields = fields.filter(field => {
    const matchesSearch = searchTerm === '' || 
      field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.reportName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.countryName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'ALL' || field.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const groupedFields = filteredFields.reduce((acc, field) => {
    if (!acc[field.type]) acc[field.type] = [];
    acc[field.type].push(field);
    return acc;
  }, {} as Record<FieldType, Field[]>);

  const handleCreate = () => {
    setSelectedField(null);
    setModalMode('create');
    setShowFieldModal(true);
  };

  const handleEdit = (field: Field) => {
    setSelectedField(field);
    setModalMode('edit');
    setShowFieldModal(true);
  };

  const handleDelete = (field: Field) => {
    setSelectedField(field);
    setShowDeleteModal(true);
  };

  const handleFieldSubmit = async (formData: FieldFormData) => {
    try {
      const fieldData = {
        reportId: parseInt(formData.reportId),
        name: formData.name,
        type: formData.type,
        source: formData.source || undefined,
        formula: formData.formula || undefined,
        inputValue: formData.inputValue || undefined
      };

      if (modalMode === 'create') {
        await fieldApi.create(fieldData);
      } else if (selectedField) {
        await fieldApi.update(selectedField.id, fieldData);
      }
      
      setShowFieldModal(false);
      await loadData();
    } catch (error) {
      console.error('Error saving field:', error);
      throw error;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedField) return;
    
    try {
      await fieldApi.delete(selectedField.id);
      setShowDeleteModal(false);
      await loadData();
    } catch (error) {
      console.error('Error deleting field:', error);
      throw error;
    }
  };

  const getFieldTypeIcon = (type: FieldType) => {
    return <BarChart3 className="w-5 h-5" />;
  };

  const getFieldTypeColor = (type: FieldType) => {
    switch (type) {
      case FieldType.FIXED: return 'border-green-500 bg-green-50';
      case FieldType.FORMULA: return 'border-blue-500 bg-blue-50';
      case FieldType.INPUT: return 'border-yellow-500 bg-yellow-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
        <span className="ml-2 text-gray-600">Loading fields...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Report Fields</h1>
          <p className="text-gray-600">Manage fields across all reports with conditional logic</p>
        </div>
        <button
          onClick={handleCreate}
          className="btn-primary mt-4 sm:mt-0 inline-flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Field
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search fields, reports, or countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10 w-full"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as FieldType | 'ALL')}
              className="form-select w-full"
            >
              <option value="ALL">All Types</option>
              <option value={FieldType.FIXED}>Fixed Fields</option>
              <option value={FieldType.FORMULA}>Formula Fields</option>
              <option value={FieldType.INPUT}>Input Fields</option>
            </select>
          </div>
        </div>
      </div>

      {/* Fields by Type */}
      {Object.values(FieldType).map(type => {
        const typeFields = groupedFields[type] || [];
        if (typeFilter !== 'ALL' && typeFilter !== type) return null;
        if (typeFields.length === 0) return null;

        return (
          <div key={type} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg mr-3 ${getFieldTypeColor(type)}`}>
                    {getFieldTypeIcon(type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{type} Fields</h3>
                    <p className="text-sm text-gray-500">{typeFields.length} field(s)</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                {typeFields.map(field => (
                  <div
                    key={field.id}
                    className={`field-type-${type.toLowerCase()} bg-white border rounded-lg p-4`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium text-gray-900">{field.name}</h4>
                          <span className={`badge badge-${type === FieldType.FIXED ? 'green' : type === FieldType.FORMULA ? 'blue' : 'yellow'}`}>
                            {type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {field.reportName} • {field.countryName}
                        </p>
                        
                        {/* Show field value based on type */}
                        <div className="mt-2">
                          {type === FieldType.FIXED && field.source && (
                            <div className="text-sm">
                              <span className="text-gray-500">Source:</span>
                              <span className="ml-1 font-mono text-gray-700">{field.source}</span>
                            </div>
                          )}
                          {type === FieldType.FORMULA && field.formula && (
                            <div className="text-sm">
                              <span className="text-gray-500">Formula:</span>
                              <span className="ml-1 font-mono text-gray-700">{field.formula}</span>
                            </div>
                          )}
                          {type === FieldType.INPUT && (
                            <div className="text-sm">
                              <span className="text-gray-500">Default:</span>
                              <span className="ml-1 font-mono text-gray-700">
                                {field.inputValue || 'No default value'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(field)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(field)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {filteredFields.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || typeFilter !== 'ALL' ? 'No fields found' : 'No fields yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || typeFilter !== 'ALL'
              ? 'Try adjusting your search or filter criteria.'
              : 'Create your first field to get started with report building.'
            }
          </p>
          {!searchTerm && typeFilter === 'ALL' && (
            <button
              onClick={handleCreate}
              className="btn-primary inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Field
            </button>
          )}
        </div>
      )}

      {/* Field Modal */}
      {showFieldModal && (
        <FieldModal
          isOpen={showFieldModal}
          onClose={() => setShowFieldModal(false)}
          onSubmit={handleFieldSubmit}
          field={selectedField}
          mode={modalMode}
          reports={reports}
        />
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedField && (
        <DeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Field"
          message={`Are you sure you want to delete the field "${selectedField.name}"? This action cannot be undone.`}
        />
      )}
    </div>
  );
};

export default FieldsPage;