// Runs before any test file or app code is loaded (see jest.config.js
// "setupFiles"). dotenv.config() does not overwrite variables already
// present in process.env, so loading .env.test here first means these
// values win over src/config's later require('dotenv').config() (which
// loads plain .env).
require('dotenv').config({ path: '.env.test' });
