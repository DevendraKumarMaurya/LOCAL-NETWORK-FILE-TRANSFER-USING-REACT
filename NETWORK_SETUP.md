# 🌐 Local Network Setup Guide

## Problem Fixed: Backend Network Configuration

Your backend has been updated to support local network access! Here are the changes made:

### ✅ What Was Fixed

1. **Server Binding**:
   - Changed from `localhost` to `0.0.0.0` to accept connections from any IP
   - Server now listens on all network interfaces

2. **CORS Configuration**:
   - Added support for local network IP ranges (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
   - Dynamic origin checking for local network access
   - Automatic IP detection and allowlisting

3. **Socket.IO Configuration**:
   - Updated to accept connections from local network
   - Enhanced CORS settings for real-time communication

4. **Network Detection**:
   - Automatic local IP detection
   - Network interface enumeration
   - Helpful startup logs with connection URLs

### 🚀 How to Use

#### Quick Network Setup

```bash
# 1. Configure network settings automatically
cd backend
pnpm run network

# 2. Start the backend
pnpm run dev

# 3. Start the frontend (in another terminal)
cd frontend
pnpm run dev
```

#### Manual Setup

1. **Start Backend** (it will show your network IP):

   ```bash
   cd backend
   pnpm run dev
   ```

2. **Note the Network IP** from the console output:

   ```text
   🌐 Local access: http://localhost:3000
   📱 Network access: http://192.168.1.100:3000  <-- This IP
   ```

3. **Update Frontend .env**:

   ```env
   VITE_API_URL=http://192.168.1.100:3000
   ```

4. **Start Frontend**:

   ```bash
   cd frontend
   pnpm run dev
   ```

### 📱 Access from Other Devices

1. **Find Your Computer's IP**: The backend will display it when starting
2. **Connect devices to the same WiFi network**
3. **Open browser on any device**: `http://YOUR_IP:5173`

### 🔧 Network Configuration Details

#### Supported IP Ranges

- `192.168.x.x` (Home networks)
- `10.x.x.x` (Corporate networks)
- `172.16.x.x - 172.31.x.x` (Private networks)
- `localhost/127.0.0.1` (Local access)

#### Security Features

- Only local network IPs are allowed
- No external internet access permitted
- CORS protection maintained

### 🐛 Troubleshooting

#### Problem: Cannot access from other devices

**Solutions:**

1. Ensure all devices are on the same network
2. Check firewall settings (allow port 3000 and 5173)
3. Verify the IP address is correct
4. Try disabling VPN if active

#### Problem: CORS errors

**Solutions:**

1. Restart both backend and frontend after IP changes
2. Clear browser cache
3. Check that VITE_API_URL matches the backend IP

#### Problem: No network IP detected

**Solutions:**

1. Connect to a WiFi network
2. Check network adapter settings
3. Try running `ipconfig` (Windows) or `ifconfig` (Mac/Linux)

### 🔍 Network Testing

Test your network setup:

```bash
# Test backend API
curl http://YOUR_IP:3000/api/health

# Test from another device's browser
http://YOUR_IP:5173
```

### 📋 Firewall Settings

#### Windows

1. Open Windows Defender Firewall
2. Click "Allow an app or feature"
3. Add Node.js (for port 3000)
4. Add your browser (for port 5173)

#### macOS

1. System Preferences → Security & Privacy → Firewall
2. Add Node.js and browser applications

Your backend is now ready for local network file transfer! 🎉
