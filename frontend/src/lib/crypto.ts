function b64ToBytes(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

function bytesToB64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

async function importKey(b64Key: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    b64ToBytes(b64Key),
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

// Wire format: base64( 12-byte-nonce || ciphertext || 16-byte-GCM-tag )
export async function encryptPayload(
  b64Key: string,
  body: object
): Promise<string> {
  const key = await importKey(b64Key);
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const plain = new TextEncoder().encode(JSON.stringify(body));
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce },
    key,
    plain
  );
  const out = new Uint8Array(12 + cipher.byteLength);
  out.set(nonce, 0);
  out.set(new Uint8Array(cipher), 12);
  return bytesToB64(out.buffer);
}

export async function decryptPayload(
  b64Key: string,
  b64Data: string
): Promise<unknown> {
  const key = await importKey(b64Key);
  const raw = b64ToBytes(b64Data);
  const nonce = raw.slice(0, 12);
  const cipher = raw.slice(12);
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: nonce },
    key,
    cipher
  );
  return JSON.parse(new TextDecoder().decode(plain));
}
