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
});
