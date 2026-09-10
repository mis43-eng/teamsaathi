const serverless = require('serverless-http');

let app = null;
let initDatabase = null;
let loadError = null;

try {
  initDatabase = require('../../database.js').initDatabase;
  app = require('../../server.js');
} catch (err) {
  loadError = err;
}

let isInitialized = false;
let initPromise = null;
let handler = null;

module.exports.handler = async (event, context) => {
  if (loadError) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Module Load Failed: ' + loadError.message,
        stack: loadError.stack
      })
    };
  }

  if (event.path) {
    if (event.path.startsWith('/.netlify/functions/api')) {
      event.path = event.path.replace('/.netlify/functions/api', '/api');
    } else if (event.path.startsWith('/.netlify/functions')) {
      event.path = event.path.replace('/.netlify/functions', '/api');
    }
  }

  try {
    if (!isInitialized) {
      if (!initPromise) {
        initPromise = initDatabase();
      }
      await initPromise;
      handler = serverless(app);
      isInitialized = true;
    }
    return await handler(event, context);
  } catch (err) {
    console.error('[Netlify Function Error]', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Runtime Error: ' + err.message,
        stack: err.stack
      })
    };
  }
};
