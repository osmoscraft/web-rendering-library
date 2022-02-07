const BINARY_BOOL_EXP_PATTERN = /^(.+?)(===?|!==?|&&|\|\||<=?|>=?)(.+)$/;
const INT_EXP_PATTERN = /^(-|\+)?\d+$/;
const STRING_PATTERN = /^(?:"(.*)"|'(.*)')$/;

export function evaluate(expression: string, context?: any) {
  const raw = expression.trim();

  const [_full, operandL, operator, operandR] = expression.match(BINARY_BOOL_EXP_PATTERN) ?? [];

  // unary
  if (!_full) return evaluateUnary(raw, context);

  return evaluteBinaryBooleanExpression(operator, evaluateUnary(operandL, context), evaluateUnary(operandR, context));
}

function evaluateUnary(expression: string, context?: any) {
  const raw = expression.trim();

  const negationCount = raw.match(/^!+/)?.[0].length ?? 0;

  const postNegationRaw = raw.slice(negationCount);
  const postNegationValue = evaluatePostNegationRaw(postNegationRaw, context);

  return negate(postNegationValue, negationCount);
}

function evaluatePostNegationRaw(expression: string, context?: any) {
  switch (expression) {
    case "true":
      return true;
    case "false":
      return false;
    case "null":
      return null;
    case "undefined":
      return undefined;
    default:
      const intExp = expression.match(INT_EXP_PATTERN)?.[0];
      if (intExp !== undefined) return Number(intExp);

      const stringMatch = expression.match(STRING_PATTERN);
      const stringExp = stringMatch?.[1] ?? stringMatch?.[2];
      if (stringExp !== undefined) return String(stringExp);

      // assuming not a primitive, evaluate as variable
      const expressionPath = expression.split(".");
      const value = expressionPath.reduce((value, path) => {
        return value?.[path];
      }, context);

      return value;
  }
}

function negate(value, negationCount) {
  return negationCount > 0 ? (negationCount % 2 ? !value : !!value) : value;
}

function evaluteBinaryBooleanExpression(operator, operandL, operandR): boolean {
  switch (operator) {
    case "===":
      return operandL === operandR;
    case "!==":
      return operandL !== operandR;
    case "==":
      return operandL == operandR;
    case "!=":
      return operandL != operandR;
    case "&&":
      return operandL && operandR;
    case "||":
      return operandL || operandR;
    case "<=":
      return operandL <= operandR;
    case "<":
      return operandL < operandR;
    case ">=":
      return operandL >= operandR;
    case ">":
      return operandL >= operandR;
    default:
      throw new Error(`Invalid operator: ${operator}`);
  }
}
