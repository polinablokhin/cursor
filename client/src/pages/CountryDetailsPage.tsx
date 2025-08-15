import React from 'react';
import { useParams } from 'react-router-dom';

const CountryDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Country Details</h1>
        <p className="text-gray-600">Detailed view for country ID: {id}</p>
        <p className="text-sm text-gray-500 mt-4">
          This page would show VAT rates, reports, and detailed country information.
        </p>
      </div>
    </div>
  );
};

export default CountryDetailsPage;