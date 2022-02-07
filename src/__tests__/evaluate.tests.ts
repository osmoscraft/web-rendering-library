import { describe, expect, it } from "@osmoscraft/web-testing-library";
import { evaluate } from "../evaluate";

export const testEvaluate = describe("Evaluate", () => {
  it("Blank expression", async () => {
    await expect(evaluate("")).toEqual(undefined);
  });

  it("Variable/Non-exist", async () => {
    await expect(evaluate("myVar")).toEqual(undefined);
  });

  it("Variable/string", async () => {
    await expect(
      evaluate("myVar", {
        myVar: "hello",
      })
    ).toEqual("hello");
  });

  it("Variable/number", async () => {
    await expect(
      evaluate("myVar", {
        myVar: 42,
      })
    ).toEqual(42);
  });

  it("Variable/boolean/Negation", async () => {
    await expect(
      evaluate("!myVar", {
        myVar: false,
      })
    ).toEqual(true);
  });

  it("Variable/boolean/Double negation", async () => {
    await expect(
      evaluate("!!myVar", {
        myVar: false,
      })
    ).toEqual(false);
  });

  it("Variable/boolean/Triple negation", async () => {
    await expect(
      evaluate("!!!myVar", {
        myVar: true,
      })
    ).toEqual(false);
  });

  it("Variable/boolean", async () => {
    await expect(
      evaluate("myVar", {
        myVar: true,
      })
    ).toEqual(true);
  });

  it("Variable/Chaining", async () => {
    await expect(
      evaluate("container.child", {
        container: {
          child: "test",
        },
      })
    ).toEqual("test");
  });

  it("Variable/Chaining/Negation", async () => {
    await expect(
      evaluate("!container.child", {
        container: {
          child: false,
        },
      })
    ).toEqual(true);
  });

  it("Expression/Boolean primitive", async () => {
    await expect(evaluate("true === true", {})).toEqual(true);
    await expect(evaluate("true === false", {})).toEqual(false);
    await expect(evaluate("true !== true", {})).toEqual(false);
    await expect(evaluate("true !== false", {})).toEqual(true);
    await expect(evaluate("!true !== !false", {})).toEqual(true);
    await expect(evaluate("true === myBool", { myBool: true })).toEqual(true);
    await expect(evaluate("true !== myBool", { myBool: true })).toEqual(false);
    await expect(evaluate("myBool !== myOtherBool", { myBool: true, myOtherBool: false })).toEqual(true);
  });

  it("Expression/Nullish primitive", async () => {
    await expect(evaluate("null == null", {})).toEqual(true);
    await expect(evaluate("undefined == undefined", {})).toEqual(true);
    await expect(evaluate("null == undefined", {})).toEqual(true);
    await expect(evaluate("!null == true", {})).toEqual(true);
    await expect(evaluate("!undefined == true", {})).toEqual(true);
  });

  it("Expression/Integer primitive", async () => {
    await expect(evaluate("1 === 1", {})).toEqual(true);
    await expect(evaluate("1 !== 1", {})).toEqual(false);
    await expect(evaluate("1 > 0", {})).toEqual(true);
    await expect(evaluate("myVar < 0", { myVar: -1 })).toEqual(true);
    await expect(evaluate("myVar <= -1", { myVar: -1 })).toEqual(true);
  });

  it("Expression/String primitive", async () => {
    await expect(evaluate(`"hello" === "hello"`, {})).toEqual(true);
    await expect(evaluate(`'hello' === "hello"`, {})).toEqual(true);
    await expect(evaluate(`"hello" !== "hello"`, {})).toEqual(false);
    await expect(evaluate(`'hello' !== 'hello'`, {})).toEqual(false);
    await expect(evaluate(`myVar === "hello"`, { myVar: "hello" })).toEqual(true);
    await expect(evaluate(`myVar === 'hello'`, { myVar: "hello" })).toEqual(true);
    await expect(evaluate(`myVar === 'he"llo'`, { myVar: 'he"llo' })).toEqual(true);
    await expect(evaluate(`myVar === "he'llo"`, { myVar: "he'llo" })).toEqual(true);
    await expect(evaluate(`myVar === myOtherVar`, { myVar: "hello", myOtherVar: "world" })).toEqual(false);
    await expect(evaluate(`myVar === myOtherVar`, { myVar: "hello", myOtherVar: "hello" })).toEqual(true);
  });
});
