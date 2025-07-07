import { useState } from "react";
import fileService from "../services/fileService.js";
import socketService from "../services/socketService.js";

export default function FileUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [enableEncryption, setEnableEncryption] = useState(
    import.meta.env.VITE_ENABLE_ENCRYPTION === "true"
  );

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files[0];
    setSelectedFile(file);
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus("Uploading...");

    try {
      // Connect to socket service for real-time updates
      socketService.connect();

      // Upload file with or without encryption
      const result = await fileService.uploadFile(
        selectedFile,
        enableEncryption
      );

      setUploadProgress(100);
      setUploadStatus("Upload successful!");

      // Emit a custom event to notify other components
      window.dispatchEvent(
        new CustomEvent("fileUploaded", {
          detail: { file: selectedFile, result },
        })
      );

      // Also manually trigger socket connection to ensure real-time updates
      if (!socketService.getConnectionStatus().isConnected) {
        socketService.connect();
      }

      // Reset form after successful upload
      setTimeout(() => {
        setSelectedFile(null);
        setUploadProgress(0);
        setUploadStatus("");
        setIsUploading(false);
      }, 2000);

      console.log("File uploaded successfully:", result);
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadStatus(`Upload failed: ${error.message}`);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
  };

  return (
    <>
      <div className="flex flex-col h-full w-full items-center justify-center p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Upload File</h2>

        <form onSubmit={handleUpload} className="w-full max-w-md">
          {/* Encryption Toggle */}
          <div className="mb-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">
              Enable Encryption
            </span>
            <button
              type="button"
              onClick={() => setEnableEncryption(!enableEncryption)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                enableEncryption ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enableEncryption ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div
            className={`p-8 border-2 border-dashed rounded-xl transition-all duration-300 ease-in-out ${
              isDragOver
                ? "border-blue-500 bg-blue-50 scale-105"
                : selectedFile
                ? "border-green-500 bg-green-50"
                : "border-gray-300 bg-gray-50 hover:border-gray-400"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-center">
              {!selectedFile ? (
                <>
                  <div className="mb-4">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p className="mb-2 text-gray-600 text-sm">
                    Drag and drop a file here, or click to select
                  </p>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-input"
                  />
                  <label
                    htmlFor="file-input"
                    className="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600 transition-colors font-medium"
                  >
                    Choose File
                  </label>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-center">
                    <svg
                      className="h-8 w-8 text-green-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-green-600 font-medium">
                      File Selected
                    </span>
                  </div>
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="ml-2 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {isUploading && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>{uploadStatus}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {uploadStatus && !isUploading && (
            <div
              className={`mt-4 p-3 rounded-lg text-sm ${
                uploadStatus.includes("successful")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {uploadStatus}
            </div>
          )}

          <button
            type="submit"
            className={`mt-6 w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              selectedFile && !isUploading
                ? "bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg transform hover:-translate-y-0.5"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? "Uploading..." : "Upload File"}
          </button>
        </form>
      </div>
    </>
  );
}
