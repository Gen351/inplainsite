import CryptoJS from 'https://esm.sh/crypto-js@4.2.0';

/**
 * Encrypts data using AES-256 driven by two distinct input strings
 * @param {string} plaintext - The message to hide (Max 20,000 chars)
 * @param {string} cipher - First key (e.g., Table Identifier)
 * @param {string} key - Second key (e.g., Ciphertext Passcode)
 * @returns {string} Clean Base64 ciphertext for Google Sheets
 */
export async function secureTwoKeyEncrypt(plaintext, cipher, key) {
  // 1. Package validation tag
  const packedData = plaintext + "_SUCCESS_";

  // 2. Use String B as a salt to derive a hardened key from String A
  // This binds BOTH keys structurally to the resulting cryptographic bits
  const salt = CryptoJS.enc.Utf8.parse(key);
  const derivedKey = CryptoJS.PBKDF2(cipher, salt, {
    keySize: 256 / 32,
    iterations: 1000 // Balances browser performance with brute-force protection
  });

  // 3. Encrypt using AES-256 with the dual-derived key
  const iv = CryptoJS.lib.WordArray.random(128 / 8); // Random initialization vector
  const encrypted = CryptoJS.AES.encrypt(packedData, derivedKey, { iv: iv });

  // 4. Package IV and Ciphertext together so it can be decrypted later
  const compositePayload = iv.toString() + ":" + encrypted.toString();
  
  // Convert to clean Base64 string for the Sheet cell
  return btoa(compositePayload);
}

/**
 * Decrypts AES-256 payload using two input strings
 * @param {string} base64Ciphertext - Raw string pulled from Google Sheets
 * @returns {object} { success: boolean, decryptedText: string }
 */
export async function secureTwoKeyDecrypt(base64Ciphertext, cipher, key) {
  try {
    // 1. Unpack the Base64 payload
    const compositePayload = atob(base64Ciphertext);
    const [ivHex, ciphertext] = compositePayload.split(":");
    
    const iv = CryptoJS.enc.Hex.parse(ivHex);

    // 2. Re-derive the exact same key using the user's two-string guess
    const salt = CryptoJS.enc.Utf8.parse(key);
    const derivedKey = CryptoJS.PBKDF2(cipher, salt, {
      keySize: 256 / 32,
      iterations: 1000
    });

    // 3. Run AES Decryption
    const decryptedBytes = CryptoJS.AES.decrypt(ciphertext, derivedKey, { iv: iv });
    const rawPlaintext = decryptedBytes.toString(CryptoJS.enc.Utf8);

    // 4. Run Success-Tag check
    if (!rawPlaintext || !rawPlaintext.endsWith("_SUCCESS_")) {
      return { success: false, decryptedText: "Obfuscated data: Invalid key combination." };
    }

    return { success: true, decryptedText: rawPlaintext.replace("_SUCCESS_", "") };
  } catch (error) {
    return { success: false, decryptedText: "Obfuscated data: Invalid key combination." };
  }
}