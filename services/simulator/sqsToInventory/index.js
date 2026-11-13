'use strict';

const http = require('http');
const https = require('https');

const LOG_LEVELS = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getLogLevel = () => {
  const level = (process.env.LOG_LEVEL || 'info').toLowerCase();
  return LOG_LEVELS[level] || LOG_LEVELS.info;
};

const log = (level, message, meta) => {
  const current = getLogLevel();
  const target = LOG_LEVELS[level] || LOG_LEVELS.info;
  if (target < current) return;

  const entry = {
    level,
    message,
    ...(meta ? { meta } : {})
  };

  console.log(JSON.stringify(entry));
};

const normalizeAlbUrl = (raw) => {
  if (!raw) {
    throw new Error('ALB_URL is required');
  }

  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw;
  }

  return `http://${raw}`;
};

const buildTargetUrl = (albUrl) => {
  const base = normalizeAlbUrl(albUrl);
  const url = new URL('/api/supply/stock-events/sqs-inflow', base);
  return url.toString();
};

const postJson = (targetUrl, payload, timeoutMs = 5000) =>
  new Promise((resolve, reject) => {
    const url = new URL(targetUrl);
    const client = url.protocol === 'https:' ? https : http;
    const body = JSON.stringify(payload);

    const options = {
      method: 'POST',
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: `${url.pathname}${url.search}`,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const request = client.request(options, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        resolve({
          statusCode: response.statusCode || 0,
          body: data
        });
      });
    });

    request.on('error', reject);
    request.setTimeout(timeoutMs, () => {
      request.destroy(new Error('Request timed out'));
    });

    request.write(body);
    request.end();
  });

const postJsonWithRetry = async (targetUrl, payload) => {
  let lastError = null;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      return await postJson(targetUrl, payload);
    } catch (err) {
      lastError = err;
      log('warn', 'HTTP request failed, retrying if possible', {
        attempt,
        error: err.message
      });
      await sleep(200);
    }
  }
  throw lastError;
};

exports.handler = async (event) => {
  const records = event && Array.isArray(event.Records) ? event.Records : null;

  if (!records) {
    log('error', 'Invalid SQS event: Records missing');
    return {
      statusCode: 400,
      batchItemFailures: [],
      body: JSON.stringify({
        ok: false,
        error: 'Invalid SQS event: Records missing'
      })
    };
  }

  const albUrl = process.env.ALB_URL;
  const targetUrl = buildTargetUrl(albUrl);

  log('info', 'Forwarding SQS payload to inventory service', {
    recordCount: records.length,
    targetUrl
  });

  try {
    const response = await postJsonWithRetry(targetUrl, event);
    const ok = response.statusCode >= 200 && response.statusCode < 300;

    if (!ok) {
      throw new Error(`Inventory service responded with status ${response.statusCode}`);
    }

    log('info', 'Inventory service processed inflow', {
      statusCode: response.statusCode,
      recordCount: records.length
    });

    return {
      statusCode: 200,
      batchItemFailures: [],
      body: JSON.stringify({
        ok: true,
        forwarded: records.length,
        targetUrl,
        inventoryStatusCode: response.statusCode,
        inventoryResponse: response.body
      })
    };
  } catch (err) {
    log('error', 'Failed to forward inflow to inventory service', {
      error: err.message,
      recordCount: records.length
    });

    const failures = records.map((record) => ({
      itemIdentifier: record.messageId || 'unknown'
    }));

    return {
      statusCode: 502,
      batchItemFailures: failures,
      body: JSON.stringify({
        ok: false,
        error: err.message,
        targetUrl,
        recordCount: records.length
      })
    };
  }
};
