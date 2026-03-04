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

let cachedPublicKey = null;

function loadPublicKey() {
  if (cachedPublicKey) return cachedPublicKey;

  if (!DSK_PUBLIC_CERT_PEM) {
    throw new Error('DSK_PUBLIC_CERT_PEM environment variable is not configured');
  }

  // Support both multiline PEMs and single-line with literal "\n"
  cachedPublicKey = DSK_PUBLIC_CERT_PEM.includes('\\n')
    ? DSK_PUBLIC_CERT_PEM.replace(/\\n/g, '\n')
    : DSK_PUBLIC_CERT_PEM;
  return cachedPublicKey;
}

function encryptChunked(plaintext) {
  const publicKeyPem = loadPublicKey();
  const publicKey = crypto.createPublicKey(publicKeyPem);
  const jwk = publicKey.export({ format: 'jwk' });
  const modulusBytes = Buffer.from(jwk.n, 'base64url').length;
  const chunkSize = modulusBytes - 11;

  const inputBuffer = Buffer.from(plaintext, 'utf8');
  const chunks = [];

  for (let i = 0; i < inputBuffer.length; i += chunkSize) {
    const chunk = inputBuffer.subarray(i, i + chunkSize);
    const encrypted = crypto.publicEncrypt(
      { key: publicKey, padding: crypto.constants.RSA_PKCS1_PADDING },
      chunk
    );
    chunks.push(encrypted);
  }

  return Buffer.concat(chunks).toString('base64');
}

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
      res.on('end', () => resolve(body));
    });

    req.on('error', reject);
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
