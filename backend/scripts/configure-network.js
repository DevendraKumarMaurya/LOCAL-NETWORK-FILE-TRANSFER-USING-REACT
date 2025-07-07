#!/usr/bin/env node

const os = require('os');
const fs = require('fs');
const path = require('path');

// Get local network IP
function getLocalNetworkIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalNetworkIP();
const PORT = process.env.PORT || 3000;

console.log('\n🔧 Network Configuration Helper');
console.log('===============================');
console.log(`📍 Your local IP: ${localIP}`);
console.log(`🚪 Server port: ${PORT}`);
console.log(`🌐 Backend URL: http://${localIP}:${PORT}`);
console.log(`📱 Frontend URL: http://${localIP}:5173`);

// Update frontend .env file
const frontendEnvPath = path.join(__dirname, '../frontend/.env');

if (fs.existsSync(frontendEnvPath)) {
  let envContent = fs.readFileSync(frontendEnvPath, 'utf8');
  
  // Update VITE_API_URL
  if (envContent.includes('VITE_API_URL=')) {
    envContent = envContent.replace(
      /VITE_API_URL=.*/,
      `VITE_API_URL=http://${localIP}:${PORT}`
    );
  } else {
    envContent += `\nVITE_API_URL=http://${localIP}:${PORT}`;
  }
  
  fs.writeFileSync(frontendEnvPath, envContent);
  console.log(`✅ Updated frontend .env file with network IP`);
} else {
  console.log(`❌ Frontend .env file not found at ${frontendEnvPath}`);
}

console.log('\n📋 Next Steps:');
console.log('1. Start the backend server: pnpm run dev');
console.log('2. Start the frontend: cd ../frontend && pnpm run dev');
console.log(`3. Access from other devices: http://${localIP}:5173`);
console.log('\n💡 Make sure devices are on the same network!');
console.log('===============================\n');
