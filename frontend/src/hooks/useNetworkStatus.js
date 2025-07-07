import { useState, useEffect, useCallback } from 'react';
import networkService from '../services/networkService.js';
import socketService from '../services/socketService.js';

export const useNetworkStatus = () => {
  const [serverInfo, setServerInfo] = useState(null);
  const [networkStatus, setNetworkStatus] = useState({
    isOnline: false,
    quality: 'unknown',
    lastUpdate: null,
    error: null
  });
  const [connectionStats, setConnectionStats] = useState({
    isConnected: false,
    connectedDevices: 0,
    totalTransfers: 0,
    socketId: null,
    transport: 'unknown',
    latency: null
  });
  const [isLoading, setIsLoading] = useState(true);

  // Update connection stats
  const updateConnectionStats = useCallback(() => {
    const stats = networkService.getConnectionStats();
    setConnectionStats(prev => ({
      ...prev,
      isConnected: stats.socketConnected,
      socketId: stats.socketId,
      transport: stats.transport,
      reconnectAttempts: stats.reconnectAttempts
    }));
    
    const quality = networkService.getNetworkQuality();
    setNetworkStatus(prev => ({
      ...prev,
      isOnline: stats.socketConnected,
      quality: quality.quality,
      lastUpdate: new Date()
    }));
  }, []);

  // Fetch server info
  const fetchServerInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      const info = await networkService.getServerInfo();
      setServerInfo(info);
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: true,
        error: null,
        lastUpdate: new Date()
      }));
    } catch (error) {
      console.error('Failed to fetch server info:', error);
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: false,
        error: error.message,
        lastUpdate: new Date()
      }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Test connection latency
  const testLatency = useCallback(async () => {
    try {
      const result = await networkService.testSocketLatency();
      if (result.success) {
        setConnectionStats(prev => ({
          ...prev,
          latency: result.latency
        }));
      }
    } catch (error) {
      console.error('Latency test failed:', error);
    }
  }, []);

  // Refresh all network data
  const refreshNetworkStatus = useCallback(async () => {
    await fetchServerInfo();
    updateConnectionStats();
    await testLatency();
  }, [fetchServerInfo, updateConnectionStats, testLatency]);

  useEffect(() => {
    // Initial fetch
    fetchServerInfo();
    updateConnectionStats();

    // Start periodic updates
    networkService.startPeriodicUpdates(30000);

    // Update stats when socket connection changes
    const updateStatsInterval = setInterval(() => {
      updateConnectionStats();
    }, 5000);

    // Test latency periodically
    const latencyInterval = setInterval(() => {
      testLatency();
    }, 15000);

    // Socket event listeners
    const handleConnect = () => {
      updateConnectionStats();
      fetchServerInfo();
    };

    const handleDisconnect = () => {
      updateConnectionStats();
    };

    try {
      socketService.on('connect', handleConnect);
      socketService.on('disconnect', handleDisconnect);
      socketService.on('reconnect', handleConnect);
    } catch (error) {
      console.error('Socket event listener setup failed:', error);
    }

    return () => {
      clearInterval(updateStatsInterval);
      clearInterval(latencyInterval);
      networkService.stopPeriodicUpdates();
      
      try {
        socketService.off('connect', handleConnect);
        socketService.off('disconnect', handleDisconnect);
        socketService.off('reconnect', handleConnect);
      } catch (error) {
        console.error('Socket event listener cleanup failed:', error);
      }
    };
  }, [fetchServerInfo, updateConnectionStats, testLatency]);

  return {
    serverInfo,
    networkStatus,
    connectionStats,
    isLoading,
    refreshNetworkStatus,
    networkQuality: networkService.getNetworkQuality()
  };
};
