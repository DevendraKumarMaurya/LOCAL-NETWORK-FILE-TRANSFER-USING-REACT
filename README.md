# Local Network File Transfer Application

A React-based file transfer application with Node.js backend, featuring real-time updates via Socket.IO and optional file encryption.

## Features

- 🚀 **File Upload**: Single and multiple file upload support
- 📁 **File Management**: View, download, and delete uploaded files
- 🔒 **Encryption**: Optional client-side file encryption using AES
- ⚡ **Real-time Updates**: Live file list updates using Socket.IO
- 🎨 **Modern UI**: Beautiful and responsive interface with Tailwind CSS
- 🔄 **Progress Tracking**: Real-time upload progress indication

## Project Structure

```text
├── backend/          # Node.js Express server
│   ├── index.js      # Main server file
│   ├── package.json  # Backend dependencies
│   ├── .env          # Environment variables
│   └── uploads/      # File storage directory
└── frontend/         # React application
    ├── src/
    │   ├── App.jsx
    │   ├── config/
    │   │   └── api.js    # API configuration
    │   └── services/
    │       ├── fileService.js   # File operations
    │       └── socketService.js # Socket.IO client
    ├── components/
    │   ├── FileUpload.jsx
    │   ├── FileList.jsx
    │   ├── Header.jsx
    │   └── Footer.jsx
    ├── package.json
    └── .env
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- pnpm (recommended) or npm

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Configure environment variables in `.env`:

   ```env
   PORT=3000
   CORS_ORIGIN=http://localhost:5173
   ENCRYPTION_KEY=your-secret-encryption-key-change-this-in-production
   MAX_FILE_SIZE=4294967296
   UPLOAD_DIR=uploads
   ```

4. Start the development server:

   ```bash
   pnpm run dev
   ```

The backend server will start on `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Configure environment variables in `.env`:

   ```env
   VITE_API_URL=http://localhost:3000
   VITE_ENCRYPTION_KEY=your-secret-encryption-key-change-this-in-production
   VITE_ENABLE_ENCRYPTION=false
   ```

4. Start the development server:

   ```bash
   pnpm run dev
   ```

The frontend application will start on `http://localhost:5173`

## Usage

### Basic File Operations

1. **Upload Files**:
   - Drag and drop files or click "Choose File"
   - Toggle encryption on/off before uploading
   - Watch real-time upload progress

2. **View Files**:
   - See all uploaded files with metadata
   - Real-time updates when new files are added

3. **Download Files**:
   - Click the download button next to any file
   - Files are automatically downloaded to your browser's download folder

4. **Delete Files**:
   - Click the delete button next to any file
   - Changes are reflected in real-time across all connected clients

### Encryption

The application supports optional AES encryption:

- **Frontend**: Toggle encryption before uploading files
- **Backend**: Stores encrypted files securely
- **Key Management**: Uses environment variables for encryption keys

**Important**: Make sure to use the same encryption key in both frontend and backend `.env` files.

## API Endpoints

### File Operations

- `GET /api/files` - Get all uploaded files
- `POST /api/upload` - Upload single file
- `POST /api/upload-multiple` - Upload multiple files
- `GET /api/download/:filename` - Download file
- `DELETE /api/delete/:filename` - Delete file

### System

- `GET /api/health` - Health check
- `GET /api/server-info` - Server information

### Socket.IO Events

- `fileUploaded` - Single file uploaded
- `filesUploaded` - Multiple files uploaded
- `fileDeleted` - File deleted

## Security Considerations

1. **Encryption Keys**: Change default encryption keys in production
2. **File Size Limits**: Configure appropriate file size limits
3. **CORS**: Configure CORS origins for production
4. **File Types**: Add file type validation as needed
5. **Authentication**: Consider adding user authentication for production use

## Production Deployment

1. **Environment Variables**: Update all environment variables for production
2. **HTTPS**: Use HTTPS in production
3. **File Storage**: Consider using cloud storage for scalability
4. **Database**: Add a database for file metadata persistence
5. **Load Balancing**: Configure load balancing for high availability

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure `CORS_ORIGIN` is correctly set in backend `.env`
2. **Connection Issues**: Check that both frontend and backend are running
3. **File Upload Errors**: Verify file size limits and permissions
4. **Encryption Issues**: Ensure encryption keys match in both frontend and backend

### Development Tips

- Use browser developer tools to debug API calls
- Check console logs for detailed error messages
- Verify Socket.IO connection in browser network tab
- Test file operations with different file types and sizes

## Technologies Used

- **Frontend**: React, Vite, Tailwind CSS, Axios, Socket.IO Client, CryptoJS
- **Backend**: Node.js, Express, Multer, Socket.IO, CryptoJS, CORS
- **Real-time**: Socket.IO for bidirectional communication
- **Encryption**: AES encryption using CryptoJS library

## License

This project is open source and available under the MIT License.
