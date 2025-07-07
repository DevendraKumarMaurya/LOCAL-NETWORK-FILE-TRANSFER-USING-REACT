import { useState, useEffect, useCallback } from "react";
import fileService from "../services/fileService.js";
import socketService from "../services/socketService.js";

export default function FileList() {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch files from backend
  const fetchFiles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const fileList = await fileService.getFiles();
      setFiles(fileList);
    } catch (err) {
      console.error("Error fetching files:", err);
      setError(
        "Failed to load files. Please make sure the backend server is running."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Manual refresh function
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFiles();
    setRefreshing(false);
  }, [fetchFiles]);

  // Fetch files from backend
  useEffect(() => {
    fetchFiles();

    // Connect to socket service for real-time updates
    try {
      socketService.connect();

      // Listen for new file uploads
      socketService.onFileUploaded((newFile) => {
        console.log("New file uploaded:", newFile);
        setFiles((prevFiles) => {
          // Check if file already exists to avoid duplicates
          const exists = prevFiles.some(
            (file) => file.name === newFile.name || file.id === newFile.id
          );
          if (!exists) {
            return [...prevFiles, newFile];
          }
          return prevFiles;
        });
      });

      // Listen for multiple file uploads
      socketService.onFilesUploaded((newFiles) => {
        console.log("Multiple files uploaded:", newFiles);
        setFiles((prevFiles) => {
          const existingNames = prevFiles.map((file) => file.name);
          const uniqueNewFiles = newFiles.filter(
            (file) => !existingNames.includes(file.name)
          );
          return [...prevFiles, ...uniqueNewFiles];
        });
      });

      // Listen for file deletions
      socketService.onFileDeleted((deletedFile) => {
        console.log("File deleted:", deletedFile);
        setFiles((prevFiles) =>
          prevFiles.filter(
            (file) =>
              file.name !== deletedFile.filename &&
              file.name !== deletedFile.name
          )
        );
      });
    } catch (err) {
      console.error("Socket connection error:", err);
      setError("Real-time updates may not work. Please check your connection.");
    }

    // Listen for custom upload events as backup
    const handleFileUploaded = () => {
      setTimeout(() => {
        fetchFiles();
      }, 1000);
    };

    window.addEventListener("fileUploaded", handleFileUploaded);

    // Cleanup on unmount
    return () => {
      try {
        socketService.removeAllListeners();
        window.removeEventListener("fileUploaded", handleFileUploaded);
      } catch (err) {
        console.error("Socket cleanup error:", err);
      }
    };
  }, [fetchFiles]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const getFileIcon = (type) => {
    if (type.startsWith("image/")) {
      return (
        <svg
          className="h-8 w-8 text-blue-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
            clipRule="evenodd"
          />
        </svg>
      );
    } else if (type === "application/pdf") {
      return (
        <svg
          className="h-8 w-8 text-red-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
      );
    } else {
      return (
        <svg
          className="h-8 w-8 text-gray-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
  };

  const handleDownload = async (file) => {
    try {
      await fileService.downloadFile(file.name);
    } catch (err) {
      console.error("Download failed:", err);
      setError(`Download failed: ${err.message}`);
    }
  };

  const handleDelete = async (file) => {
    try {
      await fileService.deleteFile(file.name);
      // The socket event will handle updating the file list, but also refresh manually as backup
      setTimeout(() => {
        fetchFiles();
      }, 1000);
    } catch (err) {
      console.error("Delete failed:", err);
      setError(`Delete failed: ${err.message}`);
      // Refresh the list anyway in case the file was actually deleted
      setTimeout(() => {
        fetchFiles();
      }, 1000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-gray-600">Loading files...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Uploaded Files</h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
            refreshing
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600 hover:shadow-md"
          }`}
        >
          <svg
            className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <svg
            className="h-16 w-16 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No files uploaded
          </h3>
          <p className="text-gray-500">
            Upload your first file to see it listed here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {files.map((file) => (
            <div
              key={file.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 break-words">
                      {file.name}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span>{formatDate(file.uploadDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDownload(file)}
                    className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Download file"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </button>

                  <button
                    onClick={() => handleDelete(file)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete file"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Total files: {files.length}</span>
            <span>
              Total size:{" "}
              {formatFileSize(
                files.reduce((total, file) => total + file.size, 0)
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
