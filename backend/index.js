const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { timeStamp } = require("console");
const CryptoJS = require("crypto-js");
const os = require("os");
const {
  displayNetworkInfo,
  testNetworkConnectivity,
} = require("./utils/networkInfo");
require("dotenv").config();

const app = express();
const server = createServer(app);

// Get local network IP address with better detection
const getLocalNetworkIP = () => {
  const interfaces = os.networkInterfaces();
  const candidates = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip non-IPv4 and internal addresses
      if (iface.family === "IPv4" && !iface.internal) {
        candidates.push({
          name: name,
          address: iface.address,
          priority: getPriority(iface.address, name),
        });
      }
    }
  }

  // Sort by priority (WiFi/Ethernet preferred)
  candidates.sort((a, b) => b.priority - a.priority);

  return candidates.length > 0 ? candidates[0].address : "localhost";
};

// Assign priority to network interfaces
const getPriority = (address, interfaceName) => {
  // Prefer common private network ranges
  if (address.startsWith("192.168.")) return 100;
  if (address.startsWith("10.")) return 90;
  if (address.startsWith("172.")) return 80;

  // Prefer WiFi and Ethernet interfaces
  const name = interfaceName.toLowerCase();
  if (name.includes("wifi") || name.includes("wireless")) return 70;
  if (name.includes("ethernet") || name.includes("eth")) return 60;

  return 50; // Default priority
};

const localIP = getLocalNetworkIP();

// Function to create socket origins for server info
const createSocketOrigins = () => {
  return [
    `http://localhost:5173`,
    `http://localhost:3000`,
    `http://${localIP}:5173`,
    `http://${localIP}:3000`,
    /^http:\/\/192\.168\.\d+\.\d+:\d+$/,
    /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/,
    /^http:\/\/172\.\d+\.\d+\.\d+:\d+$/,
  ];
};

const io = new Server(server, {
  cors: {
    origin: true, // reflect request origin
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    optionsSuccessStatus: 200,
  },
  transports: ["websocket", "polling"],
});

const PORT = process.env.PORT || 3000;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "your-secret-key-here";

// Encryption/Decryption functions
const encryptFile = (data) => {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
};

const decryptFile = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

const uploadDirectory = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Add body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simplified CORS configuration: reflect origin for any local network request
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    optionsSuccessStatus: 200,
  })
);

// Serve static files from uploads directory
app.use("/uploads", express.static(uploadDirectory));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 4 * 1024 * 1024 * 1024, // Limit file size to 4GB
  },
  fileFilter: (req, file, cb) => {
    cb(null, true); // Accept all files
  },
});

io.on("connection", (socket) => {
  const clientIP = socket.request.connection.remoteAddress;
  console.log(`✅ User connected: ${socket.id} from ${clientIP}`);

  socket.on("disconnect", (reason) => {
    console.log(`❌ User disconnected: ${socket.id} - Reason: ${reason}`);
  });

  socket.on("error", (error) => {
    console.log(`🔥 Socket error: ${socket.id} - ${error}`);
  });

  // Ping/Pong for connection testing
  socket.on("ping", (data) => {
    socket.emit("pong", {
      timestamp: data.timestamp,
      serverTime: Date.now(),
    });
  });

  // Send connection confirmation
  socket.emit("connected", {
    message: "Connected to file transfer server",
    serverId: socket.id,
    timestamp: new Date().toISOString(),
    serverIP: localIP,
  });
});

//Route

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timeStamp: new Date().toISOString() });
});

