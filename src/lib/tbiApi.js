import crypto from 'crypto';

const TBI_API_URL = process.env.TBI_API_URL || 'https://beta.tbibank.support/api';
const TBI_RESELLER_CODE = process.env.TBI_RESELLER_CODE || '';
const TBI_RESELLER_KEY = process.env.TBI_RESELLER_KEY || '';
const TBI_ENCRYPTION_KEY = process.env.TBI_ENCRYPTION_KEY || '';

/**
 * TBI Bank encryption - matches Cryptor.php exactly
 * - cipher: aes-256-ctr
 * - key: SHA256 hash of the encryption key (raw binary)
 * - iv: random 16 bytes, prepended to ciphertext
 * - output: base64
 */
function encryptData(plaintext, key) {
  const keyHash = crypto.createHash('sha256').update(key).digest();
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv('aes-256-ctr', keyHash, iv);
  let encrypted = cipher.update(plaintext, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  const result = Buffer.concat([iv, encrypted]);
  return result.toString('base64');
}

export async function getCalculations(amount = null, categoryId = null) {
  if (!TBI_RESELLER_CODE || !TBI_RESELLER_KEY) {
    throw new Error('TBI_RESELLER_CODE or TBI_RESELLER_KEY is not configured');
  }

  const params = new URLSearchParams();
  params.append('reseller_code', TBI_RESELLER_CODE);
  params.append('reseller_key', TBI_RESELLER_KEY);
  if (amount) params.append('amount', String(amount));
  if (categoryId) params.append('category_id', String(categoryId));

  const url = `${TBI_API_URL}/GetCalculations?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  const text = await response.text();
  console.log('[TBI API] GetCalculations response:', text.substring(0, 500));

  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error(`TBI API returned non-JSON response: ${text.substring(0, 200)}`);
  }

  if (data.error) {
    throw new Error(`TBI API error [${data.error}]: ${data.message || 'Unknown error'}`);
  }

  return data;
}

export async function registerApplication(applicationData) {
  if (!TBI_RESELLER_CODE || !TBI_RESELLER_KEY || !TBI_ENCRYPTION_KEY) {
    throw new Error('TBI credentials are not fully configured');
  }

  const jsonData = JSON.stringify(applicationData);
  const encryptedData = encryptData(jsonData, TBI_ENCRYPTION_KEY);

  const response = await fetch(`${TBI_API_URL}/RegisterApplication`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reseller_code: TBI_RESELLER_CODE,
      reseller_key: TBI_RESELLER_KEY,
      data: encryptedData,
    }),
  });

  const text = await response.text();
  console.log('[TBI API] RegisterApplication response:', text.substring(0, 500));

  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error(`TBI API returned non-JSON response: ${text.substring(0, 200)}`);
  }

  if (data.error && data.error !== 0) {
    throw new Error(`TBI API error [${data.error}]: ${data.message || 'Unknown error'}`);
  }

  return data;
}

export function calculateInstallment(amount, scheme) {
  return (parseFloat(amount) * parseFloat(scheme.installment_factor)).toFixed(2);
}

export function calculateTotalDue(amount, scheme) {
  return (parseFloat(amount) * parseFloat(scheme.total_due_factor)).toFixed(2);
}

export function getResellerCode() {
  return TBI_RESELLER_CODE;
}
