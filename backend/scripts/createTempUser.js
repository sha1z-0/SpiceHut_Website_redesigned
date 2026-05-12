const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../models/User');

const loadEnv = () => {
  const rootEnv = path.resolve(__dirname, '../../.env');
  const backendEnv = path.resolve(__dirname, '../.env');

  if (fs.existsSync(rootEnv)) {
    dotenv.config({ path: rootEnv });
  }

  if (!process.env.MONGO_URI && fs.existsSync(backendEnv)) {
    dotenv.config({ path: backendEnv });
  }
};

const parseArgs = () => {
  const args = process.argv.slice(2);
  const parsed = {};
  for (let i = 0; i < args.length; i += 1) {
    const key = args[i];
    if (!key.startsWith('--')) continue;
    const value = args[i + 1];
    parsed[key.slice(2)] = value;
    i += 1;
  }
  return parsed;
};

const main = async () => {
  loadEnv();
  if (!process.env.MONGO_URI) {
    console.error('Missing MONGO_URI. Set it in the root .env or backend/.env file.');
    process.exit(1);
  }

  const args = parseArgs();
  const email = args.email || `test.user.${Date.now()}@example.com`;
  const password = args.password || 'Test1234!';
  const name = args.name || 'Test User';
  const phone = args.phone || '2505550123';

  await mongoose.connect(process.env.MONGO_URI);

  try {
    let user = await User.findOne({ email });
    if (user) {
      user.name = name;
      user.phone = phone;
      user.role = 'user';
      user.isVerified = true;
      user.verifyToken = '';
      user.verifyTokenExpires = undefined;
      user.password = password;
      await user.save();
      console.log(`Updated user: ${email}`);
    } else {
      user = await User.create({
        name,
        email,
        password,
        phone,
        role: 'user',
        isVerified: true,
        verifyToken: '',
        verifyTokenExpires: undefined,
      });
      console.log(`Created user: ${email}`);
    }

    console.log(`Login email: ${email}`);
    if (!args.password) {
      console.log(`Login password: ${password}`);
    } else {
      console.log('Login password: (provided via --password)');
    }
  } finally {
    await mongoose.disconnect();
  }
};

main().catch((err) => {
  console.error('Failed to create temp user:', err && err.message ? err.message : err);
  process.exit(1);
});
