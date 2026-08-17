import React from 'react';

export default function QuestionField({ question, value, onChange }) {
  if (!question.active) return null;

  if (question.type === 'number') {
    return (
      <div className="flex flex-col gap-2 my-4">
        <label className="font-semibold text-gray-800">
          {question.label} {question.unit ? `(${question.unit})` : ''}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type="number"
          min={question.min || undefined}
          max={question.max || undefined}
          value={value || ''}
          onChange={(e) => onChange(question.key, Number(e.target.value))}
          className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none w-full bg-white shadow-sm"
          placeholder={`Enter value${question.min ? ` (min: ${question.min})` : ''}`}
          required={question.required}
        />
      </div>
    );
  }

  if (question.type === 'select') {
    return (
      <div className="flex flex-col gap-2 my-4">
        <label className="font-semibold text-gray-800">
          {question.label}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {question.options.map((opt) => (
            <label
              key={opt.value}
              className={`p-4 border rounded-xl cursor-pointer flex items-center justify-between transition shadow-sm ${
                value === opt.value ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-600' : 'bg-white hover:bg-gray-50 border-gray-200'
              }`}
            >
              <span className={`font-medium ${value === opt.value ? 'text-blue-700' : 'text-gray-700'}`}>
                {opt.label}
              </span>
              <input
                type="radio"
                name={question.key}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => onChange(question.key, opt.value)}
                className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                required={question.required}
              />
            </label>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
