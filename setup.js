const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up HomeFunders application...');

// Check if .env file exists, if not create it
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  const envContent = `NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/homefunders
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
COOKIE_EXPIRE=30`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
}

// Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully!');
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
}

// Start the application
console.log('🚀 Starting the application...');
try {
  execSync('npm run dev', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Error starting the application:', error.message);
  process.exit(1);
} 