import { api } from '../config/api.js';
import socketService from './socketService.js';

class NetworkService {
  constructor() {
    this.serverInfo = null;
    this.lastUpdate = null;
    this.updateInterval = null;
  }

  // Get server information
  async getServerInfo() {
    try {
      const response = await api.get('/api/server-info');
      this.serverInfo = response.data;
      this.lastUpdate = new Date();
      return response.data;
    } catch (error) {
      console.error('Failed to get server info:', error);
      throw new Error(error.response?.data?.error || 'Failed to get server info');
    }
  }

  // Test network connectivity
  async testNetworkConnectivity() {
    try {
      const response = await api.get('/api/network-test');
      return response.data;
    } catch (error) {
      console.error('Network test failed:', error);
      throw new Error(error.response?.data?.error || 'Network test failed');
    }
  }

  // Get health status
  async getHealthStatus() {
    try {
      const response = await api.get('/api/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw new Error(error.response?.data?.error || 'Health check failed');
    }
  }

  // Get real-time connection statistics
  getConnectionStats() {
    const socketStatus = socketService.getConnectionStatus();
    return {
      socketConnected: socketStatus.isConnected,
      socketId: socketStatus.socketId,
      transport: socketStatus.transport,
      reconnectAttempts: socketStatus.reconnectAttempts,
      serverInfo: this.serverInfo,
      lastUpdate: this.lastUpdate
    };
  }

  // Test socket connection latency
  async testSocketLatency() {
    try {
      return await socketService.testConnection();
    } catch (error) {
      console.error('Socket latency test failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Start periodic updates
  startPeriodicUpdates(interval = 30000) {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    this.updateInterval = setInterval(async () => {
      try {
        await this.getServerInfo();
      } catch (error) {
        console.error('Periodic update failed:', error);
      }
    }, interval);
  }

  // Stop periodic updates
  stopPeriodicUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // Get network quality indicator
  getNetworkQuality() {
    const stats = this.getConnectionStats();
    
    if (!stats.socketConnected) {
      return { quality: 'poor', color: 'red', text: 'Disconnected' };
    }
    
    if (stats.reconnectAttempts > 0) {
      return { quality: 'fair', color: 'yellow', text: 'Unstable' };
    }
    
    if (stats.transport === 'websocket') {
      return { quality: 'excellent', color: 'green', text: 'Excellent' };
    }
    
    return { quality: 'good', color: 'blue', text: 'Good' };
  }
}

export default new NetworkService();
