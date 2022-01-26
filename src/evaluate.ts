export function evaluate(expression: string, context?: any) {
  const raw = expression.trim();
  const isNegation = raw[0] === "!";
  const expressionPath = raw.slice(isNegation ? 1 : 0).split(".");

  const value = expressionPath.reduce((value, path) => {
    return value?.[path];
  }, context);

  return isNegation ? !value : value;
}
