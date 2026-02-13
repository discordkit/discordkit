import { verifyKey } from "../verifyKey.js";

describe(`verifyKey`, () => {
  let testPublicKeyHex: string;
  let testPrivateKey: CryptoKey;
  let testPublicKey: CryptoKey;

  /**
   * Generate a test keypair before all tests
   */
  beforeAll(async () => {
    const keypair = await crypto.subtle.generateKey(
      {
        name: `Ed25519`,
        namedCurve: `Ed25519`
      } as EcKeyGenParams,
      true,
      [`sign`, `verify`]
    );

    testPrivateKey = keypair.privateKey;
    testPublicKey = keypair.publicKey;

    // Export public key as hex string
    const publicKeyBuffer = await crypto.subtle.exportKey(
      `raw`,
      keypair.publicKey
    );
    testPublicKeyHex = Buffer.from(publicKeyBuffer).toString(`hex`);
  });

  /**
   * Helper to create a valid signature for testing
   */
  const createValidSignature = async (
    body: string,
    timestamp: string
  ): Promise<string> => {
    const message = Buffer.concat([
      Buffer.from(timestamp, `utf-8`),
      Buffer.from(body, `utf-8`)
    ]);

    const signature = await crypto.subtle.sign(
      { name: `Ed25519` } as AlgorithmIdentifier,
      testPrivateKey,
      message
    );

    return Buffer.from(signature).toString(`hex`);
  };

  describe(`valid signatures`, () => {
    it(`validates a correct signature with string body`, async () => {
      const body = `{"type":1}`;
      const timestamp = `1234567890`;
      const signature = await createValidSignature(body, timestamp);

      const result = await verifyKey(
        body,
        signature,
        timestamp,
        testPublicKeyHex
      );

      expect(result).toBe(true);
    });

    it(`validates a correct signature with Uint8Array body`, async () => {
      const body = `{"type":1}`;
      const timestamp = `1234567890`;
      const signature = await createValidSignature(body, timestamp);
      const bodyArray = new TextEncoder().encode(body);

      const result = await verifyKey(
        bodyArray,
        signature,
        timestamp,
        testPublicKeyHex
      );

      expect(result).toBe(true);
    });

    it(`validates a correct signature with Buffer body`, async () => {
      const body = `{"type":1}`;
      const timestamp = `1234567890`;
      const signature = await createValidSignature(body, timestamp);
      const bodyBuffer = Buffer.from(body, `utf-8`);

      const result = await verifyKey(
        bodyBuffer,
        signature,
        timestamp,
        testPublicKeyHex
      );

      expect(result).toBe(true);
    });

    it(`validates a correct signature with ArrayBuffer body`, async () => {
      const body = `{"type":1}`;
      const timestamp = `1234567890`;
      const signature = await createValidSignature(body, timestamp);
      const bodyArray = new TextEncoder().encode(body);
      const arrayBuffer = bodyArray.buffer;

      const result = await verifyKey(
        arrayBuffer,
        signature,
        timestamp,
        testPublicKeyHex
      );

      expect(result).toBe(true);
    });

    it(`validates with a pre-imported CryptoKey`, async () => {
      const body = `{"type":1}`;
      const timestamp = `1234567890`;
      const signature = await createValidSignature(body, timestamp);

      const result = await verifyKey(body, signature, timestamp, testPublicKey);

      expect(result).toBe(true);
    });

    it(`validates complex JSON payloads`, async () => {
      const body = JSON.stringify({
        type: 2,
        data: {
          id: `123456789`,
          name: `test-command`,
          options: [
            { name: `option1`, value: `value1` },
            { name: `option2`, value: `value2` }
          ]
        }
      });
      const timestamp = `1234567890`;
      const signature = await createValidSignature(body, timestamp);

      const result = await verifyKey(
        body,
        signature,
        timestamp,
        testPublicKeyHex
      );

      expect(result).toBe(true);
    });

    it(`validates empty body`, async () => {
      const body = ``;
      const timestamp = `1234567890`;
      const signature = await createValidSignature(body, timestamp);

      const result = await verifyKey(
        body,
        signature,
        timestamp,
        testPublicKeyHex
      );

      expect(result).toBe(true);
    });

    it(`validates with special characters in body`, async () => {
      const body = `{"message":"Hello 世界! 🌍 Special chars: <>&\\"'"}`;
      const timestamp = `1234567890`;
      const signature = await createValidSignature(body, timestamp);

      const result = await verifyKey(
        body,
        signature,
        timestamp,
        testPublicKeyHex
      );

      expect(result).toBe(true);
    });
  });

  describe(`invalid signatures`, () => {
    it(`rejects incorrect signature`, async () => {
      const body = `{"type":1}`;
      const timestamp = `1234567890`;
      const signature = `a`.repeat(128); // Invalid signature (wrong hex)

      const result = await verifyKey(
        body,
        signature,
        timestamp,
        testPublicKeyHex
      );

      expect(result).toBe(false);
    });

    it(`rejects when body is tampered`, async () => {
      const body = `{"type":1}`;
      const timestamp = `1234567890`;
      const signature = await createValidSignature(body, timestamp);

      // Tamper with the body
      const tamperedBody = `{"type":2}`;

      const result = await verifyKey(
        tamperedBody,
        signature,
        timestamp,
        testPublicKeyHex
      );

      expect(result).toBe(false);
    });

    it(`rejects when timestamp is tampered`, async () => {
      const body = `{"type":1}`;
      const timestamp = `1234567890`;
      const signature = await createValidSignature(body, timestamp);

      // Tamper with the timestamp
      const tamperedTimestamp = `9876543210`;

      const result = await verifyKey(
        body,
        signature,
        tamperedTimestamp,
        testPublicKeyHex
      );

      expect(result).toBe(false);
    });

    it(`rejects with wrong public key`, async () => {
      const body = `{"type":1}`;
      const timestamp = `1234567890`;
      const signature = await createValidSignature(body, timestamp);

      // Generate a different keypair
      const wrongKeypair = await crypto.subtle.generateKey(
        {
          name: `Ed25519`,
          namedCurve: `Ed25519`
        } as EcKeyGenParams,
        true,
        [`sign`, `verify`]
      );
      const wrongPublicKeyBuffer = await crypto.subtle.exportKey(
        `raw`,
        wrongKeypair.publicKey
      );
      const wrongPublicKeyHex =
        Buffer.from(wrongPublicKeyBuffer).toString(`hex`);

      const result = await verifyKey(
        body,
        signature,
        timestamp,
        wrongPublicKeyHex
      );

      expect(result).toBe(false);
    });

    it(`rejects signature with invalid hex characters`, async () => {
      const body = `{"type":1}`;
      const timestamp = `1234567890`;
      const signature = `ZZZZZZ`; // Invalid hex

      const result = await verifyKey(
        body,
        signature,
        timestamp,
        testPublicKeyHex
      );

      expect(result).toBe(false);
    });

    it(`rejects signature with wrong length`, async () => {
      const body = `{"type":1}`;
      const timestamp = `1234567890`;
      const signature = `abcd1234`; // Too short

      const result = await verifyKey(
        body,
        signature,
        timestamp,
        testPublicKeyHex
      );

      expect(result).toBe(false);
    });

    it(`rejects public key with invalid hex`, async () => {
      const body = `{"type":1}`;
      const timestamp = `1234567890`;
      const signature = await createValidSignature(body, timestamp);
      const invalidPublicKey = `INVALID_HEX_KEY`;

      const result = await verifyKey(
        body,
        signature,
        timestamp,
        invalidPublicKey
      );

      expect(result).toBe(false);
    });

    it(`rejects public key with wrong length`, async () => {
      const body = `{"type":1}`;
      const timestamp = `1234567890`;
      const signature = await createValidSignature(body, timestamp);
      const shortPublicKey = `abcd1234`;

      const result = await verifyKey(
        body,
        signature,
        timestamp,
        shortPublicKey
      );

      expect(result).toBe(false);
    });
  });

  describe(`edge cases`, () => {
    it(`handles very long timestamps`, async () => {
      const body = `{"type":1}`;
      const timestamp = `9`.repeat(100);
      const signature = await createValidSignature(body, timestamp);

      const result = await verifyKey(
        body,
        signature,
        timestamp,
        testPublicKeyHex
      );

      expect(result).toBe(true);
    });

    it(`handles very large payloads`, async () => {
      const body = JSON.stringify({
        type: 2,
        data: `x`.repeat(10000)
      });
      const timestamp = `1234567890`;
      const signature = await createValidSignature(body, timestamp);

      const result = await verifyKey(
        body,
        signature,
        timestamp,
        testPublicKeyHex
      );

      expect(result).toBe(true);
    });

    it(`handles Unicode in timestamp (though unlikely)`, async () => {
      const body = `{"type":1}`;
      const timestamp = `timestamp-世界`;
      const signature = await createValidSignature(body, timestamp);

      const result = await verifyKey(
        body,
        signature,
        timestamp,
        testPublicKeyHex
      );

      expect(result).toBe(true);
    });

    it(`returns false for completely malformed signature`, async () => {
      const body = `{"type":1}`;
      const timestamp = `1234567890`;
      const signature = ``;

      const result = await verifyKey(
        body,
        signature,
        timestamp,
        testPublicKeyHex
      );

      expect(result).toBe(false);
    });
  });

  describe(`real-world Discord examples`, () => {
    it(`validates a PING interaction`, async () => {
      const body = JSON.stringify({
        type: 1,
        version: 1
      });
      const timestamp = String(Date.now());
      const signature = await createValidSignature(body, timestamp);

      const result = await verifyKey(
        body,
        signature,
        timestamp,
        testPublicKeyHex
      );

      expect(result).toBe(true);
    });

    it(`validates an APPLICATION_COMMAND interaction`, async () => {
      const body = JSON.stringify({
        type: 2,
        token: `interaction_token`,
        id: `123456789012345678`,
        application_id: `987654321098765432`,
        data: {
          id: `111111111111111111`,
          name: `greet`,
          type: 1,
          options: [
            {
              name: `user`,
              type: 6,
              value: `222222222222222222`
            }
          ]
        },
        guild_id: `333333333333333333`,
        channel_id: `444444444444444444`,
        member: {
          user: {
            id: `555555555555555555`,
            username: `testuser`,
            discriminator: `0001`
          }
        }
      });
      const timestamp = String(Date.now());
      const signature = await createValidSignature(body, timestamp);

      const result = await verifyKey(
        body,
        signature,
        timestamp,
        testPublicKeyHex
      );

      expect(result).toBe(true);
    });

    it(`validates a MESSAGE_COMPONENT interaction`, async () => {
      const body = JSON.stringify({
        type: 3,
        data: {
          custom_id: `button_click`,
          component_type: 2
        },
        message: {
          id: `666666666666666666`
        }
      });
      const timestamp = String(Date.now());
      const signature = await createValidSignature(body, timestamp);

      const result = await verifyKey(
        body,
        signature,
        timestamp,
        testPublicKeyHex
      );

      expect(result).toBe(true);
    });
  });

  describe(`concurrent verification`, () => {
    it(`handles multiple concurrent verifications`, async () => {
      const requests = await Promise.all(
        Array.from({ length: 10 }, async (_, i) => {
          const body = `{"type":${i}}`;
          const timestamp = `${1234567890 + i}`;
          const signature = await createValidSignature(body, timestamp);
          return { body, timestamp, signature };
        })
      );

      const results = await Promise.all(
        requests.map(async ({ body, timestamp, signature }) =>
          verifyKey(body, signature, timestamp, testPublicKeyHex)
        )
      );

      expect(results.every((r) => r)).toBe(true);
    });

    it(`handles mixed valid and invalid signatures concurrently`, async () => {
      const validBody = `{"type":1}`;
      const validTimestamp = `1234567890`;
      const validSignature = await createValidSignature(
        validBody,
        validTimestamp
      );

      const requests = [
        verifyKey(validBody, validSignature, validTimestamp, testPublicKeyHex), // valid
        verifyKey(validBody, `a`.repeat(128), validTimestamp, testPublicKeyHex), // invalid sig
        verifyKey(
          `{"type":2}`,
          validSignature,
          validTimestamp,
          testPublicKeyHex
        ), // tampered body
        verifyKey(validBody, validSignature, validTimestamp, testPublicKeyHex) // valid
      ];

      const results = await Promise.all(requests);

      expect(results).toEqual([true, false, false, true]);
    });
  });

  describe(`type conversions`, () => {
    it(`validates with all supported body types producing same result`, async () => {
      const bodyString = `{"type":1}`;
      const timestamp = `1234567890`;
      const signature = await createValidSignature(bodyString, timestamp);

      const bodyUint8Array = new TextEncoder().encode(bodyString);
      const bodyBuffer = Buffer.from(bodyString, `utf-8`);
      const bodyArrayBuffer = bodyUint8Array.buffer;

      const results = await Promise.all([
        verifyKey(bodyString, signature, timestamp, testPublicKeyHex),
        verifyKey(bodyUint8Array, signature, timestamp, testPublicKeyHex),
        verifyKey(bodyBuffer, signature, timestamp, testPublicKeyHex),
        verifyKey(bodyArrayBuffer, signature, timestamp, testPublicKeyHex)
      ]);

      expect(results).toEqual([true, true, true, true]);
    });
  });
});