// Get all uploaded files
app.get("/api/files", (req, res) => {
  try {
    fs.readdir(uploadDirectory, (err, files) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
      }
      const fileList = files.map((file, index) => {
        const filePath = path.join(uploadDirectory, file);
        const stats = fs.statSync(filePath);
        return {
          id: index + 1,
          name: file,
          size: stats.size,
          uploadDate: stats.birthtime.toISOString(),
          type: "application/octet-stream", // Default type, could be enhanced
          url: `/uploads/${file}`,
        };
      });
      res.json(fileList);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Upload a file
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = {
      id: Date.now(), // Use timestamp as ID
      name: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype,
      timeStamp: new Date().toISOString(),
      uploadDate: new Date().toISOString(),
      url: `/uploads/${req.file.filename}`,
      isEncrypted: req.body.isEncrypted === "true",
    };

    // Emit an event to notify clients about the new file upload
    io.emit("fileUploaded", filePath);

    res.json({ message: "File uploaded successfully", filePath });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Upload multiple files
app.post("/api/upload-multiple", upload.array("files"), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const filePaths = req.files.map((file, index) => ({
      id: Date.now() + index,
      name: file.filename,
      originalName: file.originalname,
      size: file.size,
      type: file.mimetype,
      timeStamp: new Date().toISOString(),
      uploadDate: new Date().toISOString(),
      url: `/uploads/${file.filename}`,
      isEncrypted: req.body.isEncrypted === "true",
    }));

    // Emit an event to notify clients about the new file uploads
    io.emit("filesUploaded", filePaths);

    res.json({ message: "Files uploaded successfully", filePaths });
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Download file
app.get("/api/download/:filename", (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadDirectory, filename);

    res.download(filePath, filename, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        res.status(404).json({ error: "File not found" });
      }
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete file
app.delete("/api/delete/:filename", (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadDirectory, filename);
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
        res.status(500).json({ error: "Internal server error" });
      } else {
        // Emit an event to notify clients about the file deletion
        io.emit("fileDeleted", { filename });
        res.json({ message: "File deleted successfully" });
      }
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// === Automatic File Deletion: Time-based ===
const FILE_LIFETIME_MS = 60 * 60 * 1000; // 1 hour (adjust as needed)
setInterval(() => {
  fs.readdir(uploadDirectory, (err, files) => {
    if (err) return;
    files.forEach((file) => {
      const filePath = path.join(uploadDirectory, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;
        if (Date.now() - stats.mtimeMs > FILE_LIFETIME_MS) {
          fs.unlink(filePath, () => {});
        }
      });
    });
  });
}, 10 * 60 * 1000); // Check every 10 minutes

// === API: Delete All Files (for network change) ===
app.delete("/api/delete-all", (req, res) => {
  fs.readdir(uploadDirectory, (err, files) => {
    if (err) return res.status(500).json({ error: "Failed to read files" });
    let deleted = 0;
    files.forEach((file) => {
      const filePath = path.join(uploadDirectory, file);
      fs.unlink(filePath, (err) => {
        if (!err) deleted++;
      });
    });
    res.json({
      message: `Requested deletion of all files. Deleted: ${deleted}`,
    });
    io.emit("allFilesDeleted");
  });
});

// Get server information
app.get("/api/server-info", (req, res) => {
  const networkTest = testNetworkConnectivity();
  const serverInfo = {
    host: req.hostname,
    port: PORT,
    localIP: localIP,
    environment: process.env.NODE_ENV || "development",
    uptime: process.uptime(),
    networkStatus: networkTest,
    networkAccess: {
      local: `http://localhost:${PORT}`,
      network: `http://${localIP}:${PORT}`,
    },
    corsOrigins: createSocketOrigins().map((origin) =>
      origin instanceof RegExp ? origin.toString() : origin
    ),
  };
  res.json(serverInfo);
});

// Network diagnostic endpoint
app.get("/api/network-test", (req, res) => {
  const networkTest = testNetworkConnectivity();
  const interfaces = os.networkInterfaces();

  res.json({
    timestamp: new Date().toISOString(),
    status: networkTest.status,
    hasNetwork: networkTest.hasNetwork,
    detectedIP: localIP,
    allInterfaces: Object.keys(interfaces).map((name) => ({
      name: name,
      addresses: interfaces[name]
        .filter((iface) => iface.family === "IPv4")
        .map((iface) => ({
          address: iface.address,
          internal: iface.internal,
          netmask: iface.netmask,
        })),
    })),
    requestInfo: {
      clientIP: req.ip || req.connection.remoteAddress,
      origin: req.headers.origin,
      userAgent: req.headers["user-agent"],
    },
  });
});

server
  .listen(PORT, "0.0.0.0", () => {
    console.log("\n=== File Transfer Server Started ===");
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Local access: http://localhost:${PORT}`);
    console.log(`📱 Network access: http://${localIP}:${PORT}`);
    console.log(`📁 Upload directory: ${uploadDirectory}`);
    console.log(`🔌 Socket.IO ready for real-time connections`);

    // Test network connectivity
    const networkTest = testNetworkConnectivity();
    console.log(`📡 Network Status: ${networkTest.status}`);

    // Display all available network interfaces
    displayNetworkInfo();

    console.log("📋 API Endpoints:");
    console.log(`   GET  /api/health - Health check`);
    console.log(`   GET  /api/network-test - Network diagnostics`);
    console.log(`   GET  /api/server-info - Server information`);
    console.log(`   GET  /api/files - List files`);
    console.log(`   POST /api/upload - Upload file`);
    console.log(`   GET  /api/download/:filename - Download file`);
    console.log(`   DEL  /api/delete/:filename - Delete file`);
    console.log("\n💡 Troubleshooting:");
    if (localIP === "localhost") {
      console.log(
        "   ⚠️  No network IP detected - only local access available"
      );
      console.log("   💡 Check network connection and try restarting server");
    } else {
      console.log(
        `   🎯 For network access, update frontend VITE_API_URL to: http://${localIP}:${PORT}`
      );
      console.log('   🔧 Use "pnpm run network" to auto-configure frontend');
    }
    console.log("=====================================\n");
  })
  .on("error", (err) => {
    console.error("❌ Server startup error:", err);
    if (err.code === "EADDRINUSE") {
      console.error(
        `💡 Port ${PORT} is already in use. Try a different port or stop the existing process.`
      );
    } else if (err.code === "EACCES") {
      console.error(
        `💡 Permission denied. Try running as administrator or use a port > 1024.`
      );
    }
    process.exit(1);
  });
