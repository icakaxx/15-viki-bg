import crypto from 'crypto';
import https from 'https';

const DSK_API_URL = process.env.DSK_API_URL || 'https://merchantsonline.dskbank.bg/api/index.php';
const DSK_UNICID = process.env.DSK_UNICID || '';
const DSK_PUBLIC_CERT_PEM = process.env.DSK_PUBLIC_CERT_PEM || '';

const DSK_ERROR_CODES = {
  100: 'REQUEST_METHOD_NOT_VALID',
  101: 'REQUEST_CONTENTTYPE_NOT_VALID',
  102: 'REQUEST_NOT_VALID',
  103: 'VALIDATE_PARAMETER_REQUIRED',
  104: 'VALIDATE_PARAMETER_DATATYPE',
  105: 'API_NAME_REQUIRED',
  106: 'API_PARAM_REQUIRED',
  107: 'API_DOST_NOT_EXIST',
  108: 'INVALID_USER_PASS',
  109: 'PRIVATE_KEY_FAILED',
  200: 'SUCCESS_RESPONSE',
};

let cachedPublicKeyPem = null;

function normalizePem(pem) {
  if (!pem || typeof pem !== 'string') return '';
  let s = pem.trim();
  // .env truncates at first newline; use single-line with literal \n and convert here
  if (s.includes('\\n')) {
    s = s.replace(/\\n/g, '\n');
  }
  s = s.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  s = s.trim();
  if (!s.includes('-----END')) {
    throw new Error('DSK_PUBLIC_CERT_PEM is incomplete (env truncated at newline). Use one line with \\n for newlines.');
  }
  return s;
}

function loadPublicKeyPem() {
  if (cachedPublicKeyPem) return cachedPublicKeyPem;

  const pem = normalizePem(DSK_PUBLIC_CERT_PEM);
  if (!pem) {
    throw new Error('DSK_PUBLIC_CERT_PEM environment variable is not configured');
  }

  cachedPublicKeyPem = pem;
  return cachedPublicKeyPem;
}

function encryptChunked(plaintext) {
  const publicKeyPem = loadPublicKeyPem();
  // DSK currently provides a 2048‑bit RSA public key (256 bytes modulus).
  // With PKCS#1 v1.5 padding, the maximum chunk size is keySize - 11.
  const modulusBytes = 256;
  const chunkSize = modulusBytes - 11;

  const inputBuffer = Buffer.from(plaintext, 'utf8');
  const chunks = [];

  for (let i = 0; i < inputBuffer.length; i += chunkSize) {
    const chunk = inputBuffer.subarray(i, i + chunkSize);
    const encrypted = crypto.publicEncrypt(
      { key: publicKeyPem, padding: crypto.constants.RSA_PKCS1_PADDING },
      chunk
    );
    chunks.push(encrypted);
  }

  return Buffer.concat(chunks).toString('base64');
}

const DSK_REQUEST_TIMEOUT_MS = 20000; // 20 seconds

function httpPost(url, jsonBody) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const data = Buffer.from(jsonBody, 'utf8');

    const options = {
      hostname: parsed.hostname,
      port: 443,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'cache-control': 'no-cache',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        clearTimeout(timeout);
        resolve(body);
      });
    });

    req.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    const timeout = setTimeout(() => {
      req.destroy();
      reject(new Error('DSK API timeout'));
    }, DSK_REQUEST_TIMEOUT_MS);

    req.write(data);
    req.end();
  });
}

export async function callDskApi(functionName, params) {
  if (!DSK_UNICID) {
    throw new Error('DSK_UNICID environment variable is not configured');
  }

  const fullPayload = {
    name: functionName,
    param: { unicid: DSK_UNICID, ...params },
  };

  const plaintext = JSON.stringify(fullPayload);
  const encrypted = encryptChunked(plaintext);

  const requestBody = JSON.stringify({ data: encrypted });

  const responseText = await httpPost(DSK_API_URL, requestBody);
  console.log('[DSK API] Response:', responseText.substring(0, 500));

  let json;
  try {
    json = JSON.parse(responseText);
  } catch (e) {
    throw new Error(`DSK API returned non-JSON response: ${responseText.substring(0, 500)}`);
  }

  if (json.error) {
    const errStatus = json.error.status || 'unknown';
    const errMsg = json.error.message || DSK_ERROR_CODES[parseInt(errStatus)] || 'Unknown error';
    throw new Error(`DSK API error [${errStatus}]: ${errMsg}`);
  }

  if (!json.data) {
    throw new Error(`Invalid DSK API response format: ${JSON.stringify(json).substring(0, 500)}`);
  }

  const status = String(json.data.status);
  if (status !== '200') {
    const errorName = DSK_ERROR_CODES[parseInt(status)] || 'UNKNOWN_ERROR';
    throw new Error(`DSK API error [${status}]: ${errorName}`);
  }

  return json.data.result;
}

export function getUnicid() {
  return DSK_UNICID;
}
