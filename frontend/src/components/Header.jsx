import { useState, useEffect } from "react";
import { useNetworkStatus } from "../hooks/useNetworkStatus";

export default function Header() {
  const [connectionType, setConnectionType] = useState("Unknown");
  const { serverInfo, networkStatus, connectionStats } = useNetworkStatus();

  useEffect(() => {
    // Get connection type
    if (navigator.connection) {
      setConnectionType(
        navigator.connection.effectiveType ||
          navigator.connection.type ||
          "Unknown"
      );
    }
  }, []);

  const getConnectionStatusColor = () => {
    if (!networkStatus?.isOnline) return "bg-red-600";
    if (connectionStats?.isConnected) return "bg-green-600";
    return "bg-yellow-600";
  };

  const getConnectionText = () => {
    if (!networkStatus?.isOnline) return "OFFLINE";
    if (connectionStats?.transport)
      return connectionStats.transport.toUpperCase();
    return connectionType.toUpperCase();
  };

  const getDisplayIP = () => {
    if (serverInfo?.localIP)
      return `http://${serverInfo.localIP}:${serverInfo.port}`;
    return window.location.origin;
  };

  return (
    <>
      <header className="bg-gray-800 text-white p-4 fixed top-0 left-0 right-0 z-50 flex w-full items-center justify-around">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">Web File Transfer</h1>
          <img
            src="https://img.icons8.com/?size=100&id=16109&format=png&color=ffffff"
            className="h-10 w-10"
            alt="File sharing icon"
          />
        </div>

        <div className="flex flex-col items-end text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-gray-300">Connection:</span>
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${getConnectionStatusColor()} text-white`}
            >
              {getConnectionText()}
            </span>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-gray-300">Network:</span>
            <span className="bg-blue-600 px-2 py-1 rounded text-xs font-mono">
              {getDisplayIP()}
            </span>
          </div>
          {connectionStats?.latency && (
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-gray-300">Latency:</span>
              <span className="bg-purple-600 px-2 py-1 rounded text-xs">
                {connectionStats.latency}ms
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Spacer div to prevent content from going under the fixed header */}
      <div className="h-20"></div>
    </>
  );
}
