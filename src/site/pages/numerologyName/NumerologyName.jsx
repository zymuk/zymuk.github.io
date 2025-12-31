import React, { useState, useEffect } from "react";
import "./NumerologyName.css";

const NumerologyName = () => {
  const [birthDate, setBirthDate] = useState("");
  const [currentResult, setCurrentResult] = useState("");
  const [error, setError] = useState("");
  const [usedNumbers, setUsedNumbers] = useState([]);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [history, setHistory] = useState([]);
  const [calculationHistory, setCalculationHistory] = useState([]);
  const [viewingEntry, setViewingEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const storedHistory = localStorage.getItem("numerologyHistory");
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

  const handleBirthDateChange = (event) => {
    setBirthDate(event.target.value);
    const birthDateArray = event.target.value.split("-");
    const year = parseInt(birthDateArray[0]);
    const month = parseInt(birthDateArray[1]);
    const day = parseInt(birthDateArray[2]);
    const usedNumbers = [];
    usedNumbers.push(...day.toString().split("").map(Number));
    usedNumbers.push(...month.toString().split("").map(Number));
    usedNumbers.push(...year.toString().split("").map(Number));
    setUsedNumbers(usedNumbers);
    setCurrentResult("");
    setCalculationHistory([]);
  };

  const calculateMaxNameCount = (birthDate) => {
    let maxNameCount = 1;
    const numbers = birthDate.replace(/-/g, "").split("").map(Number);
    const missingNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(
      (num) => !numbers.includes(num)
    );

    missingNumbers.forEach((item) => {
      maxNameCount *= getLetters(item).length;
    });

    return maxNameCount;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!birthDate) {
      setError("Please enter date");
      return;
    }
    let numerologyValue = "";

    // Get existing names for this date from history
    const existingEntry = history.find((entry) => entry.date === birthDate);
    const existingNames = existingEntry ? existingEntry.results : [];

    do {
      numerologyValue = calculateNumerologyValue(birthDate);
    } while (
      (calculationHistory.includes(numerologyValue) ||
        existingNames.includes(numerologyValue)) &&
      calculateMaxNameCount(birthDate) > calculationHistory.length
    );

    calculationHistory.push(numerologyValue);
    setCurrentResult(numerologyValue);
    setSelectedLetters(numerologyValue);
    setError("");
  };

  const handleSave = () => {
    if (!currentResult) {
      alert("No name to save!");
      return;
    }
    const newHistory = [...history];
    const existingEntry = newHistory.find((entry) => entry.date === birthDate);
    if (existingEntry) {
      if (!existingEntry.results.includes(currentResult)) {
        existingEntry.results.push(currentResult);
        existingEntry.updatedAt = new Date().toISOString();
      }
    } else {
      newHistory.push({
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        date: birthDate,
        results: [currentResult],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    setHistory(newHistory);
    localStorage.setItem("numerologyHistory", JSON.stringify(newHistory));
    // Keep currentResult, calculationHistory, and selectedLetters for continued use
  };

  const handleView = (entry) => {
    setViewingEntry(entry);
  };

  const handleDelete = (entryId) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      const updatedHistory = history.filter((entry) => entry.id !== entryId);
      setHistory(updatedHistory);
      localStorage.setItem("numerologyHistory", JSON.stringify(updatedHistory));
    }
  };

  const clearCache = () => {
    if (window.confirm("Are you sure you want to clear all history?")) {
      setHistory([]);
      localStorage.setItem("numerologyHistory", JSON.stringify([]));
    }
  };

  const calculateNumerologyValue = (birthDate) => {
    const birthDateArray = birthDate.split("-");
    const year = parseInt(birthDateArray[0]);
    const month = parseInt(birthDateArray[1]);
    const day = parseInt(birthDateArray[2]);
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const usedNumbers = [];
    usedNumbers.push(...day.toString().split("").map(Number));
    usedNumbers.push(...month.toString().split("").map(Number));
    usedNumbers.push(...year.toString().split("").map(Number));
    const remainingNumbers = numbers.filter(
      (number) => !usedNumbers.includes(number)
    );
    let name = "";
    while (remainingNumbers.length > 0) {
      const randomIndex = Math.floor(Math.random() * remainingNumbers.length);
      const randomNumber = remainingNumbers.splice(randomIndex, 1)[0];
      const letters = getLetters(randomNumber);
      const randomLetter = letters[Math.floor(Math.random() * letters.length)];
      name += randomLetter;
    }
    return name;
  };

  const getLetters = (number) => {
    switch (number) {
      case 1:
        return ["A", "J", "S"];
      case 2:
        return ["B", "K", "T"];
      case 3:
        return ["C", "L", "U"];
      case 4:
        return ["D", "M", "V"];
      case 5:
        return ["E", "N", "W"];
      case 6:
        return ["F", "O", "X"];
      case 7:
        return ["G", "P", "Y"];
      case 8:
        return ["H", "Q", "Z"];
      case 9:
        return ["I", "R"];
      default:
        return [];
    }
  };

  const filteredHistory = history.filter(
    (entry) =>
      entry.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.results.some((result) =>
        result.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="numerology-page">
      <div className="page-container">
        <div className="glass-header spaced">
          <h1 className="page-title">Numerology Name Generator</h1>
          <div className="header-actions">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>

        {/* Generation Form Section */}
        <div className="glass-content">
          <div className="section-header">
            <h2>Generate Numerology Name</h2>
          </div>

          <form onSubmit={handleSubmit} className="numerology-form">
            <div className="form-group">
              <label htmlFor="birthDate">Birth Date *</label>
              <div className="date-input-group">
                <input
                  type="date"
                  id="birthDate"
                  value={birthDate}
                  onChange={handleBirthDateChange}
                  required
                  className="form-input"
                />
                <button type="submit" className="btn-primary">
                  Generate Name
                </button>
              </div>
              {currentResult && (
                <div className="generation-count">
                  Generated: {calculationHistory.length} name
                  {calculationHistory.length !== 1 ? "s" : ""}
                </div>
              )}
            </div>

            {usedNumbers.length > 0 && (
              <div className="form-group">
                <label>Number Mapping Table</label>
                <table className="mapping-table">
                  <thead>
                    <tr>
                      <th>1</th>
                      <th>2</th>
                      <th>3</th>
                      <th>4</th>
                      <th>5</th>
                      <th>6</th>
                      <th>7</th>
                      <th>8</th>
                      <th>9</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[0, 1, 2].map((numberRow, indexRow) => (
                      <tr key={indexRow}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(
                          (numberColumn, indexColumn) => (
                            <td
                              key={indexRow * 10 + indexColumn}
                              className={`${
                                usedNumbers.includes(numberColumn) ? "used" : ""
                              } ${
                                selectedLetters.includes(
                                  getLetters(numberColumn)[indexRow]
                                )
                                  ? "selected"
                                  : ""
                              }`}
                            >
                              {getLetters(numberColumn)[indexRow] ?? ""}
                            </td>
                          )
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {currentResult && (
              <div className="result-section">
                <h3>Generated Name:</h3>
                <div className="result-display">{currentResult}</div>
                <div className="result-actions">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="btn-primary"
                  >
                    Save to History
                  </button>
                </div>
              </div>
            )}

            {error && <p className="error-message">{error}</p>}
          </form>
        </div>

        {/* History List */}
        {viewingEntry && (
          <div className="modal-overlay" onClick={() => setViewingEntry(null)}>
            <div
              className="modal-content view-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>View Entry</h2>
                <button
                  onClick={() => setViewingEntry(null)}
                  className="btn-close"
                >
                  ✕
                </button>
              </div>

              <div className="view-content">
                <div className="view-section">
                  <h3 className="view-title">
                    Birth Date: {viewingEntry.date}
                  </h3>
                </div>

                <div className="view-section">
                  <h4 className="view-label">Generated Names</h4>
                  <ul className="results-list">
                    {viewingEntry.results.map((result, index) => (
                      <li key={index} className="result-item">
                        {result}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="view-meta">
                  <div className="meta-item">
                    <strong>Created:</strong>{" "}
                    {formatDate(viewingEntry.createdAt)}
                  </div>
                  {viewingEntry.updatedAt !== viewingEntry.createdAt && (
                    <div className="meta-item">
                      <strong>Updated:</strong>{" "}
                      {formatDate(viewingEntry.updatedAt)}
                    </div>
                  )}
                </div>

                <div className="view-actions">
                  <button
                    onClick={() => setViewingEntry(null)}
                    className="btn-primary"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History List */}
        <div className="glass-content">
          <div className="history-stats">
            <p>
              Total Entries: <strong>{history.length}</strong> | Showing:{" "}
              <strong>{filteredHistory.length}</strong>
              {history.length > 0 && (
                <span className="clear-link" onClick={clearCache}>
                  {" "}
                  (Clear All)
                </span>
              )}
            </p>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="empty-state">
              {searchTerm ? (
                <div>
                  <h3>No entries found</h3>
                  <p>No entries match the search term "{searchTerm}"</p>
                </div>
              ) : (
                <div>
                  <h3>No history yet</h3>
                  <p>Generate your first numerology name to get started!</p>
                </div>
              )}
            </div>
          ) : (
            <div className="history-grid">
              {filteredHistory.map((entry) => (
                <div key={entry.id} className="history-card">
                  <div
                    className="history-header clickable"
                    onClick={() => handleView(entry)}
                  >
                    <h3 className="history-title">Birth Date: {entry.date}</h3>
                  </div>

                  <div className="history-results">
                    <strong>Names ({entry.results.length}):</strong>
                    <div className="results-preview">
                      {entry.results.slice(0, 3).map((result, index) => (
                        <span key={index} className="result-tag">
                          {result}
                        </span>
                      ))}
                      {entry.results.length > 3 && (
                        <span className="more-results">
                          +{entry.results.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="history-meta">
                    <small>
                      Created: {formatDate(entry.createdAt)}
                      {entry.updatedAt !== entry.createdAt && (
                        <> | Updated: {formatDate(entry.updatedAt)}</>
                      )}
                    </small>
                  </div>

                  <div className="history-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleView(entry);
                      }}
                      className="btn-view"
                      title="View"
                    >
                      View
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(entry.id);
                      }}
                      className="btn-delete"
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NumerologyName;
