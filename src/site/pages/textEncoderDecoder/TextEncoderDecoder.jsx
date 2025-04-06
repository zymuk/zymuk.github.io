import React, { useState } from "react";
import "./TextEncoderDecoder.css";

function TextEncoderDecoder() {
  const [url, setUrl] = useState("");
  const [encodedUrl, setEncodedUrl] = useState("");
  const [decodedUrl, setDecodedUrl] = useState("");

  const handleEncode = () => {
    const encoded = encodeURIComponent(url);
    setEncodedUrl(encoded);
  };

  const handleDecode = () => {
    try {
      const decoded = decodeURIComponent(encodedUrl);
      setDecodedUrl(decoded);
    } catch (error) {
      setDecodedUrl("Lỗi giải mã");
    }
  };

  return (
    <div className="text-encoder-decoder-container">
      <h1>Text Encoder/Decoder</h1>
      <div className="text-encoder-decoder-input-group">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Nhập văn bản"
        />
      </div>
      <div className="text-encoder-decoder-output-group">
        <button className="text-encoder-decoder-button" onClick={handleEncode}>
          Encode
        </button>
        <p>Encoded Text:</p>
        <textarea value={encodedUrl} readOnly />
      </div>
      <div className="text-encoder-decoder-output-group">
        <button className="text-encoder-decoder-button" onClick={handleDecode}>
          Decode
        </button>
        <p>Decoded Text:</p>
        <textarea value={decodedUrl} readOnly />
      </div>
    </div>
  );
}

export default TextEncoderDecoder;
