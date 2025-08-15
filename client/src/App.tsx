import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import CountriesPage from './pages/CountriesPage';
import CountryDetailsPage from './pages/CountryDetailsPage';
import ReportsPage from './pages/ReportsPage';
import ReportDetailsPage from './pages/ReportDetailsPage';
import FieldsPage from './pages/FieldsPage';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/countries" element={<CountriesPage />} />
            <Route path="/countries/:id" element={<CountryDetailsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/reports/:id" element={<ReportDetailsPage />} />
            <Route path="/fields" element={<FieldsPage />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;
