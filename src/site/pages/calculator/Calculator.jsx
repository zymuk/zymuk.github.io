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

  const evaluate = (expression) => {
    const tokens = expression
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/√/g, "sqrt")
      .replace(/π/g, "pi");
    let pos = 0;

    const tokenize = () => {
      const result = [];
      while (pos < tokens.length) {
        const char = tokens[pos];
        if (/\s/.test(char)) {
          pos++;
        } else if (/[0-9.]/.test(char)) {
          let number = "";
          while (pos < tokens.length && /[0-9.]/.test(tokens[pos])) {
            number += tokens[pos];
            pos++;
          }
          const value = Number(number);
          if (Number.isNaN(value)) throw new Error("Invalid number");
          result.push({ type: "number", value });
        } else if (/[a-zA-Z]/.test(char)) {
          let word = "";
          while (pos < tokens.length && /[a-zA-Z]/.test(tokens[pos])) {
            word += tokens[pos];
            pos++;
          }
          result.push({ type: "word", value: word });
        } else {
          result.push({ type: "symbol", value: char });
          pos++;
        }
      }
      return result;
    };

    const parser = (tokens) => {
      let current = 0;

      const peek = () => tokens[current];

      const next = () => tokens[current++];

      const match = (value) => {
        const token = peek();
        if (token && token.value === value) {
          current++;
          return true;
        }
        return false;
      };

      const parseNumber = () => {
        const token = next();
        if (token.type === "number") return token.value;
        if (token.type === "word") {
          if (token.value === "pi") return Math.PI;
          if (token.value === "e") return Math.E;
          throw new Error("Unknown constant");
        }
        throw new Error("Expected number");
      };

      const parsePrimary = () => {
        const token = peek();
        if (!token) throw new Error("Unexpected end");
        if (token.value === "(") {
          next();
          const value = parseExpression();
          if (!match(")")) throw new Error("Missing closing parenthesis");
          return value;
        }
        if (token.type === "word") {
          const functions = {
            sin: Math.sin,
            cos: Math.cos,
            tan: Math.tan,
            log: Math.log10,
            ln: Math.log,
            exp: Math.exp,
            sqrt: Math.sqrt,
          };
          const fn = functions[token.value];
          if (fn) {
            next();
            if (!match("(")) throw new Error("Missing opening parenthesis");
            const value = parseExpression();
            if (!match(")")) throw new Error("Missing closing parenthesis");
            return fn(value);
          }
          return parseNumber();
        }
        return parseNumber();
      };

      const parseUnary = () => {
        if (match("-")) return -parseUnary();
        if (match("+")) return parseUnary();
        return parsePrimary();
      };

      const parsePower = () => {
        let value = parseUnary();
        while (match("^")) {
          value = Math.pow(value, parsePower());
        }
        return value;
      };

      const parseTerm = () => {
        let value = parsePower();
        while (peek() && (peek().value === "*" || peek().value === "/")) {
          const operator = next().value;
          const right = parsePower();
          value = operator === "*" ? value * right : value / right;
        }
        return value;
      };

      const parseExpression = () => {
        let value = parseTerm();
        while (peek() && (peek().value === "+" || peek().value === "-")) {
          const operator = next().value;
          const right = parseTerm();
          value = operator === "+" ? value + right : value - right;
        }
        return value;
      };

      const result = parseExpression();
      if (current < tokens.length) throw new Error("Invalid expression");
      return result;
    };

    return parser(tokenize());
  };

  const handleCalculate = () => {
    try {
      if (!input.trim()) {
        setResult("");
        return;
      }
      const value = evaluate(input);
      if (Number.isFinite(value)) {
        setResult(String(parseFloat(value.toPrecision(12))));
      } else {
        setResult("Error");
      }
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
