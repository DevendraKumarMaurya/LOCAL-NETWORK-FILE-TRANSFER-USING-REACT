const os = require('os');

// Get all network interfaces and display them
function displayNetworkInfo() {
  const interfaces = os.networkInterfaces();
  const networkInfo = [];
  
  console.log('\n🌐 Available Network Interfaces:');
  console.log('==================================');
  
  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name];
    for (const alias of iface) {
      if (alias.family === 'IPv4' && !alias.internal) {
        networkInfo.push({
          name: name,
          address: alias.address,
          netmask: alias.netmask,
          mac: alias.mac
        });
        console.log(`📍 ${name}: ${alias.address} (${alias.mac})`);
      }
    }
  }
  
  if (networkInfo.length === 0) {
    console.log('❌ No external network interfaces found');
    console.log('💡 Troubleshooting steps:');
    console.log('   1. Make sure you are connected to a network');
    console.log('   2. Check WiFi/Ethernet connection');
    console.log('   3. Restart network adapter if needed');
    console.log('   4. Try running as administrator');
  } else {
    console.log('\n📱 Access from other devices using any of the above IPs');
    console.log('💡 Example URLs:');
    networkInfo.forEach(info => {
      console.log(`   Frontend: http://${info.address}:5173`);
      console.log(`   Backend:  http://${info.address}:3000`);
    });
  }
  
  console.log('==================================\n');
  
  return networkInfo.length > 0 ? networkInfo[0].address : 'localhost';
}

// Test network connectivity
function testNetworkConnectivity() {
  try {
    const interfaces = os.networkInterfaces();
    const hasNetwork = Object.keys(interfaces).some(name => {
      return interfaces[name].some(iface => 
        iface.family === 'IPv4' && !iface.internal
      );
    });
    
    return {
      hasNetwork: hasNetwork,
      interfaceCount: Object.keys(interfaces).length,
      status: hasNetwork ? 'Connected' : 'No network detected'
    };
  } catch (error) {
    return {
      hasNetwork: false,
      error: error.message,
      status: 'Network detection failed'
    };
  }
}

module.exports = { displayNetworkInfo, testNetworkConnectivity };
