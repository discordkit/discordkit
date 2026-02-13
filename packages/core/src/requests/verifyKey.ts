/**
 * Get the SubtleCrypto interface for the current environment
 */
const getSubtleCrypto = (): SubtleCrypto => {
  // Node.js environment
  if (typeof globalThis.crypto !== `undefined`) {
    return globalThis.crypto.subtle;
  }

  // Older Node.js versions
  if (typeof global !== `undefined` && (global as any).crypto?.subtle) {
    return (global as any).crypto.subtle;
  }

  // Browser environment
  if (typeof window !== `undefined` && window.crypto?.subtle) {
    return window.crypto.subtle;
  }

  throw new Error(`SubtleCrypto is not available in this environment`);
};

const subtleCrypto = getSubtleCrypto();

/**
 * Convert various input types to Uint8Array
 */
function valueToUint8Array(
  value: Uint8Array | ArrayBuffer | Buffer | string,
  encoding?: `hex` | `utf-8`
): Uint8Array {
  // Already a Uint8Array
  if (value instanceof Uint8Array) {
    return value;
  }

  // ArrayBuffer
  if (value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  }

  // Buffer (Node.js)
  if (typeof Buffer !== `undefined` && Buffer.isBuffer(value)) {
    return new Uint8Array(value);
  }

  // String
  if (typeof value === `string`) {
    if (encoding === `hex`) {
      // Convert hex string to Uint8Array
      const matches = value.match(/.{1,2}/g);
      if (!matches) {
        throw new Error(`Invalid hex string`);
      }
      return new Uint8Array(matches.map((byte) => parseInt(byte, 16)));
    }

    // Default to UTF-8 encoding
    const encoder = new TextEncoder();
    return encoder.encode(value);
  }

  throw new Error(`Unsupported value type`);
}

/**
 * Concatenate multiple Uint8Arrays into a single Uint8Array
 */
function concatUint8Arrays(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);

  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }

  return result;
}

/**
 * Validates a payload from Discord against its signature and key.
 *
 * @param rawBody - The raw payload data
 * @param signature - The signature from the `X-Signature-Ed25519` header
 * @param timestamp - The timestamp from the `X-Signature-Timestamp` header
 * @param clientPublicKey - The public key from the Discord developer dashboard
 * @returns Whether or not validation was successful
 */
export async function verifyKey(
  rawBody: Uint8Array | ArrayBuffer | Buffer | string,
  signature: string,
  timestamp: string,
  clientPublicKey: string | CryptoKey
): Promise<boolean> {
  try {
    return await subtleCrypto.verify(
      {
        name: `ed25519`
      } as AlgorithmIdentifier,
      typeof clientPublicKey === `string`
        ? await subtleCrypto.importKey(
            `raw`,
            Buffer.from(valueToUint8Array(clientPublicKey, `hex`)),
            {
              name: `ed25519`,
              namedCurve: `ed25519`
            } as EcKeyImportParams, // Type assertion for Ed25519
            false,
            [`verify`]
          )
        : clientPublicKey,
      Buffer.from(valueToUint8Array(signature, `hex`)),
      Buffer.from(
        concatUint8Arrays(
          valueToUint8Array(timestamp),
          valueToUint8Array(rawBody)
        )
      )
    );
  } catch (err) {
    console.error(`Signature verification failed:`, err);
    return false;
  }
}
