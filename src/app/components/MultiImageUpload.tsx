'use client';
import { useState } from 'react';
import Image from 'next/image';

interface AnalysisResult {
  damagePercentage: number;
  confidence: number;
}

interface ImageAnalysis {
  imageUrl: string;
  fileName: string;
  result: AnalysisResult | null;
  error?: string;
}

export default function MultiImageUpload() {
  const [images, setImages] = useState<ImageAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [overallAnalysis, setOverallAnalysis] = useState<AnalysisResult | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) {
      alert('Please select at least one image');
      return;
    }

    // Filter for image files only
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length !== files.length) {
      alert('Please select image files only');
      return;
    }

    const newImages: ImageAnalysis[] = imageFiles.map(file => {
      const imageUrl = URL.createObjectURL(file);
      return {
        imageUrl,
        fileName: file.name,
        result: null
      };
    });

    setImages(newImages);
    setOverallAnalysis(null);
  };  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const analyzeImages = async () => {
    if (images.length === 0) {
      setError('Please select at least one image');
      return;
    }
    
    setLoading(true);
    setProgress(0);
    setError(null);

    try {
      const updatedImages = [...images];
      
      // Process images one by one
      for (let i = 0; i < images.length; i++) {
        try {
          // Update progress
          setProgress(Math.round((i / images.length) * 100));
          
          const response = await fetch(images[i].imageUrl);
          const blob = await response.blob();
          const formData = new FormData();
          formData.append('file', blob, images[i].fileName);

          const analysisResponse = await fetch('/api/analyze', {
            method: 'POST',
            body: formData,
          });

          if (!analysisResponse.ok) {
            throw new Error(`Analysis failed for ${images[i].fileName}`);
          }

          const result = await analysisResponse.json();
          
          // Update the image result immediately
          updatedImages[i] = { ...images[i], result };
          setImages([...updatedImages]);

        } catch (error) {
          updatedImages[i] = { 
            ...images[i], 
            error: error instanceof Error ? error.message : 'Analysis failed for this image' 
          };
          setImages([...updatedImages]);
        }
      }

      // Calculate overall analysis from successful results
      const validResults = updatedImages.filter(img => img.result);
      if (validResults.length > 0) {
        const averageDamage = validResults.reduce((sum, img) => sum + (img.result?.damagePercentage || 0), 0) / validResults.length;
        const averageConfidence = validResults.reduce((sum, img) => sum + (img.result?.confidence || 0), 0) / validResults.length;
        
        setOverallAnalysis({
          damagePercentage: Math.round(averageDamage),
          confidence: Math.round(averageConfidence)
        });

        setError(null);
      } else {
        setError('No images were successfully analyzed');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Analysis failed');
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8 bg-gray-800/50 rounded-xl backdrop-blur-sm">
      <div className="border-3 border-dashed border-indigo-400 rounded-xl p-10 text-center bg-gray-800/50">
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*"
          multiple
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
          <span className="text-gray-300">Drop your car damage photos here<br />or click to browse</span>
        </label>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <div key={index} className="bg-gray-800/30 p-4 rounded-lg">
              <div className="relative h-48 w-full mb-4 rounded-lg overflow-hidden">
                <Image
                  src={image.imageUrl}
                  alt={`Car damage ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-gray-300 truncate mb-2">{image.fileName}</p>
              {image.result && (
                <div className="space-y-2">
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-300 bg-indigo-900/50">
                        Damage: {image.result.damagePercentage}%
                      </span>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-700">
                      <div
                        style={{ width: `${image.result.damagePercentage}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}
              {image.error && (
                <p className="text-red-400 text-sm">{image.error}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 text-red-400 p-4 rounded-lg text-center">
          {error}
        </div>
      )}

      {images.length > 0 && (
        <>
          <button
            onClick={analyzeImages}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-500 disabled:bg-gray-600 transition-colors duration-200 text-lg font-semibold"
          >
            {loading ? `Analyzing Images (${progress}%)` : 'Analyze All Images'}
          </button>
          
          {loading && (
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-indigo-500 h-full transition-all duration-300 ease-in-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </>
      )}

      {overallAnalysis && (
        <div className="mt-8 bg-gray-800/30 p-6 rounded-xl border border-indigo-500/30">
          <h3 className="text-xl font-semibold mb-4 text-indigo-300">Overall Damage Analysis</h3>
          <div className="space-y-4">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <span className="text-sm font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-300 bg-indigo-900/50">
                  Average Damage
                </span>
                <span className="text-indigo-300 text-sm font-semibold">
                  {overallAnalysis.damagePercentage}%
                </span>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-700">
                <div
                  style={{ width: `${overallAnalysis.damagePercentage}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                />
              </div>
            </div>
            <div>
              <span className="text-gray-300 text-sm">
                Analysis Confidence: {overallAnalysis.confidence}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
