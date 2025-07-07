import React from "react";
import { useNetworkStatus } from "../hooks/useNetworkStatus.js";

export default function Footer() {
  const {
    serverInfo,
    networkStatus,
    connectionStats,
    networkQuality,
    refreshNetworkStatus,
  } = useNetworkStatus();

  const getStatusColor = (isOnline) => {
    if (!isOnline) return "bg-red-400";
    return networkQuality.color === "green"
      ? "bg-green-400"
      : networkQuality.color === "yellow"
      ? "bg-yellow-400"
      : networkQuality.color === "blue"
      ? "bg-blue-400"
      : "bg-red-400";
  };

  const getStatusText = (isOnline) => {
    if (!isOnline) return "Offline";
    return networkQuality.text || "Unknown";
  };

  const formatUptime = (seconds) => {
    if (!seconds) return "Unknown";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };
  return (
    <footer className="bg-gray-800 text-white mt-auto w-full">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Web File Transfer</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Secure and fast file sharing within your local network. Transfer
              files easily between devices without internet dependency.
            </p>
          </div>

          {/* Features Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Features</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center">
                <svg
                  className="h-4 w-4 mr-2 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Fast Local Transfer
              </li>
              <li className="flex items-center">
                <svg
                  className="h-4 w-4 mr-2 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Drag & Drop Support
              </li>
              <li className="flex items-center">
                <svg
                  className="h-4 w-4 mr-2 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                No Internet Required
              </li>
              <li className="flex items-center">
                <svg
                  className="h-4 w-4 mr-2 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Secure Transfer
              </li>
            </ul>
          </div>

          {/* Network Info Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Network Status</h3>
              <button
                onClick={refreshNetworkStatus}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                title="Refresh network status"
              >
                <svg
                  className="h-4 w-4"
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
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Server Status:</span>
                <span className="flex items-center">
                  <div
                    className={`h-2 w-2 rounded-full mr-2 ${getStatusColor(
                      networkStatus.isOnline
                    )}`}
                  ></div>
                  <span
                    className={
                      networkStatus.isOnline ? "text-green-400" : "text-red-400"
                    }
                  >
                    {getStatusText(networkStatus.isOnline)}
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Connection:</span>
                <span className="text-white">
                  {connectionStats.transport || "Unknown"}
                  {connectionStats.latency && (
                    <span className="text-gray-400 ml-1">
                      ({connectionStats.latency}ms)
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Server IP:</span>
                <span className="text-white font-mono text-xs">
                  {serverInfo?.localIP || "Loading..."}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Uptime:</span>
                <span className="text-white">
                  {formatUptime(serverInfo?.uptime)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <p className="text-gray-300 text-sm">
                © 2025 Local File Transfer. Built with React.
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center text-xs text-gray-400">
                <svg
                  className="h-4 w-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                Version 1.0.0
              </div>

              <button className="text-gray-400 hover:text-white transition-colors">
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              <button className="text-gray-400 hover:text-white transition-colors">
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
