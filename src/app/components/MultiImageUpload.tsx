"use client";

import { useState } from "react";
import Image from "next/image";

interface AnalysisResult {
  damagePercentage: number;
  confidence: number;
}

interface ImageAnalysis {
  imageUrl: string;
  fileName: string;
  originalFile: File;
  processedBlob?: Blob;
  result: AnalysisResult | null;
  error?: string;
}

enum ProcessingStage {
  IDLE = 0,
  PREPROCESSING = 1,
  ANALYZING = 2,
}

export default function MultiImageUpload() {
  const [images, setImages] = useState<ImageAnalysis[]>([]);
  const [stage, setStage] = useState<ProcessingStage>(ProcessingStage.IDLE as ProcessingStage);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [overallAnalysis, setOverallAnalysis] = useState<AnalysisResult | null>(
    null
  );
  const [enhanced, setEnhanced] = useState<boolean>(false);
  const [analyzed, setAnalyzed] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) {
      setError("⚠️ Please select at least one image");
      return;
    }

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length !== files.length) {
      setError("Only image files are allowed");
      return;
    }

    const newImages: ImageAnalysis[] = imageFiles.map((file) => ({
      imageUrl: URL.createObjectURL(file),
      fileName: file.name,
      originalFile: file,
      result: null,
    }));

    setImages(newImages);
    setOverallAnalysis(null);
    setError(null);
    setEnhanced(false);
    setAnalyzed(false);
  };

  const preprocessImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const blob = new Blob([reader.result as ArrayBuffer], {
            type: file.type,
          });
          resolve(blob);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject("File read error");
      reader.readAsArrayBuffer(file);
    });
  };

  const preprocessImages = async () => {
    setStage(ProcessingStage.PREPROCESSING);
    setProgress(0);
    setError(null);

    if (images.length === 0) {
      setError("No images to process");
      setStage(ProcessingStage.IDLE);
      return;
    }

    try {
      const processedImages = [...images];

      await new Promise((resolve) => setTimeout(resolve, 500));

      for (let i = 0; i < images.length; i++) {
        setProgress(Math.round(((i + 1) / images.length) * 100));
        try {
          const processedBlob = await preprocessImage(images[i].originalFile);
          processedImages[i] = {
            ...images[i],
            processedBlob,
            error: undefined,
          };
          setImages([...processedImages]);
        } catch (err) {
          processedImages[i] = {
            ...images[i],
            error: "Failed to preprocess",
          };
        }
      }

      setImages(processedImages);
      setEnhanced(true);
    } catch (err) {
      setError("Image preprocessing failed");
    } finally {
      setStage(ProcessingStage.IDLE);
    }
  };

  const analyzeImages = async () => {
    if (images.length === 0) {
      setError("Please select at least one image");
      return;
    }

    setStage(ProcessingStage.ANALYZING);
    setProgress(0);
    setError(null);
    setAnalyzed(false);

    try {
      const updatedImages = [...images];

      for (let i = 0; i < images.length; i++) {
        setProgress(Math.round(((i + 1) / images.length) * 100));

        const currentImage = images[i];

        const formData = new FormData();
        formData.append(
          "file",
          currentImage.processedBlob || currentImage.originalFile,
          currentImage.fileName
        );

        const res = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Analysis failed");

        const result = await res.json();
        updatedImages[i] = { ...images[i], result };
        setImages([...updatedImages]);
      }

      const validResults = updatedImages.filter((img) => img.result);
      if (validResults.length > 0) {
        const avgDamage =
          validResults.reduce(
            (sum, img) => sum + (img.result?.damagePercentage || 0),
            0
          ) / validResults.length;
        const avgConfidence =
          validResults.reduce(
            (sum, img) => sum + (img.result?.confidence || 0),
            0
          ) / validResults.length;

        setOverallAnalysis({
          damagePercentage: Math.round(avgDamage),
          confidence: Math.round(avgConfidence),
        });
      }

      setAnalyzed(true);
    } catch (err) {
      setError("Analysis failed");
    } finally {
      setStage(ProcessingStage.IDLE);
      setProgress(100);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8 bg-gray-800/50 rounded-xl backdrop-blur-sm">
      {/* Upload area */}
      <div className="border-3 border-dashed border-indigo-400 rounded-xl p-10 text-center bg-gray-800/50">
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*"
          multiple
          className="hidden"
          id="fileInput"
          disabled={stage !== ProcessingStage.IDLE}
        />
        <label
          htmlFor="fileInput"
          className={`cursor-pointer text-indigo-400 hover:text-indigo-300 text-lg font-medium flex flex-col items-center gap-4 ${
            stage !== ProcessingStage.IDLE ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <span className="text-gray-300">
            Upload car damage photos (multiple angles)
          </span>
        </label>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 text-red-400 p-4 rounded-lg text-center">
          {error}
        </div>
      )}

      {/* Image cards */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, idx) => (
            <div key={idx} className="bg-gray-800/30 p-4 rounded-lg">
              <div className="relative h-48 w-full mb-4 rounded-lg overflow-hidden">
                <Image
                  src={image.imageUrl}
                  alt={image.fileName}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-gray-300 truncate mb-2">{image.fileName}</p>
              {image.result && (
                <div className="space-y-2">
                  <div>
                    <p className="text-gray-300 text-sm">Damage</p>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-red-500 h-full rounded-full"
                        style={{ width: `${image.result.damagePercentage}%` }}
                      />
                    </div>
                    <p className="text-gray-400 text-xs mt-1">
                      {image.result.damagePercentage}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">Confidence</p>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-full rounded-full"
                        style={{ width: `${image.result.confidence}%` }}
                      />
                    </div>
                    <p className="text-gray-400 text-xs mt-1">
                      {image.result.confidence}%
                    </p>
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

      {/* Action buttons */}
      {images.length > 0 && stage === ProcessingStage.IDLE && (
        <div className="space-y-4">
          <div>
            <p className="text-gray-400 text-sm mb-2">
              If your images are not clear, click below to enhance them:
            </p>
            <button
              onClick={preprocessImages}
              disabled={stage === ProcessingStage.PREPROCESSING || enhanced}
              className={`w-full py-3 px-6 rounded-lg text-lg font-semibold transition-colors duration-200
                ${
                  enhanced
                    ? "bg-green-600 text-white cursor-default"
                    : stage === ProcessingStage.PREPROCESSING
                    ? "bg-yellow-500 text-white animate-pulse"
                    : "bg-yellow-600 text-white hover:bg-yellow-500"
                }`}
            >
              {stage === ProcessingStage.PREPROCESSING
                ? "Enhancing..."
                : enhanced
                ? "Enhanced ✅"
                : "Enhance Images"}
            </button>
          </div>
          <button
            onClick={analyzeImages}
            disabled={stage === ProcessingStage.ANALYZING || analyzed}
            className={`w-full py-3 px-6 rounded-lg text-lg font-semibold transition-colors duration-200
              ${
                analyzed
                  ? "bg-green-600 text-white cursor-default"
                  : stage === ProcessingStage.ANALYZING
                  ? "bg-indigo-500 text-white animate-pulse"
                  : "bg-indigo-600 text-white hover:bg-indigo-500"
              }`}
          >
            {stage === ProcessingStage.ANALYZING
              ? "Analyzing..."
              : analyzed
              ? "Analyzed ✅"
              : "Analyze Damage"}
          </button>
        </div>
      )}

      {/* Overall results */}
      {overallAnalysis && (
        <div className="mt-8 bg-gray-800/30 p-6 rounded-xl border border-indigo-500/30">
          <h3 className="text-xl font-semibold mb-4 text-indigo-300">
            Overall Damage Analysis
          </h3>
          <div className="space-y-2">
            <div>
              <p className="text-gray-300 text-sm">Damage</p>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-red-500 h-full rounded-full"
                  style={{ width: `${overallAnalysis.damagePercentage}%` }}
                />
              </div>
              <p className="text-gray-400 text-xs mt-1">
                {overallAnalysis.damagePercentage}%
              </p>
            </div>
            <div>
              <p className="text-gray-300 text-sm">Confidence</p>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-full rounded-full"
                  style={{ width: `${overallAnalysis.confidence}%` }}
                />
              </div>
              <p className="text-gray-400 text-xs mt-1">
                {overallAnalysis.confidence}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
