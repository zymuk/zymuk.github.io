import React, { useState, useEffect } from "react";
import "./NumerologyName.css";

function NumerologyName() {
  const [birthDate, setBirthDate] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [usedNumbers, setUsedNumbers] = useState([]);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [history, setHistory] = useState([]);
  const [calculationHistory, setCalculationHistory] = useState([]);

  useEffect(() => {
    const storedHistory = localStorage.getItem("history");
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
    setResult(null);
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

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!birthDate) {
      setError("Please enter date");
      return;
    }
    let numerologyValue = "";
    setSelectedLetters("");

    do {
      numerologyValue = calculateNumerologyValue(birthDate);
    } while (
      calculationHistory.includes(numerologyValue) &&
      calculateMaxNameCount(birthDate) > calculationHistory.length
    );

    calculationHistory.push(numerologyValue);
    setResult(numerologyValue);
    setSelectedLetters(numerologyValue);
    setError("");
  };

  const handleSave = () => {
    const newHistory = [...history];
    const existingEntry = newHistory.find((entry) => entry.date === birthDate);
    if (existingEntry) {
      existingEntry.result.push(result);
    } else {
      newHistory.push({ date: birthDate, result: [result] });
    }
    setHistory(newHistory);
    localStorage.setItem("history", JSON.stringify(newHistory));
  };

  const clearCache = () => {
    setHistory([]);
    localStorage.setItem("history", JSON.stringify([]));
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

  return (
    <div className="numerologyName">
      <h1>Numerology Name Generator</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Date:
          <input
            type="date"
            value={birthDate}
            onChange={handleBirthDateChange}
          />
        </label>
        <br />
        <button type="submit">Generate</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
      <table>
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
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((numberColumn, indexColumn) => (
                <td
                  key={indexRow * 10 + indexColumn}
                  className={`${
                    usedNumbers.includes(numberColumn) ? "gray" : ""
                  } ${
                    selectedLetters.includes(getLetters(numberColumn)[indexRow])
                      ? "green"
                      : ""
                  }`}
                >
                  {getLetters(numberColumn)[indexRow] ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {result && (
        <p>
          <span>Result: </span>
          <span className="result">{result}</span>
          <span onClick={handleSave}> (save to history)</span>
        </p>
      )}
      <div>
        <h2>
          Calculation History <span onClick={clearCache}>(Clear Cache)</span>
        </h2>
        <ul>
          {history.map((entry, index) => (
            <li key={index}>
              Date: {entry.date}
              <ul>
                {entry.result.map((result, index) => (
                  <li key={index}>{result}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default NumerologyName;
