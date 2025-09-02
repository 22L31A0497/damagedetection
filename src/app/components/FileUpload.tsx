'use client';
import { useState } from 'react';
import Image from 'next/image';

interface AnalysisResult {
  damagePercentage: number;
  confidence: number;
}

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);
    setResult(null);

    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/') && !selectedFile.type.startsWith('video/')) {
        setError('Please upload an image or video file');
        return;
      }

      setFile(selectedFile);
      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      }
    }
  };

  const analyzeFile = async () => {
    if (!file) return;

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);

      // Replace with your actual API endpoint
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      console.log('Received analysis result:', data);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8 bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen">
      <div className="border-3 border-dashed border-indigo-400 rounded-xl p-10 text-center bg-gray-800/50 backdrop-blur-sm shadow-2xl">
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*,video/*"
          className="hidden"
          id="fileInput"
        />
        <label
          htmlFor="fileInput"
          className="cursor-pointer text-indigo-400 hover:text-indigo-300 text-lg font-medium transition-colors duration-200 flex flex-col items-center gap-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span className="text-gray-300">Drop your image or video here<br />or click to browse</span>
        </label>
        {preview && (
          <div className="mt-6 relative h-80 w-full rounded-lg overflow-hidden shadow-xl">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-contain"
            />
          </div>
        )}
      </div>

      {file && (
        <button
          onClick={analyzeFile}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-500 disabled:bg-gray-600 transition-colors duration-200 text-lg font-semibold shadow-lg"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </div>
          ) : 'Analyze Image'}
        </button>
      )}

      {error && (
        <div className="text-red-400 text-center p-4 bg-red-900/20 rounded-lg border border-red-500/50">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-gray-800/50 p-6 rounded-xl border border-indigo-500/30 backdrop-blur-sm shadow-xl">
          <h3 className="text-xl font-semibold mb-4 text-indigo-300">Analysis Results</h3>
          <div className="space-y-4">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-300 bg-indigo-900/50">
                    Damage Percentage
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-indigo-300">
                    {result.damagePercentage}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-700">
                <div
                  style={{ width: `${result.damagePercentage}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                />
              </div>
            </div>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-300 bg-indigo-900/50">
                    Confidence Level
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-indigo-300">
                    {result.confidence}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-700">
                <div
                  style={{ width: `${result.confidence}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
