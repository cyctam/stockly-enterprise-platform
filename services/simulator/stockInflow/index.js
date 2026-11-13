'use strict';

const { defaultMaterialPool } = require('../libs/materialPool');

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

const parseMaterialPool = () => {
  const raw = process.env.MATERIAL_POOL;
  if (!raw) return defaultMaterialPool;

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    log('warn', 'Failed to parse MATERIAL_POOL, using default material pool', {
      error: err.message
    });
  }
  return defaultMaterialPool;
};

const randomInt = (min, max) => {
  const clampedMin = Math.ceil(min);
  const clampedMax = Math.floor(max);
  return Math.floor(Math.random() * (clampedMax - clampedMin + 1)) + clampedMin;
};

const pickMaterials = (pool, count) => {
  const selections = [];
  const available = [...pool];
  for (let i = 0; i < count && available.length > 0; i += 1) {
    const idx = randomInt(0, available.length - 1);
    selections.push(available.splice(idx, 1)[0]);
  }
  return selections;
};

const generateEvent = (material, source) => {
  const quantity = randomInt(material.minQty || 1, material.maxQty || 10);
  return {
    materialId: material.materialId,
    materialName: material.materialName,
    quantity,
    source,
    note: 'Scheduled replenishment',
    timestamp: new Date().toISOString()
  };
};

const resolveSource = () => {
  const sources = ['Scheduled Delivery', 'Supplier Shipment'];
  return sources[randomInt(0, sources.length - 1)];
};

const resolveBatchSize = () => {
  // Keep the demo simple: 1 to 3 arrivals per run.
  return randomInt(1, 3);
};

const loadSqsClient = () => {
  // Prefer /opt for layering. Fall back to the runtime SDK if not present.
  try {
    // eslint-disable-next-line global-require, import/no-unresolved
    const { SQSClient } = require('/opt/nodejs/node_modules/@aws-sdk/client-sqs');
    return { SQSClient, from: 'layer' };
  } catch (err) {
    // eslint-disable-next-line global-require
    const AWS = require('aws-sdk');
    return { SQSClient: AWS.SQS, from: 'runtime' };
  }
};

const sendToSqs = async (queueUrl, eventPayloads) => {
  const { SQSClient, from } = loadSqsClient();

  log('debug', 'Initialized SQS client', { source: from });

  // Normalize to a common interface for SDK v2 or v3.
  const isV3 = SQSClient.name === 'SQSClient';
  const client = isV3 ? new SQSClient({}) : new SQSClient();

  const results = [];

  for (const payload of eventPayloads) {
    const messageBody = JSON.stringify(payload);
    const params = {
      QueueUrl: queueUrl,
      MessageBody: messageBody
    };

    let lastError = null;
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        if (isV3) {
          // eslint-disable-next-line global-require, import/no-unresolved
          const { SendMessageCommand } = require('/opt/nodejs/node_modules/@aws-sdk/client-sqs');
          const response = await client.send(new SendMessageCommand(params));
          results.push({ payload, messageId: response.MessageId });
        } else {
          const response = await client.sendMessage(params).promise();
          results.push({ payload, messageId: response.MessageId });
        }
        lastError = null;
        break;
      } catch (err) {
        lastError = err;
        log('warn', 'SQS send failed, retrying if possible', {
          attempt,
          error: err.message
        });
        await sleep(200);
      }
    }

    if (lastError) {
      throw lastError;
    }
  }

  return results;
};

exports.handler = async (event) => {
  const pool = parseMaterialPool();
  const batchSize = resolveBatchSize();
  const selectedMaterials = pickMaterials(pool, batchSize);
  const source = resolveSource();

  const inflowEvents = selectedMaterials.map((material) =>
    generateEvent(material, source)
  );

  log('info', 'Generated stock inflow events', {
    count: inflowEvents.length,
    source
  });

  const useSqs = (process.env.USE_SQS || 'false').toLowerCase() === 'true';
  const queueUrl = process.env.SQS_QUEUE_URL;

  try {
    let dispatchResult = null;

    if (useSqs) {
      if (!queueUrl) {
        throw new Error('USE_SQS is true but SQS_QUEUE_URL is missing');
      }
      dispatchResult = await sendToSqs(queueUrl, inflowEvents);
      log('info', 'Dispatched inflow events to SQS', {
        count: dispatchResult.length
      });
    } else {
      log('info', 'USE_SQS is false, emitting inflow events to logs only', {
        events: inflowEvents
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        dispatched: useSqs,
        inflowCount: inflowEvents.length,
        inflowEvents,
        dispatchResult
      })
    };
  } catch (err) {
    log('error', 'Failed to dispatch stock inflow events', {
      error: err.message
    });

    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        error: err.message,
        inflowCount: inflowEvents.length,
        inflowEvents
      })
    };
  }
};
