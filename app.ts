import express from "express";
import {
  isDigit,
  isOperator,
  isSeparator,
  OPERATOR_PRECEDENCE,
  type Digit,
  type ErrorResponse,
  type EvaluateRequest,
  type EvaluateResponse,
  type Expression,
  type Operator,
  type Token,
} from "common";

const PORT = process.env.PORT || 5001;

const app = express();

app.use(express.static("dist"));

app.use(express.json());

app.get("/version", (req, res) => {
  res.send("1");
});

app.get("/health", (req, res) => {
  res.send("ok");
});

app.post("/evaluate", (req, res) => {
  const MAXIMUM_PRECISION = 15;

  const { expression: input }: EvaluateRequest = req.body;

  // Extracts digits from the tokens until a non-digit is reached.
  const digits = (tokens: string[], i: number) => {
    const d = [];

    let token = tokens[i + d.length];

    while (isDigit(token)) {
      d.push(token);

      token = tokens[i + d.length];
    }
    return d;
  };

  // Extracts numbers from digit tokens.
  const numberize = (d: string[]) =>
    d.reduce((previous, current) => previous * 10 + Number(current), 0);

  // Extracts digits from a number.
  const digitize = (n: number): Digit[] => {
    const d: Digit[] = [];

    do {
      d.unshift(String(n % 10) as Digit);
      n = Math.floor(n / 10);
    } while (n > 0);

    return d;
  };

  // Extracts digits from a fraction.
  const fractionize = (n: number): Digit[] => {
    const d: Digit[] = [];

    let s = 0;

    // Convert the fraction to a whole number and trim to maximum precision.
    while (!Number.isInteger(n) && s < MAXIMUM_PRECISION) {
      n *= 10;
      s++;
    }

    n = Math.round(n);

    // Reduce the scale as long as the last digit is a zero.
    while (n % 10 === 0 && s > 0) {
      n = Math.floor(n / 10);
      s--;
    }

    for (let i = 0; i < s; i++) {
      d.unshift(String(n % 10) as Digit);
      n = Math.floor(n / 10);
    }
    return d;
  };

  // Extracts digits and separator from a number.
  const tokenize = (n: number): Token[] => {
    const integer = Math.trunc(n);
    const fraction = Math.abs(n - integer);

    if (!fraction) return digitize(integer);

    return [...digitize(integer), ".", ...fractionize(fraction)];
  };

  const numbers: number[] = [];
  const operators: Operator[] = [];

  // Extracts numbers and operators from the tokens.
  for (let i = 0; i < input.length; i++) {
    const token = input[i];

    if (isOperator(token)) {
      operators.push(token);
    } else if (isSeparator(token)) {
      const previous = numbers[numbers.length - 1] ?? 0;
      const fraction = digits(input, i + 1);
      numbers[numbers.length - 1] =
        previous + numberize(fraction) / 10 ** fraction.length;
      i += fraction.length;
    } else if (isDigit(token)) {
      const integer = digits(input, i);
      numbers.push(numberize(integer));
      i += integer.length - 1;
    }
  }

  const operation = (op: Operator, a: number, b: number): number => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(`${a} ${op} ${b}`);
    }

    let result: number;

    switch (op) {
      case "+":
        result = a + b;
        break;
      case "-":
        result = a - b;
        break;
      case "×":
        result = a * b;
        break;
      case "÷":
        result = a / b;
        break;
    }

    return parseFloat(result.toPrecision(MAXIMUM_PRECISION));
  };

  /* 
    Goes through each operator using an algorithm that compares the 
    current operator precedence with the next operator's precedence.

    If the current operator preceedes the next one it executes the operation with the first and second numbers.
    If the next operator preceedes the current one it executes the operation with the second and third numbers.

    1 + 2 × 3 ÷ 4 -> 1 + ((2 × 3) ÷ 4)
  */
  while (operators.length > 0) {
    const na = numbers[0];
    const nb = numbers[1];
    const nc = numbers[2];

    const oa = operators[0];
    const ob = operators[1];

    if (
      oa !== undefined &&
      ob !== undefined &&
      OPERATOR_PRECEDENCE[ob] > OPERATOR_PRECEDENCE[oa]
    ) {
      operators.splice(1, 1);
      numbers.splice(2, 1);
      numbers[1] = operation(ob, nb ?? 0, nc ?? 0);
      continue;
    }

    if (oa !== undefined) {
      operators.splice(0, 1);
      numbers.splice(1, 1);
      numbers[0] = operation(oa, na ?? 0, nb ?? 0);
    }
  }

  const output: Expression = [];

  const number = numbers[0];

  if (number === undefined || !Number.isFinite(number)) {
    res.status(400).json({ message: "Error" } satisfies ErrorResponse);
    return;
  }

  output.push(...tokenize(number));

  res.json({ expression: output } satisfies EvaluateResponse);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
