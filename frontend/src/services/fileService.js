import { api } from '../config/api.js';
import CryptoJS from 'crypto-js';

// Encryption key - in production, this should be securely managed
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'your-secret-key-here';

// File service class
class FileService {
  // Encrypt file data
  encryptFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const wordArray = CryptoJS.lib.WordArray.create(reader.result);
          const encrypted = CryptoJS.AES.encrypt(wordArray, ENCRYPTION_KEY).toString();
          resolve(encrypted);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  // Decrypt file data
  decryptFile(encryptedData) {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch {
      throw new Error('Failed to decrypt file');
    }
  }

  // Upload single file
  async uploadFile(file, encrypted = false) {
    try {
      const formData = new FormData();
      
      if (encrypted) {
        // Encrypt the file before uploading
        const encryptedData = await this.encryptFile(file);
        const encryptedBlob = new Blob([encryptedData], { type: 'application/octet-stream' });
        formData.append('file', encryptedBlob, `encrypted_${file.name}`);
        formData.append('isEncrypted', 'true');
        formData.append('originalName', file.name);
        formData.append('originalType', file.type);
      } else {
        formData.append('file', file);
      }

      const response = await api.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          // You can emit this progress to update UI
          console.log(`Upload progress: ${percentCompleted}%`);
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Upload failed');
    }
  }

  // Upload multiple files
  async uploadMultipleFiles(files, encrypted = false) {
    try {
      const formData = new FormData();
      
      if (encrypted) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const encryptedData = await this.encryptFile(file);
          const encryptedBlob = new Blob([encryptedData], { type: 'application/octet-stream' });
          formData.append('files', encryptedBlob, `encrypted_${file.name}`);
        }
        formData.append('isEncrypted', 'true');
      } else {
        for (let i = 0; i < files.length; i++) {
          formData.append('files', files[i]);
        }
      }

      const response = await api.post('/api/upload-multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Upload failed');
    }
  }

  // Get all files
  async getFiles() {
    try {
      const response = await api.get('/api/files');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch files');
    }
  }

  // Download file
  async downloadFile(filename) {
    try {
      const response = await api.get(`/api/download/${filename}`, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Download failed');
    }
  }

  // Delete file
  async deleteFile(filename) {
    try {
      const response = await api.delete(`/api/delete/${filename}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Delete failed');
    }
  }

  // Delete all files (for network change)
  async deleteAllFiles() {
    try {
      const response = await api.delete('/api/delete-all');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Delete all failed');
    }
  }

  // Get server info
  async getServerInfo() {
    try {
      const response = await api.get('/api/server-info');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get server info');
    }
  }
}

export default new FileService();
