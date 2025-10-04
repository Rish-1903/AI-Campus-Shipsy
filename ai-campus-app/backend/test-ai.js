const http = require('http');

console.log('🧪 Final AI Integration Test...');

// Test the AI test endpoint first
const testOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/ai/test',
  method: 'GET'
};

console.log('1. Testing AI test endpoint...');
const testReq = http.request(testOptions, (testRes) => {
  let data = '';
  
  testRes.on('data', (chunk) => {
    data += chunk;
  });
  
  testRes.on('end', () => {
    console.log(`   Status: ${testRes.statusCode}`);
    
    if (testRes.statusCode === 200) {
      const response = JSON.parse(data);
      console.log('   ✅ AI routes are configured!');
      console.log('   Message:', response.message);
      testWithAuth();
    } else {
      console.log('   ❌ AI routes not found:', data);
      console.log('   💡 Create routes/ai-routes.js and update server.js');
    }
  });
});

testReq.on('error', (error) => {
  console.log('   ❌ Cannot connect:', error.message);
});

testReq.end();

function testWithAuth() {
  console.log('2. Testing AI analysis with authentication...');
  
  const loginData = JSON.stringify({
    username: 'Rish191203',
    password: 'your_password_here'  // Use your actual password
  });

  const loginOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': loginData.length
    }
  };

  const loginReq = http.request(loginOptions, (loginRes) => {
    let loginData = '';
    
    loginRes.on('data', (chunk) => {
      loginData += chunk;
    });
    
    loginRes.on('end', () => {
      if (loginRes.statusCode === 200) {
        const response = JSON.parse(loginData);
        const token = response.token;
        console.log('   ✅ Login successful');
        
        // Test AI analysis
        const aiOptions = {
          hostname: 'localhost',
          port: 5000,
          path: '/api/ai/analysis',
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };

        const aiReq = http.request(aiOptions, (aiRes) => {
          let aiData = '';
          
          aiRes.on('data', (chunk) => {
            aiData += chunk;
          });
          
          aiRes.on('end', () => {
            console.log(`   AI Analysis Status: ${aiRes.statusCode}`);
            
            if (aiRes.statusCode === 200) {
              const response = JSON.parse(aiData);
              console.log('   🎉 AI Analysis Working!');
              console.log('   Preview:', response.analysis.substring(0, 150) + '...');
            } else {
              console.log('   ❌ AI Analysis failed:', aiData);
            }
          });
        });

        aiReq.on('error', (error) => {
          console.log('   ❌ AI request failed:', error.message);
        });

        aiReq.end();
      } else {
        console.log('   ❌ Login failed - check password');
      }
    });
  });

  loginReq.on('error', (error) => {
    console.log('   ❌ Login request failed:', error.message);
  });

  loginReq.write(loginData);
  loginReq.end();
}
