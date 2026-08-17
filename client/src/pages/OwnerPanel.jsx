import React, { useState, useEffect } from 'react';
import { loginAdmin, fetchAdminLeads, fetchAdminConfig, updateAdminConfig } from '../services/api';
import { Loader2, Settings, Users, LogOut, Check, Save } from 'lucide-react';

export default function OwnerPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [activeTab, setActiveTab] = useState('leads'); // 'leads' or 'config'
  const [leads, setLeads] = useState([]);
  const [config, setConfig] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Auto login check
  useEffect(() => {
    if (localStorage.getItem('adminToken')) {
      setIsAuthenticated(true);
      loadDashboardData();
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    try {
      await loginAdmin(username, password);
      setIsAuthenticated(true);
      loadDashboardData();
    } catch (err) {
      setLoginError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setLeads([]);
    setConfig(null);
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [leadsData, configData] = await Promise.all([
        fetchAdminLeads(),
        fetchAdminConfig()
      ]);
      setLeads(leadsData);
      setConfig(configData);
    } catch (err) {
      if (err.message === 'Failed to fetch leads' || err.message === 'Failed to fetch config') {
         // Token might be invalid
         handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (field, value) => {
    setConfig({ ...config, [field]: value });
  };

  const handleQuestionToggle = (idx) => {
    const updated = [...config.questions];
    updated[idx].active = !updated[idx].active;
    setConfig({ ...config, questions: updated });
  };

  const handleOptionRateChange = (qIdx, oIdx, field, value) => {
    const updated = [...config.questions];
    updated[qIdx].options[oIdx][field] = Number(value);
    setConfig({ ...config, questions: updated });
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    setSaveMessage('');
    try {
      await updateAdminConfig(config);
      setSaveMessage('Configuration saved successfully! The live estimator is updated.');
      setTimeout(() => setSaveMessage(''), 5000);
    } catch (err) {
      setSaveMessage('Failed to save configuration.');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Owner Panel Login</h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleLogin}>
              {loginError && <div className="text-red-600 text-sm">{loginError}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <div className="mt-1">
                  <input type="text" required value={username} onChange={e=>setUsername(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="mt-1">
                  <input type="password" required value={password} onChange={e=>setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
              </div>
              <div>
                <button type="submit" disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign in'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !config) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center font-bold text-xl text-gray-900">
                Owner Panel
              </div>
              <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => setActiveTab('leads')}
                  className={`${activeTab === 'leads' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <Users className="mr-2 h-4 w-4" /> Leads
                </button>
                <button
                  onClick={() => setActiveTab('config')}
                  className={`${activeTab === 'config' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <Settings className="mr-2 h-4 w-4" /> Pricing & Config
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <button onClick={handleLogout} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto py-6 sm:px-6 lg:px-8">
        
        {/* LEADS TAB */}
        {activeTab === 'leads' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Leads</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Customers who completed the estimator.</p>
              </div>
              <button onClick={loadDashboardData} className="text-blue-600 hover:text-blue-900 text-sm font-medium">Refresh</button>
            </div>
            <div className="border-t border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estimate Range</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Answers</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.map(lead => (
                    <tr key={lead.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(lead.captured_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                        <div className="text-sm text-gray-500">{lead.phone}</div>
                        <div className="text-sm text-gray-500">{lead.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">${lead.estimate_low.toLocaleString()} - ${lead.estimate_high.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">v{lead.config_version}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <ul className="list-disc pl-4">
                          {Object.entries(lead.answers).map(([k, v]) => (
                            <li key={k}><span className="font-medium text-gray-700">{k}:</span> {v}</li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CONFIG TAB */}
        {activeTab === 'config' && config && (
          <div className="space-y-6">
            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
              <div className="flex justify-between items-center mb-5 border-b pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Base Rates & Fees</h3>
                <button
                  onClick={handleSaveConfig}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save All Changes
                </button>
              </div>
              
              {saveMessage && (
                <div className={`mb-4 p-4 rounded-md ${saveMessage.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  {saveMessage}
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Permit Flat Fee ($)</label>
                  <input type="number" value={config.permit_flat_fee} onChange={(e) => handleConfigChange('permit_flat_fee', Number(e.target.value))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Waste Factor (e.g. 0.10 for 10%)</label>
                  <input type="number" step="0.01" value={config.waste_factor} onChange={(e) => handleConfigChange('waste_factor', Number(e.target.value))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Range Spread % (e.g. 12)</label>
                  <input type="number" value={config.range_spread_pct} onChange={(e) => handleConfigChange('range_spread_pct', Number(e.target.value))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Questions & Pricing Options</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Enable/disable questions or update pricing rates directly.</p>
              </div>
              <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {config.questions.map((q, qIdx) => (
                    <li key={q.id} className={`px-4 py-4 sm:px-6 ${!q.active ? 'bg-gray-50 opacity-75' : ''}`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <button
                            type="button"
                            onClick={() => handleQuestionToggle(qIdx)}
                            className={`${q.active ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none`}
                          >
                            <span className={`${q.active ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`} />
                          </button>
                          <span className="ml-3 font-medium text-gray-900">{q.label} <span className="text-gray-500 text-sm font-normal">({q.key})</span></span>
                        </div>
                      </div>

                      {q.type === 'select' && q.options && q.options.length > 0 && (
                        <div className="mt-2 ml-14 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {q.options.map((opt, oIdx) => (
                            <div key={opt.value} className="bg-gray-50 p-3 rounded border border-gray-200">
                              <div className="text-sm font-medium text-gray-700 mb-2">{opt.label}</div>
                              
                              {opt.rate_per_sqft !== null && (
                                <div className="flex items-center justify-between">
                                  <label className="text-xs text-gray-500">Rate / SqFt ($)</label>
                                  <input type="number" step="0.01" className="w-20 text-sm border-gray-300 rounded p-1" 
                                    value={opt.rate_per_sqft} onChange={e => handleOptionRateChange(qIdx, oIdx, 'rate_per_sqft', e.target.value)} />
                                </div>
                              )}
                              
                              {opt.multiplier !== null && (
                                <div className="flex items-center justify-between">
                                  <label className="text-xs text-gray-500">Multiplier (e.g. 1.12)</label>
                                  <input type="number" step="0.01" className="w-20 text-sm border-gray-300 rounded p-1" 
                                    value={opt.multiplier} onChange={e => handleOptionRateChange(qIdx, oIdx, 'multiplier', e.target.value)} />
                                </div>
                              )}
                              
                              {opt.tear_off_per_sqft !== null && (
                                <div className="flex items-center justify-between">
                                  <label className="text-xs text-gray-500">Tear Off / SqFt ($)</label>
                                  <input type="number" step="0.01" className="w-20 text-sm border-gray-300 rounded p-1" 
                                    value={opt.tear_off_per_sqft} onChange={e => handleOptionRateChange(qIdx, oIdx, 'tear_off_per_sqft', e.target.value)} />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
