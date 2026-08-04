import React, { useState } from "react";
import usePageMeta from "../../../utils/usePageMeta";
import "./JsonFormatter.css";

function JsonFormatter() {
  usePageMeta({
    title: "JSON Formatter / Validator",
    description:
      "Format, minify and validate JSON online with precise error locations.",
  });

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("");

  const positionToLineColumn = (position, text) => {
    const before = text.slice(0, position);
    const line = (before.match(/\n/g) || []).length + 1;
    const lastNewline = before.lastIndexOf("\n");
    const column = position - lastNewline;
    return { line, column };
  };

  const parseJson = (text) => {
    try {
      return { parsed: JSON.parse(text), error: null };
    } catch (error) {
      const match = error.message.match(/position (\d+)/);
      const position = match ? Number(match[1]) : null;
      const location = position !== null ? positionToLineColumn(position, text) : null;
      return { parsed: null, error: { message: error.message, ...location } };
    }
  };

  const handleFormat = () => {
    if (!input.trim()) {
      setOutput("");
      setStatus("Error: JSON input is empty. Please enter JSON to format.");
      return;
    }
    const { parsed, error } = parseJson(input);
    if (error) {
      setOutput("");
      setStatus(
        error.line
          ? `Error: Invalid JSON at line ${error.line}, column ${error.column}. ${error.message}`
          : `Error: Invalid JSON. ${error.message}`
      );
      return;
    }
    setOutput(JSON.stringify(parsed, null, 2));
    setStatus("Valid JSON - formatted successfully.");
  };

  const handleMinify = () => {
    if (!input.trim()) {
      setOutput("");
      setStatus("Error: JSON input is empty. Please enter JSON to minify.");
      return;
    }
    const { parsed, error } = parseJson(input);
    if (error) {
      setOutput("");
      setStatus(
        error.line
          ? `Error: Invalid JSON at line ${error.line}, column ${error.column}. ${error.message}`
          : `Error: Invalid JSON. ${error.message}`
      );
      return;
    }
    setOutput(JSON.stringify(parsed));
    setStatus("Valid JSON - minified successfully.");
  };

  const handleValidate = () => {
    if (!input.trim()) {
      setOutput("");
      setStatus("Error: JSON input is empty. Please enter JSON to validate.");
      return;
    }
    const { parsed, error } = parseJson(input);
    if (error) {
      setOutput("");
      setStatus(
        error.line
          ? `Error: Invalid JSON at line ${error.line}, column ${error.column}. ${error.message}`
          : `Error: Invalid JSON. ${error.message}`
      );
      return;
    }
    setOutput(JSON.stringify(parsed, null, 2));
    setStatus("Valid JSON - no syntax errors found.");
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setStatus("");
  };

  return (
    <div className="json-formatter-page">
      <div className="page-container">
        <div className="glass-header centered">
          <h1 className="page-title">JSON Formatter / Validator</h1>
        </div>
        <div className="glass-content">
          <div className="json-formatter-container">
            <div className="json-formatter-input-group">
              <label htmlFor="json-input">Raw JSON</label>
              <textarea
                id="json-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste JSON here..."
                className="form-textarea"
                rows="8"
                spellCheck="false"
              />
            </div>
            <div className="action-buttons">
              <button className="btn-primary" onClick={handleFormat}>
                Format
              </button>
              <button className="btn-primary" onClick={handleMinify}>
                Minify
              </button>
              <button className="btn-primary" onClick={handleValidate}>
                Validate
              </button>
              <button className="btn-secondary" onClick={handleClear}>
                Clear
              </button>
            </div>
            {status && (
              <p
                className={
                  status.startsWith("Error")
                    ? "status-message error"
                    : "status-message success"
                }
              >
                {status}
              </p>
            )}
            <div className="json-formatter-output-group">
              <label htmlFor="json-output">Formatted JSON</label>
              <textarea
                id="json-output"
                value={output}
                readOnly
                className="form-textarea"
                rows="8"
                spellCheck="false"
              />
              {output && (
                <button
                  className="btn-primary"
                  onClick={() => navigator.clipboard.writeText(output)}
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

export default JsonFormatter;
