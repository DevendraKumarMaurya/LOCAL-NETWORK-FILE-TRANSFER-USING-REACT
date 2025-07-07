# Quick Setup Guide

## Your Backend and Frontend are Ready

I've successfully connected your backend with your frontend and added encryption capabilities. Here's what's been implemented:

### ✅ What's Completed

1. **Backend Integration**:
   - File upload/download/delete APIs connected
   - Socket.IO for real-time updates
   - Encryption support with CryptoJS
   - CORS configured for frontend

2. **Frontend Integration**:
   - Axios for API calls
   - Socket.IO client for real-time updates
   - File encryption/decryption with CryptoJS
   - Progress tracking and error handling

3. **Real-time Features**:
   - Live file list updates
   - Upload progress tracking
   - Instant file deletion updates

4. **Security Features**:
   - Optional AES file encryption
   - Configurable encryption keys
   - CORS protection

## 🚀 How to Start

### Option 1: Start Both Services Simultaneously

```bash
# From the root directory
pnpm run dev
```

### Option 2: Start Services Separately

**Terminal 1 - Backend:**

```bash
cd backend
pnpm run dev
```

**Terminal 2 - Frontend:**

```bash
cd frontend
pnpm run dev
```

## 📱 How to Use

1. **Start both services** using one of the methods above
2. **Open your browser** to `http://localhost:5173`
3. **Upload files** by dragging and dropping or clicking "Choose File"
4. **Toggle encryption** on/off before uploading (optional)
5. **View files** in the file list below
6. **Download** files by clicking the download icon
7. **Delete** files by clicking the trash icon

## 🔐 Encryption

- **Toggle Switch**: Use the encryption toggle before uploading
- **Secure**: Files are encrypted on the client side before upload
- **Configurable**: Change encryption keys in `.env` files

## 🔧 Configuration

### Backend (.env)

```text
PORT=3000
CORS_ORIGIN=http://localhost:5173
ENCRYPTION_KEY=your-secret-encryption-key-change-this-in-production
```

### Frontend (.env)

```text
VITE_API_URL=http://localhost:3000
VITE_ENCRYPTION_KEY=your-secret-encryption-key-change-this-in-production
VITE_ENABLE_ENCRYPTION=false
```

## 🌐 Network Access

To access from other devices on your network:

1. **Find your IP address**:

   ```bash
   ipconfig  # Windows
   ifconfig  # Mac/Linux
   ```

2. **Update CORS_ORIGIN** in backend `.env`:

   ```text
   CORS_ORIGIN=http://YOUR_IP_ADDRESS:5173
   ```

3. **Update VITE_API_URL** in frontend `.env`:

   ```text
   VITE_API_URL=http://YOUR_IP_ADDRESS:3000
   ```

4. **Access from other devices**: `http://YOUR_IP_ADDRESS:5173`

## 🎯 Features Ready

- ✅ File upload (single/multiple)
- ✅ File download
- ✅ File deletion
- ✅ Real-time updates via Socket.IO
- ✅ Optional encryption
- ✅ Progress tracking
- ✅ Error handling
- ✅ Responsive UI

Your file transfer application is now fully functional with encryption support!
