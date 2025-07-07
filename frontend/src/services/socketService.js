import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config/api.js';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // Connect to Socket.IO server
  connect() {
    if (!this.socket) {
      console.log('🔌 Connecting to Socket.IO server:', API_BASE_URL);
      
      this.socket = io(API_BASE_URL, {
        transports: ['websocket', 'polling'],
        upgrade: true,
        timeout: 20000,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: this.maxReconnectAttempts,
        forceNew: false
      });

      this.socket.on('connect', () => {
        console.log('✅ Connected to server:', this.socket.id);
        this.isConnected = true;
        this.reconnectAttempts = 0;
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from server:', reason);
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('🔥 Connection error:', error.message);
        this.isConnected = false;
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('❌ Max reconnection attempts reached. Please check your network connection.');
        }
      });
      
      this.socket.on('reconnect', (attemptNumber) => {
        console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
        this.isConnected = true;
        this.reconnectAttempts = 0;
      });
      
      this.socket.on('reconnect_error', (error) => {
        console.error('🔥 Reconnection error:', error.message);
      });
      
      this.socket.on('connected', (data) => {
        console.log('📡 Server confirmation:', data.message);
      });
    }

    return this.socket;
  }

  // Disconnect from Socket.IO server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Listen for file upload events
  onFileUploaded(callback) {
    if (this.socket) {
      this.socket.on('fileUploaded', callback);
    }
  }

  // Listen for multiple files upload events
  onFilesUploaded(callback) {
    if (this.socket) {
      this.socket.on('filesUploaded', callback);
    }
  }

  // Listen for file delete events
  onFileDeleted(callback) {
    if (this.socket) {
      this.socket.on('fileDeleted', callback);
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  // Get detailed connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id || null,
      connected: this.socket?.connected || false,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      transport: this.socket?.io?.engine?.transport?.name || 'unknown'
    };
  }
  
  // Test connection
  testConnection() {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized'));
        return;
      }
      
      const timeout = setTimeout(() => {
        reject(new Error('Connection test timeout'));
      }, 5000);
      
      this.socket.emit('ping', { timestamp: Date.now() });
      
      this.socket.once('pong', (data) => {
        clearTimeout(timeout);
        resolve({
          success: true,
          latency: Date.now() - data.timestamp,
          serverTime: data.serverTime
        });
      });
    });
  }

  // Emit custom events
  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }

  // Listen for custom events
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Remove specific listener
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export default new SocketService();
