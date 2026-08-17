import React, { useState, useEffect } from 'react';
import { fetchConfig, submitEstimate } from '../services/api';
import QuestionField from '../components/dynamic/QuestionField';
import { Loader2, Calculator } from 'lucide-react';

export default function PublicEstimator() {
  const [config, setConfig] = useState(null);
  const [answers, setAnswers] = useState({});
  const [contact, setContact] = useState({ name: '', phone: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [estimate, setEstimate] = useState(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1 = questions, 2 = contact, 3 = result

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await fetchConfig();
      setConfig(data);
    } catch (err) {
      setError('Failed to load estimator configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleNextToContact = (e) => {
    e.preventDefault();
    // Verify all required questions
    for (const q of config.questions) {
      if (q.required && (answers[q.key] === undefined || answers[q.key] === '')) {
        setError(`Please answer: ${q.label}`);
        return;
      }
      if (q.type === 'number' && q.min && answers[q.key] < q.min) {
        setError(`Value for ${q.label} must be at least ${q.min}`);
        return;
      }
      if (q.type === 'number' && q.max && answers[q.key] > q.max) {
        setError(`Value for ${q.label} must be at most ${q.max}`);
        return;
      }
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      const result = await submitEstimate({
        ...contact,
        answers
      });
      setEstimate(result);
      setStep(3);
    } catch (err) {
      setError('Error generating estimate. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
            {config.business_name}
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Get an instant roof replacement estimate tailored to your home.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8">
          
          {error && step !== 1 && (
             <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
               {error}
             </div>
          )}
          {error && step === 1 && (
             <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
               {error}
             </div>
          )}

          {step === 1 && (
            <form onSubmit={handleNextToContact}>
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Tell us about your project</h2>
                  <span className="text-sm font-medium text-blue-600 bg-blue-50 py-1 px-3 rounded-full">Step 1 of 2</span>
                </div>
                
                {config.questions.map(q => (
                  <QuestionField 
                    key={q.key} 
                    question={q} 
                    value={answers[q.key]} 
                    onChange={handleAnswerChange} 
                  />
                ))}
              </div>
              
              <button
                type="submit"
                className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Continue to Final Step
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Where should we send your estimate?</h2>
                  <span className="text-sm font-medium text-blue-600 bg-blue-50 py-1 px-3 rounded-full">Step 2 of 2</span>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={contact.name}
                      onChange={e => setContact({...contact, name: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={contact.phone}
                      onChange={e => setContact({...contact, phone: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={contact.email}
                      onChange={e => setContact({...contact, email: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-4 px-4 border border-gray-300 rounded-xl shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-2/3 flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-colors"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin h-6 w-6" />
                  ) : (
                    <>
                      <Calculator className="mr-2 h-5 w-5" />
                      Get Estimate
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 3 && estimate && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Your Estimate</h2>
              <p className="text-gray-500 mb-8">Based on the details you provided, here is your estimated cost range.</p>
              
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 inline-block mb-8 min-w-[280px]">
                <div className="text-4xl font-black text-blue-800 tracking-tight">
                  ${estimate.estimate_low.toLocaleString()} <span className="text-blue-400 font-normal mx-2">-</span> ${estimate.estimate_high.toLocaleString()}
                </div>
                <div className="text-sm font-medium text-blue-600 mt-2">
                  Estimated Total Cost ({config.business_currency})
                </div>
              </div>

              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                We've sent a copy of this estimate to your email. Our team will be in touch shortly to discuss the next steps!
              </p>

              <button
                onClick={() => {
                  setAnswers({});
                  setContact({name:'', phone:'', email:''});
                  setStep(1);
                  setEstimate(null);
                }}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Start a new estimate
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
