import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe,
  FileText,
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  ArrowRight,
  Plus
} from 'lucide-react';
import { countryApi, reportApi, fieldApi, vatRateApi } from '../services/api';
import { Country, Report, Field, VATRate } from '../types';

interface DashboardStats {
  countries: number;
  reports: number;
  fields: number;
  vatRates: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    countries: 0,
    reports: 0,
    fields: 0,
    vatRates: 0
  });
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [countries, reports, fields, vatRates] = await Promise.all([
        countryApi.getAll(),
        reportApi.getAll(),
        fieldApi.getAll(),
        vatRateApi.getAll()
      ]);

      setStats({
        countries: countries.length,
        reports: reports.length,
        fields: fields.length,
        vatRates: vatRates.length
      });

      // Show most recent 5 reports
      setRecentReports(reports.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Countries',
      value: stats.countries,
      icon: Globe,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      link: '/countries',
      description: 'Active countries in system'
    },
    {
      title: 'Reports',
      value: stats.reports,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      link: '/reports',
      description: 'Total financial reports'
    },
    {
      title: 'Fields',
      value: stats.fields,
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      link: '/fields',
      description: 'Report fields configured'
    },
    {
      title: 'VAT Rates',
      value: stats.vatRates,
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      link: '/countries',
      description: 'VAT rates configured'
    }
  ];

  const quickActions = [
    {
      title: 'Add New Country',
      description: 'Set up a new country with VAT rates',
      icon: Globe,
      link: '/countries',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Create Report',
      description: 'Start a new financial report',
      icon: FileText,
      link: '/reports',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Manage Fields',
      description: 'Configure report fields',
      icon: BarChart3,
      link: '/fields',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome to Financial Reporting</h2>
            <p className="text-gray-600 mt-1">
              Manage your international financial reports, VAT rates, and compliance data
            </p>
          </div>
          <TrendingUp className="w-12 h-12 text-blue-600" />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              to={card.link}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">{card.description}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reports */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
              <Link
                to="/reports"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
              >
                View all
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
          <div className="card-body">
            {recentReports.length > 0 ? (
              <div className="space-y-3">
                {recentReports.map((report) => (
                  <Link
                    key={report.id}
                    to={`/reports/${report.id}`}
                    className="block p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{report.name}</p>
                        <p className="text-sm text-gray-500">{report.countryName}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No reports created yet</p>
                <Link
                  to="/reports"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
                >
                  Create your first report
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.title}
                    to={action.link}
                    className="block p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200"
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${action.bgColor}`}>
                        <Icon className={`w-5 h-5 ${action.color}`} />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="font-medium text-gray-900">{action.title}</p>
                        <p className="text-sm text-gray-500">{action.description}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Version</p>
            <p className="font-medium text-gray-900">1.0.0</p>
          </div>
          <div>
            <p className="text-gray-500">Database</p>
            <p className="font-medium text-gray-900">SQLite</p>
          </div>
          <div>
            <p className="text-gray-500">Status</p>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span className="font-medium text-gray-900">Operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;