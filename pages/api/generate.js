export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const API_KEY = 'eda6c818d9414488b4e2ed131588ee76.Nbz9ez0AFxIpJWgr';
  const API_URL = 'https://open.bigmodel.cn/api/paas/v4/images/generations';
  
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': API_KEY,
        'X-Time': timestamp.toString(),
        'X-Sign': await generateSignature(API_KEY, timestamp)
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function generateSignature(apiKey, timestamp) {
  const [key, secret] = apiKey.split('.');
  const message = key + timestamp;
  
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    messageData
  );
  
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}  
