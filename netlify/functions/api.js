const serverless = require('serverless-http');
const { initDatabase } = require('../../database.js');
const app = require('../../server.js');

let isInitialized = false;
let initPromise = null;

const handler = serverless(app);

module.exports.handler = async (event, context) => {
  if (!isInitialized) {
    if (!initPromise) {
      initPromise = initDatabase();
    }
    await initPromise;
    isInitialized = true;
  }
  return handler(event, context);
};
