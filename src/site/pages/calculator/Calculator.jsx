import { useState } from "react";
import "./Calculator.css";

const Calculator = () => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");

  const handleClick = (value) => {
    setInput((prev) => prev + value);
  };

  const handleClear = () => {
    setInput("");
    setResult("");
  };

  const handleDelete = () => {
    setInput((prev) => prev.slice(0, -1));
  };

  const handleCalculate = () => {
    try {
      let expression = input
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/√/g, "Math.sqrt")
        .replace(/π/g, "Math.PI")
        .replace(/e/g, "Math.E")
        .replace(/sin/g, "Math.sin")
        .replace(/cos/g, "Math.cos")
        .replace(/tan/g, "Math.tan")
        .replace(/log/g, "Math.log10")
        .replace(/ln/g, "Math.log")
        .replace(/exp/g, "Math.exp");

      // eslint-disable-next-line no-eval
      setResult(eval(expression));
    } catch {
      setResult("Error");
    }
  };

  return (
    <div className="calculator-page">
      <div className="page-container">
        <div className="glass-header centered">
          <h1 className="page-title">Calculator</h1>
        </div>
        <div className="glass-content">
          <div className="calculator-wrapper">
            <div className="display">
              <div className="input">{input || "0"}</div>
              <div className="result">{result || ""}</div>
            </div>
            <div className="advancedButtons">
              <button onClick={() => handleClick("π")} className="btn">
                π
              </button>
              <button onClick={() => handleClick("e")} className="btn">
                e
              </button>
              <button onClick={() => handleClick("sin(")} className="btn">
                sin
              </button>
              <button onClick={() => handleClick("cos(")} className="btn">
                cos
              </button>
              <button onClick={() => handleClick("tan(")} className="btn">
                tan
              </button>
              <button onClick={() => handleClick("log(")} className="btn">
                log
              </button>
              <button onClick={() => handleClick("ln(")} className="btn">
                ln
              </button>
              <button onClick={() => handleClick("exp(")} className="btn">
                exp
              </button>
              <button onClick={() => handleClick("^")} className="btn">
                ^
              </button>
              <button onClick={() => handleClick("√(")} className="btn">
                √
              </button>
            </div>
            <div className="basicButtons">
              <button onClick={() => handleClick("7")} className="btn">
                7
              </button>
              <button onClick={() => handleClick("8")} className="btn">
                8
              </button>
              <button onClick={() => handleClick("9")} className="btn">
                9
              </button>
              <button onClick={handleClear} className="btn clear">
                C
              </button>
              <button onClick={handleDelete} className="btn delete">
                ⌫
              </button>
              <button onClick={() => handleClick("4")} className="btn">
                4
              </button>
              <button onClick={() => handleClick("5")} className="btn">
                5
              </button>
              <button onClick={() => handleClick("6")} className="btn">
                6
              </button>
              <button onClick={() => handleClick("×")} className="btn operator">
                ×
              </button>
              <button onClick={() => handleClick("÷")} className="btn operator">
                ÷
              </button>
              <button onClick={() => handleClick("1")} className="btn">
                1
              </button>
              <button onClick={() => handleClick("2")} className="btn">
                2
              </button>
              <button onClick={() => handleClick("3")} className="btn">
                3
              </button>
              <button onClick={() => handleClick("+")} className="btn operator">
                +
              </button>
              <button onClick={() => handleClick("-")} className="btn operator">
                -
              </button>
              <button onClick={() => handleClick("0")} className="btn">
                0
              </button>
              <button onClick={() => handleClick(".")} className="btn">
                .
              </button>
              <button onClick={() => handleClick("")} className="btn">
                x10ª
              </button>
              <button onClick={() => handleClick("")} className="btn">
                Ans
              </button>
              <button onClick={handleCalculate} className="btn equal">
                =
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
