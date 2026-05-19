import { useMemo, useState } from "react";
import styles from "./Calculator.module.css";
import {
  isDigit,
  isToken,
  type EvaluateRequest,
  type EvaluateResponse,
  type Expression,
  type Token,
} from "common";

const LEFT = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  ".",
  "0",
  "=",
] as const satisfies readonly Token[];

const RIGHT = ["÷", "×", "-", "+"] as const satisfies readonly Token[];

function Calculator() {
  const [expression, setExpression] = useState<Expression>([]);

  const input = useMemo(() => expression.join(""), [expression]);

  const updateExpression = async (input: Expression) => {
    for (let i = 0; i < input.length; i++) {
      if (!isDigit(input[i]) && !isDigit(input[i - 1])) return;
    }

    const equals = input.indexOf("=");

    if (equals === -1) {
      setExpression(input);
      return;
    }

    const lhs = input.slice(0, equals);

    const response = await fetch("/api/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expression: lhs } satisfies EvaluateRequest),
    });

    const { expression: output }: EvaluateResponse = await response.json();

    setExpression(output);
  };

  const parseTokens = (input: string): Token[] | null => {
    const tokens: Token[] = [];

    for (const c of input) {
      if (!isToken(c)) return null;

      tokens.push(c);
    }
    return tokens;
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tokens = parseTokens(e.target.value);

    if (!tokens) return;

    updateExpression(tokens);
  };

  const onButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.target as HTMLButtonElement;
    const [token] = parseTokens(button.innerText) ?? [];

    if (!token) return;

    updateExpression([...expression, token]);
  };

  return (
    <form className={styles.calculator}>
      <div className={styles.inputs}>
        <input
          className={styles.input}
          type="text"
          inputMode="numeric"
          value={input}
          onChange={onInputChange}
        />
        <div className={styles.controls}>
          <div className={styles.left}>
            {LEFT.map((t) => {
              return (
                <button
                  className={styles.button}
                  type="button"
                  onClick={onButtonClick}
                >
                  {t}
                </button>
              );
            })}
          </div>
          <div className={styles.right}>
            {RIGHT.map((t) => {
              return (
                <button
                  className={`${styles.button} ${styles.operator}`}
                  type="button"
                  onClick={onButtonClick}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </form>
  );
}

export default Calculator;
