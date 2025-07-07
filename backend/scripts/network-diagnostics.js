#!/usr/bin/env node

const os = require('os');
const { exec } = require('child_process');

// Network troubleshooting tool
function runNetworkDiagnostics() {
  console.log('\n🔧 Network Diagnostics Tool');
  console.log('===========================');
  
  // 1. Check network interfaces
  console.log('\n1️⃣ Network Interfaces:');
  const interfaces = os.networkInterfaces();
  let hasValidInterface = false;
  
  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name];
    for (const alias of iface) {
      if (alias.family === 'IPv4') {
        const status = alias.internal ? '🏠 Internal' : '🌐 External';
        console.log(`   ${name}: ${alias.address} ${status}`);
        if (!alias.internal) hasValidInterface = true;
      }
    }
  }
  
  if (!hasValidInterface) {
    console.log('   ❌ No external network interfaces found');
    console.log('   💡 Connect to WiFi or plug in Ethernet cable');
  }
  
  // 2. Check if ports are available
  console.log('\n2️⃣ Port Availability:');
  checkPort(3000, 'Backend Server');
  checkPort(5173, 'Frontend Server');
  
  // 3. System info
  console.log('\n3️⃣ System Information:');
  console.log(`   OS: ${os.type()} ${os.release()}`);
  console.log(`   Platform: ${os.platform()}`);
  console.log(`   Architecture: ${os.arch()}`);
  console.log(`   Node.js: ${process.version}`);
  
  // 4. Network commands (Windows/Unix)
  console.log('\n4️⃣ Network Commands:');
  if (os.platform() === 'win32') {
    console.log('   📋 Run these commands for more info:');
    console.log('      ipconfig /all - Show all network config');
    console.log('      netstat -an | findstr :3000 - Check if port 3000 is in use');
    console.log('      netstat -an | findstr :5173 - Check if port 5173 is in use');
  } else {
    console.log('   📋 Run these commands for more info:');
    console.log('      ifconfig - Show network interfaces');
    console.log('      netstat -tulpn | grep :3000 - Check if port 3000 is in use');
    console.log('      netstat -tulpn | grep :5173 - Check if port 5173 is in use');
  }
  
  // 5. Firewall info
  console.log('\n5️⃣ Firewall Considerations:');
  console.log('   🛡️ Make sure these ports are allowed:');
  console.log('      Port 3000 (Backend API)');
  console.log('      Port 5173 (Frontend UI)');
  
  // 6. Common solutions
  console.log('\n6️⃣ Common Solutions:');
  console.log('   🔄 Restart network adapter');
  console.log('   🔌 Check WiFi/Ethernet connection');
  console.log('   🛡️ Temporarily disable firewall for testing');
  console.log('   👨‍💼 Run as administrator (Windows)');
  console.log('   📱 Ensure all devices are on same network');
  
  console.log('\n===========================\n');
}

// Check if a port is available
function checkPort(port, service) {
  const net = require('net');
  const server = net.createServer();
  
  server.listen(port, (err) => {
    if (err) {
      console.log(`   ❌ Port ${port} (${service}): In use or blocked`);
    } else {
      console.log(`   ✅ Port ${port} (${service}): Available`);
      server.close();
    }
  });
  
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`   ⚠️  Port ${port} (${service}): Already in use`);
    } else {
      console.log(`   ❌ Port ${port} (${service}): ${err.message}`);
    }
  });
}

// Run diagnostics
runNetworkDiagnostics();
