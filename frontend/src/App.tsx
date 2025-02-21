import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import Select from 'react-select';
import type { ApiRequest, ApiResponse, ApiError, Option } from './types';

const options: Option[] = [
  { value: 'alphabets', label: 'Alphabets' },
  { value: 'numbers', label: 'Numbers' },
  { value: 'highest_alphabet', label: 'Highest Alphabet' },
];

function App() {
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Array<{ field: string; message: string }>>([]);
  const [invalidInputs, setInvalidInputs] = useState<string[]>([]);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);

  const validateAndParseJSON = (input: string): ApiRequest | null => {
    try {
      const parsed = JSON.parse(input);
      if (!parsed.data || !Array.isArray(parsed.data)) {
        setError('Input must contain a "data" array');
        return null;
      }
      // Check if all elements are strings
      // @ts-ignore
      if (!parsed.data.every(item => typeof item === 'string')) {
        setError('All elements in the data array must be strings (in quotes)');
        return null;
      }
      return parsed;
    } catch (err) {
      setError('Invalid JSON format');
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors([]);
    setInvalidInputs([]);
    setResponse(null);

    const parsedData = validateAndParseJSON(jsonInput);
    if (!parsedData) return;

    setLoading(true);
    try {
      const { data } = await axios.post<ApiResponse | ApiError>(
        'https://bfhl-k1b6.onrender.com/bfhl',
        parsedData
      );

      if (!data.is_success) {
        const errorData = data as ApiError;
        if (errorData.errors) {
          setValidationErrors(errorData.errors);
        }
        if (errorData.invalid_inputs) {
          setInvalidInputs(errorData.invalid_inputs);
        }
        if (errorData.message) {
          setError(errorData.message);
        }
        return;
      }

      setResponse(data as ApiResponse);
      setSelectedOptions([options[0]]); // Default to showing alphabets
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      if (axiosError.response?.data) {
        const errorData = axiosError.response.data;
        if (errorData.message) {
          setError(errorData.message);
        }
        if (errorData.errors) {
          setValidationErrors(errorData.errors);
        }
        if (errorData.invalid_inputs) {
          setInvalidInputs(errorData.invalid_inputs);
        }
      } else {
        setError('Failed to connect to the server. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderErrors = () => {
    return (
      <div className="space-y-3">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-red-800 mb-2">Validation Errors:</h3>
            <ul className="list-disc pl-5 space-y-1">
              {validationErrors.map((err, idx) => (
                <li key={idx} className="text-sm text-red-700">
                  {err.field}: {err.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {invalidInputs.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">Invalid Inputs Detected:</h3>
            <div className="flex flex-wrap gap-2">
              {invalidInputs.map((input, idx) => (
                <span key={idx} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                  {input}
                </span>
              ))}
            </div>
            <p className="mt-2 text-sm text-yellow-700">Only single letters or numbers (in quotes) are allowed.</p>
          </div>
        )}
      </div>
    );
  };

  const renderResponse = () => {
    if (!response) return null;

    const selectedFields = selectedOptions.map(option => option.value);

    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-green-700">Request processed successfully</p>
        </div>

        <div className="space-y-2">
          <p><strong>User ID:</strong> {response.user_id}</p>
          <p><strong>Email:</strong> {response.email}</p>
          <p><strong>Roll Number:</strong> {response.roll_number}</p>

          {selectedFields.includes('alphabets') && (
            <div>
              <strong>Alphabets:</strong>
              <div className="flex flex-wrap gap-2 mt-1">
                {response.alphabets.map((alpha, idx) => (
                  <span key={idx} className="px-2 py-1 bg-blue-100 rounded">
                    {alpha}
                  </span>
                ))}
              </div>
            </div>
          )}

          {selectedFields.includes('numbers') && (
            <div>
              <strong>Numbers:</strong>
              <div className="flex flex-wrap gap-2 mt-1">
                {response.numbers.map((num, idx) => (
                  <span key={idx} className="px-2 py-1 bg-green-100 rounded">
                    {num}
                  </span>
                ))}
              </div>
            </div>
          )}

          {selectedFields.includes('highest_alphabet') && (
            <div>
              <strong>Highest Alphabet:</strong>
              <div className="flex flex-wrap gap-2 mt-1">
                {response.highest_alphabet.map((alpha, idx) => (
                  <span key={idx} className="px-2 py-1 bg-purple-100 rounded">
                    {alpha}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">
            Submission for <strong>BFHL</strong>
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="json-input"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                JSON Input
              </label>
              <textarea
                id="json-input"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{"data": ["A", "1", "B", "2"]}'
              />
              <p className="mt-1 text-sm text-gray-500">
                Note: All values in the data array must be strings (in quotes)
              </p>
            </div>

            {renderErrors()}

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                }`}
            >
              {loading ? 'Processing...' : 'Process Data'}
            </button>
          </form>

          {response && (
            <div className="mt-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Data to Display
                </label>
                <Select
                  isMulti
                  options={options}
                  value={selectedOptions}
                  onChange={(selected) => setSelectedOptions(selected as Option[])}
                  className="basic-multi-select"
                  classNamePrefix="select"
                />
              </div>

              <div className="border-t pt-6">
                {renderResponse()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
