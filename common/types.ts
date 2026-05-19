const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"] as const;
const SEPARATORS = ["."] as const;
const OPERATORS = ["+", "-", "×", "÷"] as const;
const COMMANDS = ["="] as const;

export type Digit = (typeof DIGITS)[number];
export type Separator = (typeof SEPARATORS)[number];
export type Operator = (typeof OPERATORS)[number];
export type Command = (typeof COMMANDS)[number];
export type Token = Digit | Separator | Operator | Command;

export const OPERATOR_PRECEDENCE = {
  "÷": 2,
  "×": 2,
  "-": 1,
  "+": 1,
} as const satisfies Record<Operator, number>;

export const isDigit = (input: string | undefined): input is Digit =>
  input !== undefined && (DIGITS as readonly string[]).includes(input);
export const isSeparator = (input: string | undefined): input is Separator =>
  input !== undefined && (SEPARATORS as readonly string[]).includes(input);
export const isOperator = (input: string | undefined): input is Operator =>
  input !== undefined && (OPERATORS as readonly string[]).includes(input);
export const isCommand = (input: string | undefined): input is Command =>
  input !== undefined && (COMMANDS as readonly string[]).includes(input);

export const isToken = (input: string): input is Token =>
  isDigit(input) || isSeparator(input) || isOperator(input) || isCommand(input);

export type Expression = Token[];

export type EvaluateRequest = {
  expression: Expression;
};

export type EvaluateResponse = {
  expression: Expression;
};
