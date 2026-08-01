import { useState } from "react";
import usePageMeta from "../../../utils/usePageMeta";
import "./EncryptDecrypt.css";

const EncryptDecrypt = () => {
  usePageMeta({
    title: "Encrypt/Decrypt Text",
    description: "Encrypt and decrypt text online with various algorithms and password protection.",
  });
  const [inputText, setInputText] = useState("");
  const [password, setPassword] = useState("");
  const [outputText, setOutputText] = useState("");
  const [algorithm, setAlgorithm] = useState("base64");
  const [mode, setMode] = useState("encrypt");
  const [status, setStatus] = useState("");

  // Base64 Encoding/Decoding
  const base64Encode = (text) => {
    return btoa(unescape(encodeURIComponent(text)));
  };

  const base64Decode = (text) => {
    try {
      return decodeURIComponent(escape(atob(text)));
    } catch (e) {
      throw new Error("Invalid Base64 string");
    }
  };

  // Caesar Cipher (Shift cipher)
  const caesarEncrypt = (text, shift = 3) => {
    return text
      .split("")
      .map((char) => {
        if (char.match(/[a-z]/i)) {
          const code = char.charCodeAt(0);
          const base = code >= 65 && code <= 90 ? 65 : 97;
          return String.fromCharCode(((code - base + shift) % 26) + base);
        }
        return char;
      })
      .join("");
  };

  const caesarDecrypt = (text, shift = 3) => {
    return caesarEncrypt(text, 26 - shift);
  };

  // Simple XOR Cipher with password
  const xorEncryptDecrypt = (text, key) => {
    if (!key) throw new Error("Password is required for XOR encryption");
    let result = "";
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^ key.charCodeAt(i % key.length),
      );
    }
    return base64Encode(result);
  };

  const xorDecrypt = (text, key) => {
    if (!key) throw new Error("Password is required for XOR decryption");
    try {
      const decoded = base64Decode(text);
      let result = "";
      for (let i = 0; i < decoded.length; i++) {
        result += String.fromCharCode(
          decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length),
        );
      }
      return result;
    } catch (e) {
      throw new Error("Invalid encrypted text or wrong password");
    }
  };

  // ROT13
  const rot13 = (text) => {
    return text.replace(/[a-zA-Z]/g, (char) => {
      const start = char <= "Z" ? 65 : 97;
      return String.fromCharCode(
        start + ((char.charCodeAt(0) - start + 13) % 26),
      );
    });
  };

  // Reverse Text
  const reverseText = (text) => {
    return text.split("").reverse().join("");
  };

  // Atbash Cipher
  const atbash = (text) => {
    return text
      .split("")
      .map((char) => {
        if (char.match(/[a-z]/i)) {
          const code = char.charCodeAt(0);
          const base = code >= 65 && code <= 90 ? 65 : 97;
          return String.fromCharCode(base + (25 - (code - base)));
        }
        return char;
      })
      .join("");
  };

  // Binary Encoding/Decoding
  const binaryEncode = (text) => {
    return text
      .split("")
      .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
      .join(" ");
  };

  const binaryDecode = (text) => {
    try {
      return text
        .split(" ")
        .map((bin) => String.fromCharCode(parseInt(bin, 2)))
        .join("");
    } catch (e) {
      throw new Error("Invalid binary string");
    }
  };

  // Hexadecimal Encoding/Decoding
  const hexEncode = (text) => {
    return text
      .split("")
      .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
      .join(" ");
  };

  const hexDecode = (text) => {
    try {
      return text
        .split(" ")
        .map((hex) => String.fromCharCode(parseInt(hex, 16)))
        .join("");
    } catch (e) {
      throw new Error("Invalid hexadecimal string");
    }
  };

  // Morse Code
  const morseCode = {
    A: ".-",
    B: "-...",
    C: "-.-.",
    D: "-..",
    E: ".",
    F: "..-.",
    G: "--.",
    H: "....",
    I: "..",
    J: ".---",
    K: "-.-",
    L: ".-..",
    M: "--",
    N: "-.",
    O: "---",
    P: ".--.",
    Q: "--.-",
    R: ".-.",
    S: "...",
    T: "-",
    U: "..-",
    V: "...-",
    W: ".--",
    X: "-..-",
    Y: "-.--",
    Z: "--..",
    0: "-----",
    1: ".----",
    2: "..---",
    3: "...--",
    4: "....-",
    5: ".....",
    6: "-....",
    7: "--...",
    8: "---..",
    9: "----.",
    " ": "/",
  };

  const morseEncode = (text) => {
    return text
      .toUpperCase()
      .split("")
      .map((char) => morseCode[char] || char)
      .join(" ");
  };

  const morseDecode = (text) => {
    const reverseMorse = Object.fromEntries(
      Object.entries(morseCode).map(([k, v]) => [v, k]),
    );
    return text
      .split(" ")
      .map((code) => reverseMorse[code] || "")
      .join("");
  };

  // URL Encoding/Decoding
  const urlEncode = (text) => {
    return encodeURIComponent(text);
  };

  const urlDecode = (text) => {
    try {
      return decodeURIComponent(text);
    } catch (e) {
      throw new Error("Invalid URL encoded string");
    }
  };

  // ASCII Values
  const asciiEncode = (text) => {
    return text
      .split("")
      .map((char) => char.charCodeAt(0))
      .join(" ");
  };

  const asciiDecode = (text) => {
    try {
      return text
        .split(" ")
        .map((code) => String.fromCharCode(parseInt(code)))
        .join("");
    } catch (e) {
      throw new Error("Invalid ASCII codes");
    }
  };

  // Vigenere Cipher
  const vigenereEncrypt = (text, key) => {
    if (!key) throw new Error("Password is required for Vigenere cipher");
    key = key.toUpperCase();
    let result = "";
    let keyIndex = 0;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char.match(/[a-z]/i)) {
        const code = char.charCodeAt(0);
        const base = code >= 65 && code <= 90 ? 65 : 97;
        const shift = key.charCodeAt(keyIndex % key.length) - 65;
        result += String.fromCharCode(((code - base + shift) % 26) + base);
        keyIndex++;
      } else {
        result += char;
      }
    }
    return result;
  };

  const vigenereDecrypt = (text, key) => {
    if (!key) throw new Error("Password is required for Vigenere cipher");
    key = key.toUpperCase();
    let result = "";
    let keyIndex = 0;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char.match(/[a-z]/i)) {
        const code = char.charCodeAt(0);
        const base = code >= 65 && code <= 90 ? 65 : 97;
        const shift = key.charCodeAt(keyIndex % key.length) - 65;
        result += String.fromCharCode(((code - base - shift + 26) % 26) + base);
        keyIndex++;
      } else {
        result += char;
      }
    }
    return result;
  };

  // Pig Latin
  const pigLatinEncode = (text) => {
    return text
      .split(" ")
      .map((word) => {
        if (word.length === 0) return word;
        const firstChar = word[0].toLowerCase();
        if ("aeiou".includes(firstChar)) {
          return word + "way";
        } else {
          return word.slice(1) + word[0] + "ay";
        }
      })
      .join(" ");
  };

  const pigLatinDecode = (text) => {
    return text
      .split(" ")
      .map((word) => {
        if (word.endsWith("way")) {
          return word.slice(0, -3);
        } else if (word.endsWith("ay")) {
          const lastConsonant = word[word.length - 3];
          return lastConsonant + word.slice(0, -3);
        }
        return word;
      })
      .join(" ");
  };

  // Hash Functions (MD5, SHA-1, SHA-256, SHA-512)
  const hashText = async (text, algorithm) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest(algorithm, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const md5Hash = (text) => {
    const rotateLeft = (value, amount) =>
      (value << amount) | (value >>> (32 - amount));

    const addUnsigned = (x, y) => (x + y) & 0xffffffff;

    let message = unescape(encodeURIComponent(text));
    let m = [];

    for (let i = 0; i < message.length * 8; i += 8) {
      m[i >> 5] |= (message.charCodeAt(i / 8) & 0xff) << (i % 32);
    }

    const messageBitLength = message.length * 8;
    m[messageBitLength >> 5] |= 0x80 << (messageBitLength % 32);
    m[(((messageBitLength + 64) >>> 9) << 4) + 14] = messageBitLength;

    const blockCount = Math.ceil(m.length / 16) * 16;
    for (let i = 0; i < blockCount; i++) m[i] = m[i] || 0;

    const s = [
      7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20,
      5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23,
      4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15,
      21, 6, 10, 15, 21,
    ];

    const k = [
      0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a,
      0xa8304613, 0xfd469501, 0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
      0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821, 0xf61e2562, 0xc040b340,
      0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
      0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8,
      0x676f02d9, 0x8d2a4c8a, 0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
      0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70, 0x289b7ec6, 0xeaa127fa,
      0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
      0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92,
      0xffeff47d, 0x85845dd1, 0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
      0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391,
    ];

    const a0 = 0x67452301;
    const b0 = 0xefcdab89;
    const c0 = 0x98badcfe;
    const d0 = 0x10325476;

    let a = a0;
    let b = b0;
    let c = c0;
    let d = d0;

    for (let i = 0; i < m.length; i += 16) {
      let wa = a;
      let wb = b;
      let wc = c;
      let wd = d;

      for (let j = 0; j < 64; j++) {
        let f;
        let g;

        if (j < 16) {
          f = (wb & wc) | (~wb & wd);
          g = j;
        } else if (j < 32) {
          f = (wd & wb) | (~wd & wc);
          g = (5 * j + 1) % 16;
        } else if (j < 48) {
          f = wb ^ wc ^ wd;
          g = (3 * j + 5) % 16;
        } else {
          f = wc ^ (wb | ~wd);
          g = (7 * j) % 16;
        }

        const temp = wd;
        wd = wc;
        wc = wb;
        wb = addUnsigned(
          wb,
          rotateLeft(addUnsigned(addUnsigned(wa, f), addUnsigned(k[j], m[i + g])), s[j]),
        );
        wa = temp;
      }

      a = addUnsigned(a, wa);
      b = addUnsigned(b, wb);
      c = addUnsigned(c, wc);
      d = addUnsigned(d, wd);
    }

    const toHex = (value) =>
      Array.from(new Uint8Array(4), (_, index) =>
        ((value >>> (index * 8)) & 0xff).toString(16).padStart(2, "0"),
      ).join("");

    return toHex(a) + toHex(b) + toHex(c) + toHex(d);
  };

  const sha1Hash = async (text) => {
    return await hashText(text, "SHA-1");
  };

  const sha256Hash = async (text) => {
    return await hashText(text, "SHA-256");
  };

  const sha512Hash = async (text) => {
    return await hashText(text, "SHA-512");
  };

  const handleProcess = async () => {
    if (!inputText.trim()) {
      setStatus("❌ Please enter text to process");
      setOutputText("");
      return;
    }

    // Check if password is required
    const passwordRequired = ["xor", "vigenere"];
    if (passwordRequired.includes(algorithm) && !password.trim()) {
      setStatus(`❌ Password is required for ${algorithm.toUpperCase()}`);
      setOutputText("");
      return;
    }

    try {
      let result = "";

      // Hash algorithms (one-way only)
      const hashAlgorithms = ["md5", "sha1", "sha256", "sha512"];
      if (hashAlgorithms.includes(algorithm)) {
        if (mode === "decrypt") {
          setStatus("❌ Hash functions are one-way only (cannot decrypt)");
          setOutputText("");
          return;
        }

        switch (algorithm) {
          case "md5":
            result = md5Hash(inputText);
            break;
          case "sha1":
            result = await sha1Hash(inputText);
            break;
          case "sha256":
            result = await sha256Hash(inputText);
            break;
          case "sha512":
            result = await sha512Hash(inputText);
            break;
          default:
            result = await sha256Hash(inputText); // Default to SHA-256
            break;
        }
        setStatus("✅ Hash generated successfully!");
        setOutputText(result);
        setTimeout(() => setStatus(""), 3000);
        return;
      }

      if (mode === "encrypt") {
        switch (algorithm) {
          case "base64":
            result = base64Encode(inputText);
            break;
          case "caesar":
            result = caesarEncrypt(inputText, 3);
            break;
          case "xor":
            result = xorEncryptDecrypt(inputText, password);
            break;
          case "rot13":
            result = rot13(inputText);
            break;
          case "reverse":
            result = reverseText(inputText);
            break;
          case "atbash":
            result = atbash(inputText);
            break;
          case "binary":
            result = binaryEncode(inputText);
            break;
          case "hex":
            result = hexEncode(inputText);
            break;
          case "morse":
            result = morseEncode(inputText);
            break;
          case "url":
            result = urlEncode(inputText);
            break;
          case "ascii":
            result = asciiEncode(inputText);
            break;
          case "vigenere":
            result = vigenereEncrypt(inputText, password);
            break;
          case "piglatin":
            result = pigLatinEncode(inputText);
            break;
          default:
            result = inputText;
        }
        setStatus("✅ Text encrypted successfully!");
      } else {
        switch (algorithm) {
          case "base64":
            result = base64Decode(inputText);
            break;
          case "caesar":
            result = caesarDecrypt(inputText, 3);
            break;
          case "xor":
            result = xorDecrypt(inputText, password);
            break;
          case "rot13":
            result = rot13(inputText); // ROT13 is symmetric
            break;
          case "reverse":
            result = reverseText(inputText);
            break;
          case "atbash":
            result = atbash(inputText); // Atbash is symmetric
            break;
          case "binary":
            result = binaryDecode(inputText);
            break;
          case "hex":
            result = hexDecode(inputText);
            break;
          case "morse":
            result = morseDecode(inputText);
            break;
          case "url":
            result = urlDecode(inputText);
            break;
          case "ascii":
            result = asciiDecode(inputText);
            break;
          case "vigenere":
            result = vigenereDecrypt(inputText, password);
            break;
          case "piglatin":
            result = pigLatinDecode(inputText);
            break;
          default:
            result = inputText;
        }
        setStatus("✅ Text decrypted successfully!");
      }

      setOutputText(result);
      setTimeout(() => setStatus(""), 3000);
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
      setOutputText("");
      setTimeout(() => setStatus(""), 5000);
    }
  };

  const handleCopy = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      setStatus("✅ Copied to clipboard!");
      setTimeout(() => setStatus(""), 2000);
    }
  };

  const handleClear = () => {
    setInputText("");
    setOutputText("");
    setPassword("");
    setStatus("");
  };

  const handleSwap = () => {
    setInputText(outputText);
    setOutputText("");
    setMode(mode === "encrypt" ? "decrypt" : "encrypt");
  };

  const requiresPassword = ["xor", "vigenere"].includes(algorithm);

  return (
    <div className="encrypt-decrypt-page">
      <div className="page-container">
        <div className="glass-header centered">
          <h1 className="page-title">Encrypt/Decrypt Text</h1>
          <p className="page-subtitle">
            Secure your text with various encryption algorithms
          </p>
        </div>

        <div className="glass-content">
          <div className="encrypt-decrypt-wrapper">
            {/* Controls */}
            <div className="controls-section">
              <div className="control-group">
                <label>Mode:</label>
                <div className="mode-toggle">
                  <button
                    className={`mode-btn ${mode === "encrypt" ? "active" : ""}`}
                    onClick={() => setMode("encrypt")}
                  >
                    Encrypt
                  </button>
                  <button
                    className={`mode-btn ${mode === "decrypt" ? "active" : ""}`}
                    onClick={() => setMode("decrypt")}
                  >
                    Decrypt
                  </button>
                </div>
              </div>

              <div className="control-group">
                <label htmlFor="algorithm">Algorithm:</label>
                <select
                  id="algorithm"
                  value={algorithm}
                  onChange={(e) => setAlgorithm(e.target.value)}
                  className="algorithm-select"
                >
                  <optgroup label="Encoding">
                    <option value="base64">Base64</option>
                    <option value="binary">Binary</option>
                    <option value="hex">Hexadecimal</option>
                    <option value="ascii">ASCII Values</option>
                    <option value="url">URL Encoding</option>
                  </optgroup>
                  <optgroup label="Ciphers (Reversible)">
                    <option value="caesar">Caesar Cipher (Shift 3)</option>
                    <option value="rot13">ROT13 (Shift 13)</option>
                    <option value="atbash">Atbash (A↔Z)</option>
                    <option value="reverse">Reverse Text</option>
                    <option value="xor">XOR (Password)</option>
                    <option value="vigenere">Vigenère (Password)</option>
                  </optgroup>
                  <optgroup label="Hash (One-way Only)">
                    <option value="md5">MD5 (128-bit)</option>
                    <option value="sha1">SHA-1 (160-bit)</option>
                    <option value="sha256">SHA-256 (256-bit)</option>
                    <option value="sha512">SHA-512 (512-bit)</option>
                  </optgroup>
                  <optgroup label="Fun">
                    <option value="morse">Morse Code</option>
                    <option value="piglatin">Pig Latin</option>
                  </optgroup>
                </select>
              </div>

              {requiresPassword && (
                <div className="control-group">
                  <label htmlFor="password">
                    Password: <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter encryption password"
                    className="password-input"
                  />
                </div>
              )}
            </div>

            {/* Input/Output Section */}
            <div className="io-section">
              <div className="io-group">
                <div className="io-header">
                  <label>Input Text:</label>
                  <span className="char-count">
                    {inputText.length} characters
                  </span>
                </div>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Enter text to ${mode}...`}
                  className="io-textarea"
                  rows="6"
                ></textarea>
              </div>

              <div className="action-buttons">
                <button onClick={handleProcess} className="btn-process">
                  {mode === "encrypt" ? "Encrypt" : "Decrypt"}
                </button>
                <button
                  onClick={handleSwap}
                  className="btn-swap"
                  disabled={!outputText}
                >
                  Swap
                </button>
                <button onClick={handleClear} className="btn-clear">
                  Clear
                </button>
              </div>

              <div className="io-group">
                <div className="io-header">
                  <label>Output Text:</label>
                  <button
                    onClick={handleCopy}
                    className="btn-copy"
                    disabled={!outputText}
                  >
                    Copy
                  </button>
                </div>
                <textarea
                  value={outputText}
                  readOnly
                  placeholder="Result will appear here..."
                  className="io-textarea output"
                  rows="6"
                ></textarea>
              </div>
            </div>

            {status && (
              <div
                className={`status-message ${
                  status.includes("❌") ? "error" : "success"
                }`}
              >
                {status}
              </div>
            )}

            {/* Algorithm Info */}
            <div className="info-section">
              <h3>Algorithm Information</h3>
              <div className="algorithm-info">
                {algorithm === "base64" && (
                  <p>
                    <strong>Base64:</strong> A simple encoding scheme that
                    converts binary data to ASCII text. Not secure for
                    encryption but useful for data transfer.
                  </p>
                )}
                {algorithm === "caesar" && (
                  <p>
                    <strong>Caesar Cipher:</strong> One of the simplest
                    encryption techniques. Shifts each letter by 3 positions in
                    the alphabet. Easy to crack but fun for simple encoding.
                  </p>
                )}
                {algorithm === "xor" && (
                  <p>
                    <strong>XOR Cipher:</strong> Uses bitwise XOR operation with
                    a password. Provides basic security but requires the same
                    password for decryption.
                  </p>
                )}
                {algorithm === "vigenere" && (
                  <p>
                    <strong>Vigenère Cipher:</strong> A polyalphabetic
                    substitution cipher using a keyword. Each letter is shifted
                    by a different amount based on the keyword position. More
                    secure than Caesar cipher.
                  </p>
                )}
                {algorithm === "rot13" && (
                  <p>
                    <strong>ROT13:</strong> Rotates each letter by 13 positions.
                    Symmetric (same operation for encrypt/decrypt). Often used
                    for hiding spoilers.
                  </p>
                )}
                {algorithm === "reverse" && (
                  <p>
                    <strong>Reverse Text:</strong> Simply reverses the order of
                    characters. Very basic but can make text unreadable at a
                    glance.
                  </p>
                )}
                {algorithm === "atbash" && (
                  <p>
                    <strong>Atbash Cipher:</strong> Ancient Hebrew cipher that
                    replaces each letter with its reverse in the alphabet (A↔Z,
                    B↔Y, etc.).
                  </p>
                )}
                {algorithm === "binary" && (
                  <p>
                    <strong>Binary Encoding:</strong> Converts each character to
                    its 8-bit binary representation. Useful for understanding
                    how computers store text data.
                  </p>
                )}
                {algorithm === "hex" && (
                  <p>
                    <strong>Hexadecimal Encoding:</strong> Converts each
                    character to hexadecimal (base-16) format. Commonly used in
                    programming and color codes.
                  </p>
                )}
                {algorithm === "morse" && (
                  <p>
                    <strong>Morse Code:</strong> Classic communication system
                    using dots and dashes. Used in telecommunication, especially
                    by radio operators.
                  </p>
                )}
                {algorithm === "url" && (
                  <p>
                    <strong>URL Encoding:</strong> Converts special characters
                    to web-safe format. Essential for passing data in URLs
                    (e.g., spaces become %20).
                  </p>
                )}
                {algorithm === "ascii" && (
                  <p>
                    <strong>ASCII Values:</strong> Shows the numeric ASCII code
                    for each character. Helpful for understanding character
                    encoding and programming.
                  </p>
                )}
                {algorithm === "piglatin" && (
                  <p>
                    <strong>Pig Latin:</strong> A playful language game where
                    consonants move to the end followed by "ay", or
                    vowel-starting words add "way". (e.g., "hello" → "ellohay")
                  </p>
                )}
                {algorithm === "md5" && (
                  <p>
                    <strong>MD5 Hash:</strong> A widely used 128-bit hash
                    function. One-way only (cannot be decrypted). Often used for
                    checksums and file verification. Note: Not cryptographically
                    secure anymore.
                  </p>
                )}
                {algorithm === "sha1" && (
                  <p>
                    <strong>SHA-1 Hash:</strong> 160-bit hash function designed
                    by NSA. One-way only. Previously used for SSL certificates
                    and Git commits. Now deprecated for security purposes.
                  </p>
                )}
                {algorithm === "sha256" && (
                  <p>
                    <strong>SHA-256 Hash:</strong> Part of SHA-2 family,
                    produces 256-bit hash. One-way only. Widely used in
                    blockchain, cryptocurrencies, and secure password storage.
                    Cryptographically secure.
                  </p>
                )}
                {algorithm === "sha512" && (
                  <p>
                    <strong>SHA-512 Hash:</strong> Most secure in SHA-2 family,
                    produces 512-bit hash. One-way only. Used for high-security
                    applications, digital signatures, and password hashing with
                    salts.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EncryptDecrypt;
