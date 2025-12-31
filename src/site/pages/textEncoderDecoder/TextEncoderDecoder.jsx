import React, { useState } from "react";
import "./TextEncoderDecoder.css";

function TextEncoderDecoder() {
  const [url, setUrl] = useState("");
  const [encodedUrl, setEncodedUrl] = useState("");
  const [decodedUrl, setDecodedUrl] = useState("");

  const handleEncode = () => {
    if (!url.trim()) {
      setEncodedUrl("Error: Input text is empty. Please enter text to encode.");
      return;
    }
    try {
      const encoded = encodeURIComponent(url);
      setEncodedUrl(encoded);
    } catch (error) {
      setEncodedUrl("Error encoding text. Please check the input text.");
    }
  };

  const handleDecode = () => {
    if (!encodedUrl.trim()) {
      setDecodedUrl(
        "Error: Encoded text is empty. Please enter text to decode."
      );
      return;
    }
    try {
      const decoded = decodeURIComponent(encodedUrl);
      setDecodedUrl(decoded);
    } catch (error) {
      setDecodedUrl("Error decoding text. Please check the encoded text.");
    }
  };

  return (
    <div className="text-encoder-decoder-page">
      <div className="page-container">
        <div className="glass-header centered">
          <h1 className="page-title">Text Encoder/Decoder</h1>
        </div>
        <div className="glass-content">
          <div className="text-encoder-decoder-container">
            <div className="text-encoder-decoder-input-group">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter text to encode/decode"
              />
            </div>
            <div className="text-encoder-decoder-output-group">
              <button
                className="text-encoder-decoder-button"
                onClick={handleEncode}
              >
                Encode
              </button>
              <p>Encoded Text:</p>
              <textarea value={encodedUrl} readOnly />
              {encodedUrl && (
                <button
                  className="text-encoder-decoder-copy-button"
                  onClick={() => navigator.clipboard.writeText(encodedUrl)}
                >
                  Copy
                </button>
              )}
            </div>
            <div className="text-encoder-decoder-output-group">
              <button
                className="text-encoder-decoder-button"
                onClick={handleDecode}
              >
                Decode
              </button>
              <p>Decoded Text:</p>
              <textarea value={decodedUrl} readOnly />
              {decodedUrl && (
                <button
                  className="text-encoder-decoder-copy-button"
                  onClick={() => navigator.clipboard.writeText(decodedUrl)}
                >
                  Copy
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TextEncoderDecoder;
