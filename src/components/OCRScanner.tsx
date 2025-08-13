import React, { useState, useRef, useCallback } from 'react';
import { 
  Camera, 
  Upload, 
  FileText, 
  Loader, 
  CheckCircle, 
  AlertCircle,
  Download,
  Eye,
  RotateCcw,
  Crop,
  Zap
} from 'lucide-react';
import Tesseract from 'tesseract.js';

interface OCRScannerProps {
  onTextExtracted?: (text: string, confidence: number) => void;
  mode?: 'agent' | 'admin';
}

interface OCRResult {
  text: string;
  confidence: number;
  timestamp: Date;
  imageUrl: string;
  status: 'processing' | 'completed' | 'error';
}

const OCRScanner: React.FC<OCRScannerProps> = ({ onTextExtracted, mode = 'agent' }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<OCRResult[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const processImage = useCallback(async (imageFile: File | string) => {
    setIsProcessing(true);
    setProgress(0);

    const newResult: OCRResult = {
      text: '',
      confidence: 0,
      timestamp: new Date(),
      imageUrl: typeof imageFile === 'string' ? imageFile : URL.createObjectURL(imageFile),
      status: 'processing'
    };

    setResults(prev => [newResult, ...prev]);

    try {
      const worker = await Tesseract.createWorker('eng+hin', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        }
      });

      const { data: { text, confidence } } = await worker.recognize(imageFile);
      await worker.terminate();

      const updatedResult: OCRResult = {
        ...newResult,
        text: text.trim(),
        confidence: Math.round(confidence),
        status: 'completed'
      };

      setResults(prev => prev.map((result, index) => 
        index === 0 ? updatedResult : result
      ));

      if (onTextExtracted) {
        onTextExtracted(text.trim(), Math.round(confidence));
      }

    } catch (error) {
      console.error('OCR Error:', error);
      setResults(prev => prev.map((result, index) => 
        index === 0 ? { ...result, status: 'error' } : result
      ));
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, [onTextExtracted]);

  const handleFileUpload = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        processImage(file);
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Camera access error:', error);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
            processImage(file);
          }
        });
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const downloadText = (result: OCRResult) => {
    const blob = new Blob([result.text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ocr-result-${result.timestamp.getTime()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <FileText className="h-6 w-6 mr-2 text-blue-600" />
            OCR Document Scanner
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {mode === 'agent' 
              ? 'Scan documents and forms to extract text automatically'
              : 'View and manage OCR extracted text from field agents'
            }
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Supports English & Hindi
            </span>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            dragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className="flex justify-center">
              <Upload className="h-12 w-12 text-gray-400" />
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Upload Document or Image
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Drag and drop files here, or click to browse
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="h-4 w-4" />
                <span>Choose File</span>
              </button>
              <button
                onClick={cameraActive ? stopCamera : startCamera}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Camera className="h-4 w-4" />
                <span>{cameraActive ? 'Stop Camera' : 'Use Camera'}</span>
              </button>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Camera View */}
      {cameraActive && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <div className="text-center space-y-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full max-w-md mx-auto rounded-lg"
            />
            <button
              onClick={capturePhoto}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              <Camera className="h-5 w-5" />
              <span>Capture Photo</span>
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {/* Processing Status */}
      {isProcessing && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-4">
            <div className="animate-spin">
              <Loader className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Processing document... {progress}%
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            OCR Results ({results.length})
          </h4>
          
          {results.map((result, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {result.status === 'processing' && (
                      <Loader className="h-5 w-5 text-blue-600 animate-spin" />
                    )}
                    {result.status === 'completed' && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    {result.status === 'error' && (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {result.status === 'processing' && 'Processing...'}
                        {result.status === 'completed' && `Extracted Text (${result.confidence}% confidence)`}
                        {result.status === 'error' && 'Processing Failed'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {result.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {result.status === 'completed' && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedImage(result.imageUrl)}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => downloadText(result)}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {result.status === 'completed' && result.text && (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Extracted Text
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {result.text.length} characters
                      </span>
                    </div>
                    <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap font-mono max-h-40 overflow-y-auto">
                      {result.text}
                    </pre>
                  </div>
                )}

                {result.status === 'error' && (
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Failed to process the image. Please try again with a clearer image.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl max-h-full overflow-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Original Image
              </h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <AlertCircle className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <div className="p-4">
              <img
                src={selectedImage}
                alt="Original document"
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OCRScanner;