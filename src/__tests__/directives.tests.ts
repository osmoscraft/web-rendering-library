import { describe, expect, it } from "@osmoscraft/web-testing-library";
import { flushAsync, setupTemplate, defineTestElement, cleanup } from "./fixture";

export const testIfDirective = describe("Directives/$if", () => {
  it("true", async () => {
    const { container } = setupTemplate(`<span $if="myVar">hello world</span>`, { myVar: true });

    await expect(container.innerHTML).toEqual(`<!--$if="myVar"--><span $if="myVar">hello world</span>`);

    cleanup();
  });

  it("undefined", async () => {
    const { container } = setupTemplate(`<span $if="myVar">hello world</span>`);

    await expect(container.innerHTML).toEqual(`<!--$if="myVar"-->`);

    cleanup();
  });

  it("false", async () => {
    const { container } = setupTemplate(`<span $if="myVar">hello world</span>`, { myVar: false });

    await expect(container.innerHTML).toEqual(`<!--$if="myVar"-->`);

    cleanup();
  });

  it("false to true", async () => {
    const { container, update } = setupTemplate(`<span $if="myVar">hello world</span >`, { myVar: false });

    update({ myVar: true });

    await expect(container.innerHTML).toEqual(`<!--$if="myVar"--><span $if="myVar">hello world</span>`);

    cleanup();
  });

  it("true to true", async () => {
    const { container, update } = setupTemplate(`<span $if="myVar">hello world</span >`, { myVar: true });

    const before = container.querySelector("span");
    update({ myVar: true });
    const after = container.querySelector("span");

    await expect(container.innerHTML).toEqual(`<!--$if="myVar"--><span $if="myVar">hello world</span>`);
    await expect(!!before && !!after && before === after);

    cleanup();
  });

  it("true to false", async () => {
    const { container, update } = setupTemplate(`<span $if="myVar">hello world</span >`, { myVar: true });

    update({ myVar: false });

    await expect(container.innerHTML).toEqual(`<!--$if="myVar"-->`);

    cleanup();
  });

  it("false to false", async () => {
    const { container, update } = setupTemplate(`<span $if="myVar">hello world</span>`, { myVar: false });

    update({ myVar: false });

    await expect(container.innerHTML).toEqual(`<!--$if="myVar"-->`);

    cleanup();
  });

  it("Mixed", async () => {
    const { container } = setupTemplate(
      [
        `<span $if="myVar">hello world</span>`,
        `<span $if="myOtherVar">hello world</span>`,
        `<span $if="myOtherVar">hello world</span>`,
        `<span $if="myVar">hello world</span>`,
        `<span $if="myVar">hello world</span>`,
      ].join(""),
      { myVar: false, myOtherVar: true }
    );

    await expect(container.innerHTML).toEqual(
      [
        `<!--$if="myVar"-->`,
        `<!--$if="myOtherVar"--><span $if="myOtherVar">hello world</span>`,
        `<!--$if="myOtherVar"--><span $if="myOtherVar">hello world</span>`,
        `<!--$if="myVar"-->`,
        `<!--$if="myVar"-->`,
      ].join("")
    );

    cleanup();
  });

  it("Mixed persistence", async () => {
    const { container, update } = setupTemplate(
      [
        `<div $if="myVar"><div>1</div><div>2</div></div>`,
        `<div id="test-node" $if="myOtherVar"><div>3</div><div>4</div></div>`,
      ].join(""),
      { myVar: false, myOtherVar: true }
    );

    const before = container.querySelector("#test-node");

    await expect(container.innerHTML).toEqual(
      [
        `<!--$if="myVar"-->`,
        `<!--$if="myOtherVar"--><div id="test-node" $if="myOtherVar"><div>3</div><div>4</div></div>`,
      ].join("")
    );

    update({
      myVar: true,
      myOtherVar: true,
    });

    const after = container.querySelector("#test-node");

    await expect(container.innerHTML).toEqual(
      [
        `<!--$if="myVar"--><div $if="myVar"><div>1</div><div>2</div></div>`,
        `<!--$if="myOtherVar"--><div id="test-node" $if="myOtherVar"><div>3</div><div>4</div></div>`,
      ].join("")
    );

    await expect(before === after).toEqual(true);

    cleanup();
  });
});

export const testForDirective = describe("Directives/$for", () => {
  it("Variable undefined", async () => {
    const { container } = setupTemplate(`<li $for="itemVar in arrayVar">hello world</li>`);

    await expect(container.innerHTML).toEqual(`<!--$for="itemVar in arrayVar"-->`);

    cleanup();
  });

  it("Empty array", async () => {
    const { container } = setupTemplate(`<li $for="itemVar in arrayVar">hello world</li>`, { arrayVar: [] });

    await expect(container.innerHTML).toEqual(`<!--$for="itemVar in arrayVar"-->`);

    cleanup();
  });

  it("Empty array/Keyed", async () => {
    const { container } = setupTemplate(`<li $for="itemVar:myKey in arrayVar">hello world</li>`, {
      arrayVar: [],
    });

    await expect(container.innerHTML).toEqual([`<!--$for="itemVar:myKey in arrayVar"-->`].join(""));

    cleanup();
  });

  it("Static items", async () => {
    const { container } = setupTemplate(`<li $for="itemVar in arrayVar">hello world</li>`, { arrayVar: [{}, {}, {}] });

    await expect(container.innerHTML).toEqual(
      [
        `<!--$for="itemVar in arrayVar"-->`,
        `<li $for="itemVar in arrayVar">hello world</li>`,
        `<li $for="itemVar in arrayVar">hello world</li>`,
        `<li $for="itemVar in arrayVar">hello world</li>`,
      ].join("")
    );

    cleanup();
  });

  it("Static items/Keyed", async () => {
    const { container } = setupTemplate(`<li $for="itemVar:myKey in arrayVar">hello world</li>`, {
      arrayVar: [{ myKey: 1 }, { myKey: 2 }, { myKey: 3 }],
    });

    await expect(container.innerHTML).toEqual(
      [
        `<!--$for="itemVar:myKey in arrayVar"-->`,
        `<li $for="itemVar:myKey in arrayVar">hello world</li>`,
        `<li $for="itemVar:myKey in arrayVar">hello world</li>`,
        `<li $for="itemVar:myKey in arrayVar">hello world</li>`,
      ].join("")
    );

    cleanup();
  });

  it("Static items/Duplicated keys", async () => {
    await expect(() => {
      const { container } = setupTemplate(`<li $for="itemVar:myKey in arrayVar">hello world</li>`, {
        arrayVar: [{ myKey: 1 }, { myKey: 2 }, { myKey: 1 }],
      });
    }).toThrow();

    cleanup();
  });

  it("Dynamic items", async () => {
    const { container } = setupTemplate(`<li $for="itemVar in arrayVar" $text="itemVar"></li>`, {
      arrayVar: ["item 1", "item 2", "item 3"],
    });

    await expect(container.innerHTML).toEqual(
      [
        `<!--$for="itemVar in arrayVar"-->`,
        `<li $for="itemVar in arrayVar" $text="itemVar">item 1</li>`,
        `<li $for="itemVar in arrayVar" $text="itemVar">item 2</li>`,
        `<li $for="itemVar in arrayVar" $text="itemVar">item 3</li>`,
      ].join("")
    );

    cleanup();
  });

  it("Parent context", async () => {
    const { container } = setupTemplate(`<li $for="itemVar in arrayVar" $text="parentName"></li>`, {
      arrayVar: [{}, {}],
      parentName: "hello",
    });

    await expect(container.innerHTML).toEqual(
      [
        `<!--$for="itemVar in arrayVar"-->`,
        `<li $for="itemVar in arrayVar" $text="parentName">hello</li>`,
        `<li $for="itemVar in arrayVar" $text="parentName">hello</li>`,
      ].join("")
    );

    cleanup();
  });

  it("Data update", async () => {
    const { container, update } = setupTemplate(`<li $for="itemVar in arrayVar" $text="itemVar"></li>`, {
      arrayVar: ["item 1", "item 2", "item 3"],
    });

    update({
      arrayVar: ["item a", "item b", "item c"],
    });

    await expect(container.innerHTML).toEqual(
      [
        `<!--$for="itemVar in arrayVar"-->`,
        `<li $for="itemVar in arrayVar" $text="itemVar">item a</li>`,
        `<li $for="itemVar in arrayVar" $text="itemVar">item b</li>`,
        `<li $for="itemVar in arrayVar" $text="itemVar">item c</li>`,
      ].join("")
    );

    cleanup();
  });

  it("Add items", async () => {
    const { container, update } = setupTemplate(`<li $for="itemVar in arrayVar" $text="itemVar"></li>`, {
      arrayVar: ["item 1", "item 2"],
    });

    update({
      arrayVar: ["item a", "item b", "item c"],
    });

    await expect(container.innerHTML).toEqual(
      [
        `<!--$for="itemVar in arrayVar"-->`,
        `<li $for="itemVar in arrayVar" $text="itemVar">item a</li>`,
        `<li $for="itemVar in arrayVar" $text="itemVar">item b</li>`,
        `<li $for="itemVar in arrayVar" $text="itemVar">item c</li>`,
      ].join("")
    );

    cleanup();
  });

  it("Remove items", async () => {
    const { container, update } = setupTemplate(`<li $for="itemVar in arrayVar" $text="itemVar"></li>`, {
      arrayVar: ["item 1", "item 2", "item 3"],
    });

    update({
      arrayVar: ["item a", "item b"],
    });

    await expect(container.innerHTML).toEqual(
      [
        `<!--$for="itemVar in arrayVar"-->`,
        `<li $for="itemVar in arrayVar" $text="itemVar">item a</li>`,
        `<li $for="itemVar in arrayVar" $text="itemVar">item b</li>`,
      ].join("")
    );

    cleanup();
  });

  it("Node persistency with keys/Data update", async () => {
    const { container, update } = setupTemplate(`<li $for="itemVar:id in arrayVar" $text="itemVar.text"></li>`, {
      arrayVar: [
        {
          id: 1,
          text: "item 1",
        },
        {
          id: 2,
          text: "item 2",
        },
      ],
    });

    const [firstNodeBefore, secondNodeBefore] = [...container.querySelectorAll("li")];

    update({
      arrayVar: [
        {
          id: 1,
          text: "item a",
        },
        {
          id: 2,
          text: "item b",
        },
      ],
    });

    const [firstNodeAfter, secondNodeAfter] = [...container.querySelectorAll("li")];

    await expect(container.innerHTML).toEqual(
      [
        `<!--$for="itemVar:id in arrayVar"-->`,
        `<li $for="itemVar:id in arrayVar" $text="itemVar.text">item a</li>`,
        `<li $for="itemVar:id in arrayVar" $text="itemVar.text">item b</li>`,
      ].join("")
    );

    await expect(firstNodeBefore === firstNodeAfter).toEqual(true);
    await expect(secondNodeBefore === secondNodeAfter).toEqual(true);

    cleanup();
  });

  it("Node persistency with keys/Reorder", async () => {
    const { container, update } = setupTemplate(`<li $for="itemVar:id in arrayVar" $text="itemVar.text"></li>`, {
      arrayVar: [
        {
          id: 1,
          text: "item 1",
        },
        {
          id: 2,
          text: "item 2",
        },
      ],
    });

    const [firstNodeBefore, secondNodeBefore] = [...container.querySelectorAll("li")];

    update({
      arrayVar: [
        {
          id: 2,
          text: "item 2",
        },
        {
          id: 1,
          text: "item 1",
        },
      ],
    });

    const [firstNodeAfter, secondNodeAfter] = [...container.querySelectorAll("li")];

    await expect(container.innerHTML).toEqual(
      [
        `<!--$for="itemVar:id in arrayVar"-->`,
        `<li $for="itemVar:id in arrayVar" $text="itemVar.text">item 2</li>`,
        `<li $for="itemVar:id in arrayVar" $text="itemVar.text">item 1</li>`,
      ].join("")
    );

    await expect(firstNodeBefore === secondNodeAfter).toEqual(true);
    await expect(secondNodeBefore === firstNodeAfter).toEqual(true);

    cleanup();
  });

  it("Node persistency with keys/Prepend", async () => {
    const { container, update } = setupTemplate(`<li $for="itemVar:id in arrayVar" $text="itemVar.text"></li>`, {
      arrayVar: [
        {
          id: 1,
          text: "item 1",
        },
        {
          id: 2,
          text: "item 2",
        },
      ],
    });

    const [firstNodeBefore, secondNodeBefore] = [...container.querySelectorAll("li")];

    update({
      arrayVar: [
        {
          id: 99,
          text: "item 99",
        },
        {
          id: 1,
          text: "item 1",
        },
        {
          id: 2,
          text: "item 2",
        },
      ],
    });

    const [_firstNodeAfter, secondNodeAfter, thirdNodeAfter] = [...container.querySelectorAll("li")];

    await expect(container.innerHTML).toEqual(
      [
        `<!--$for="itemVar:id in arrayVar"-->`,
        `<li $for="itemVar:id in arrayVar" $text="itemVar.text">item 99</li>`,
        `<li $for="itemVar:id in arrayVar" $text="itemVar.text">item 1</li>`,
        `<li $for="itemVar:id in arrayVar" $text="itemVar.text">item 2</li>`,
      ].join("")
    );

    await expect(firstNodeBefore === secondNodeAfter).toEqual(true);
    await expect(secondNodeBefore === thirdNodeAfter).toEqual(true);

    cleanup();
  });

  it("Minimum mutation with keys/Insert", async () => {
    const changeRecord: any[] = [];

    defineTestElement(
      "test-node-01",
      class TestNode01 extends HTMLElement {
        connectedCallback() {
          changeRecord.push("connected");
        }
      }
    );

    const { update } = setupTemplate(
      `<test-node-01 $for="itemVar:id in arrayVar" $text="itemVar.text"></test-node-01>`,
      {
        arrayVar: [
          {
            id: 1,
            text: "item 1",
          },
          {
            id: 2,
            text: "item 2",
          },
        ],
      }
    );

    await expect(changeRecord.length).toEqual(2);

    update({
      arrayVar: [
        {
          id: 99,
          text: "item 99",
        },
        {
          id: 1,
          text: "item 1",
        },
        {
          id: 2,
          text: "item 2",
        },
      ],
    });

    await expect(changeRecord.length).toEqual(3); // 1 new insertion

    cleanup();
  });

  it("Node persistency with keys/Mixed operations", async () => {
    const { container, update } = setupTemplate(`<li $for="itemVar:id in arrayVar" $text="itemVar.text"></li>`, {
      arrayVar: [
        {
          id: 1,
          text: "item 1",
        },
        {
          id: 2,
          text: "item 2",
        },
        {
          id: 3,
          text: "item 3",
        },
        {
          id: 4,
          text: "item 4",
        },
      ],
    });

    const [firstNodeBefore, _secondNodeBefore, thirdNodeBefore, fourthNodeBefore] = [
      ...container.querySelectorAll("li"),
    ];

    update({
      arrayVar: [
        {
          id: 1,
          text: "item a", // update
        },
        // id 2 remove
        {
          id: 99,
          text: "item 99", // insert
        },
        {
          id: 4,
          text: "item d", // reorder + update
        },
        {
          id: 3,
          text: "item 3", // reorder
        },
      ],
    });

    const [firstNodeAfter, _secondNodeAfter, thirdNodeAfter, fourthNodeAfter] = [...container.querySelectorAll("li")];

    await expect(container.innerHTML).toEqual(
      [
        `<!--$for="itemVar:id in arrayVar"-->`,
        `<li $for="itemVar:id in arrayVar" $text="itemVar.text">item a</li>`,
        `<li $for="itemVar:id in arrayVar" $text="itemVar.text">item 99</li>`,
        `<li $for="itemVar:id in arrayVar" $text="itemVar.text">item d</li>`,
        `<li $for="itemVar:id in arrayVar" $text="itemVar.text">item 3</li>`,
      ].join("")
    );

    await expect(firstNodeBefore === firstNodeAfter).toEqual(true);
    await expect(thirdNodeBefore === fourthNodeAfter).toEqual(true);
    await expect(fourthNodeBefore === thirdNodeAfter).toEqual(true);

    cleanup();
  });
});

export const testTextDirective = describe("Directives/$text", () => {
  it("Variable undefined", async () => {
    const { container } = setupTemplate(`<p $text="myVar"></p>`);

    await expect(container.innerHTML).toEqual(`<p $text="myVar"></p>`);

    cleanup();
  });

  it("string", async () => {
    const { container } = setupTemplate(`<p $text="myVar"></p>`, { myVar: "hello world" });

    await expect(container.innerHTML).toEqual(`<p $text="myVar">hello world</p>`);

    cleanup();
  });

  it("string/Update", async () => {
    const { container, update } = setupTemplate(`<p $text="myVar"></p>`, { myVar: "hello world" });

    update({ myVar: "hello new world" });
    await expect(container.innerHTML).toEqual(`<p $text="myVar">hello new world</p>`);

    cleanup();
  });
});

export const testModelDirective = describe("Directives/$model", () => {
  it("Unsupported element", async () => {
    await expect(() => {
      const { container } = setupTemplate(`<div $model="myVar"></div>`);
    }).toThrow();

    cleanup();
  });

  it("input/undefined", async () => {
    const { container } = setupTemplate(`<input $model="myVar"></div>`);

    await expect(container.querySelector("input")!.value).toEqual("");

    cleanup();
  });

  it("input/string", async () => {
    const { container } = setupTemplate(`<input $model="myVar"></div>`, { myVar: "hello" });

    await expect(container.querySelector("input")!.value).toEqual("hello");

    cleanup();
  });

  it("input/string/Persistence", async () => {
    const { container, update } = setupTemplate(`<input $model="myVar"></div>`, { myVar: "hello" });

    const input = container.querySelector("input")!;
    input.focus();
    input.setSelectionRange(1, 2);

    update({
      myVar: "hello",
    });

    await expect(container.querySelector("input")!.value).toEqual("hello");
    await expect([input.selectionStart, input.selectionEnd]).toEqual([1, 2]);

    cleanup();
  });

  it("input/string/Update", async () => {
    const { container, update } = setupTemplate(`<input $model="myVar"></div>`, { myVar: "hello" });

    update({
      myVar: "hello2",
    });

    await expect(container.querySelector("input")!.value).toEqual("hello2");

    cleanup();
  });

  it("input/number", async () => {
    const { container } = setupTemplate(`<input $model="myVar"></div>`, { myVar: 100 });

    await expect(container.querySelector("input")!.value).toEqual("100");

    cleanup();
  });

  it("textarea/string", async () => {
    const { container } = setupTemplate(`<textarea $model="myVar"></textarea>`, { myVar: "hello" });

    await expect(container.querySelector("textarea")!.value).toEqual("hello");

    cleanup();
  });

  it("select/string", async () => {
    const { container } = setupTemplate(
      `<select $model="myVar"><option value="1">a</option><option value="2">b</option></select>`,
      { myVar: "2" }
    );

    await expect(container.querySelector("select")!.value).toEqual("2");
    await expect(container.querySelector("select")!.selectedIndex).toEqual(1);

    cleanup();
  });

  it("checkbox/undefined", async () => {
    const { container } = setupTemplate(`<input type="checkbox" $model="myVar" />`);

    await expect(container.querySelector("input")!.checked).toEqual(false);

    cleanup();
  });

  it("checkbox/true", async () => {
    const { container } = setupTemplate(`<input type="checkbox" $model="myVar" />`, { myVar: true });

    await expect(container.querySelector("input")!.checked).toEqual(true);

    cleanup();
  });

  it("checkbox/false", async () => {
    const { container } = setupTemplate(`<input type="checkbox" $model="myVar" />`, { myVar: false });

    await expect(container.querySelector("input")!.checked).toEqual(false);

    cleanup();
  });

  it("checkbox/Persist", async () => {
    const { container, update } = setupTemplate(`<input type="checkbox" $model="myVar" />`, { myVar: true });

    update({
      myVar: true,
    });

    await expect(container.querySelector("input")!.checked).toEqual(true);

    cleanup();
  });

  it("checkbox/Update", async () => {
    const { container, update } = setupTemplate(`<input type="checkbox" $model="myVar" />`, { myVar: true });

    update({
      myVar: false,
    });

    await expect(container.querySelector("input")!.checked).toEqual(false);

    cleanup();
  });

  it("radio/undefined", async () => {
    const { container } = setupTemplate(`<input type="radio" $model="myVar" />`);

    await expect(container.querySelector("input")!.checked).toEqual(false);

    cleanup();
  });

  it("radio/Not selected", async () => {
    const { container } = setupTemplate(`<input name="test" type="radio" value="option1" $model="myVar" />`, {
      myVar: "option2",
    });

    await expect(container.querySelector("input")!.checked).toEqual(false);

    cleanup();
  });

  it("radio/Selected", async () => {
    const { container } = setupTemplate(`<input name="test" type="radio" value="option1" $model="myVar" />`, {
      myVar: "option1",
    });

    await expect(container.querySelector("input")!.checked).toEqual(true);

    cleanup();
  });

  it("radio/Multiple", async () => {
    const { container } = setupTemplate(
      `<input name="test" type="radio" value="option1" $model="myVar" /><input name="test" type="radio" value="option2" $model="myVar" />`,
      {
        myVar: "option1",
      }
    );

    await expect(container.querySelector<HTMLInputElement>(`input[value="option1"]`)!.checked).toEqual(true);
    await expect(container.querySelector<HTMLInputElement>(`input[value="option2"]`)!.checked).toEqual(false);

    cleanup();
  });

  it("radio/Multiple/Dynamic value", async () => {
    const { container } = setupTemplate(
      `<input name="test" type="radio" :value="value1" $model="myVar" /><input name="test" type="radio" :value="value2" $model="myVar" />`,
      {
        value1: "option1",
        value2: "option2",
        myVar: "option1",
      }
    );

    await expect(container.querySelector<HTMLInputElement>(`input[value="option1"]`)!.checked).toEqual(true);
    await expect(container.querySelector<HTMLInputElement>(`input[value="option2"]`)!.checked).toEqual(false);

    cleanup();
  });
});

export const testAttrBindingDirective = describe("Directives/:<attr>", () => {
  it("Bind/undefined", async () => {
    const { container } = setupTemplate(`<div :id="myVar"></div>`);

    await expect(container.innerHTML).toEqual(`<div :id="myVar"></div>`);

    cleanup();
  });

  it("Bind/string", async () => {
    const { container } = setupTemplate(`<div :id="myVar"></div>`, { myVar: "hello" });

    await expect(container.innerHTML).toEqual(`<div :id="myVar" id="hello"></div>`);

    cleanup();
  });

  it("Bind/string/Persistence", async () => {
    const changeRecord: any[] = [];

    const observer = new MutationObserver((mutationsList) => {
      changeRecord.push(...mutationsList.map((record) => record.attributeName));
      console.log(changeRecord);
    });

    const { container, update } = setupTemplate(`<div :id="myVar"></div>`, { myVar: "hello" });
    await expect(container.innerHTML).toEqual(`<div :id="myVar" id="hello"></div>`);

    observer.observe(container.querySelector("div")!, {
      attributeFilter: ["id"],
    });

    update({ myVar: "hello" });

    await flushAsync();

    await expect(changeRecord).toEqual([]);
    await expect(container.innerHTML).toEqual(`<div :id="myVar" id="hello"></div>`);

    observer.disconnect();
    cleanup();
  });

  it("Bind/string/Update", async () => {
    const changeRecord: any[] = [];

    const observer = new MutationObserver((mutationsList) => {
      changeRecord.push(...mutationsList.map((record) => record.attributeName));
    });

    const { container, update } = setupTemplate(`<div :id="myVar"></div>`, { myVar: "hello" });
    await expect(container.innerHTML).toEqual(`<div :id="myVar" id="hello"></div>`);

    observer.observe(container.querySelector("div")!, {
      attributeFilter: ["id"],
    });

    update({ myVar: "hello2" });

    await flushAsync();

    await expect(changeRecord).toEqual(["id"]);
    await expect(container.innerHTML).toEqual(`<div :id="myVar" id="hello2"></div>`);

    observer.disconnect();
    cleanup();
  });

  it("Bind/string/Remove", async () => {
    const changeRecord: any[] = [];

    const observer = new MutationObserver((mutationsList) => {
      changeRecord.push(...mutationsList.map((record) => record.attributeName));
    });

    const { container, update } = setupTemplate(`<div :id="myVar"></div>`, { myVar: "hello" });
    await expect(container.innerHTML).toEqual(`<div :id="myVar" id="hello"></div>`);

    observer.observe(container.querySelector("div")!, {
      attributeFilter: ["id"],
    });

    update({ myVar: undefined });

    await flushAsync();

    await expect(changeRecord).toEqual(["id"]);
    await expect(container.innerHTML).toEqual(`<div :id="myVar"></div>`);

    observer.disconnect();
    cleanup();
  });

  it("Bind/string/Remount", async () => {
    const changeRecord: any[] = [];

    const observer = new MutationObserver((mutationsList) => {
      changeRecord.push(...mutationsList.map((record) => record.attributeName));
    });

    const { container, update } = setupTemplate(`<div :id="myVar"></div>`, { myVar: "hello" });
    await expect(container.innerHTML).toEqual(`<div :id="myVar" id="hello"></div>`);

    observer.observe(container.querySelector("div")!, {
      attributeFilter: ["id"],
    });

    update({ myVar: undefined });
    update({ myVar: "hello" });

    await flushAsync();

    await expect(changeRecord).toEqual(["id", "id"]);
    await expect(container.innerHTML).toEqual(`<div :id="myVar" id="hello"></div>`);

    observer.disconnect();
    cleanup();
  });
});

export const testEventBindingDirective = describe("Directives/@event", () => {
  it("Bind/undefined", async () => {
    const { container } = setupTemplate(`<button @click="myHandler"></button>`);

    await expect(container.innerHTML).toEqual(`<button @click="myHandler"></button>`);

    cleanup();
  });

  it("Bind/non-function", async () => {
    await expect(() => {
      setupTemplate(`<button @click="myHandler"></button>`, { myHandler: 100 });
    }).toThrow();

    cleanup();
  });

  it("Bind/function", async () => {
    const handlingRecords: string[] = [];
    const { container } = setupTemplate(`<button @click="myHandler"></button>`, {
      myHandler: () => handlingRecords.push("fired"),
    });

    await expect(container.innerHTML).toEqual(`<button @click="myHandler"></button>`);
    container.querySelector("button")!.click();
    await expect(handlingRecords).toEqual(["fired"]);

    cleanup();
  });

  it("Bind/function/this", async () => {
    const handlingRecords: any[] = [];
    const { container } = setupTemplate(`<button @click="myHandler"></button>`, {
      myHandler: function () {
        handlingRecords.push(this);
      },
    });

    await expect(container.innerHTML).toEqual(`<button @click="myHandler"></button>`);
    container.querySelector("button")!.click();
    await expect(handlingRecords[0] === container.querySelector("button")).toEqual(true);

    cleanup();
  });

  it("Bind/function/args", async () => {
    const handlingRecords: any[] = [];
    const { container } = setupTemplate(`<button @click="myHandler"></button>`, {
      myHandler: (e: Event) => handlingRecords.push(e.target),
    });

    await expect(container.innerHTML).toEqual(`<button @click="myHandler"></button>`);
    container.querySelector("button")!.click();
    await expect(handlingRecords[0] === container.querySelector("button")).toEqual(true);

    cleanup();
  });

  it("Bind/function/Persistence", async () => {
    const handlingRecords: string[] = [];

    const reusedHandler = () => handlingRecords.push("fired");

    const { container, update } = setupTemplate(`<button @click="myHandler"></button>`, {
      myHandler: reusedHandler,
    });

    await update({
      myHandler: reusedHandler,
    });

    await expect(container.innerHTML).toEqual(`<button @click="myHandler"></button>`);
    container.querySelector("button")!.click();
    await expect(handlingRecords).toEqual(["fired"]); // no double handling

    cleanup();
  });

  it("Bind/function/Update", async () => {
    const handlingRecords: string[] = [];

    const { container, update } = setupTemplate(`<button @click="myHandler"></button>`, {
      myHandler: () => handlingRecords.push("fired-A"),
    });

    await update({
      myHandler: () => handlingRecords.push("fired-B"),
    });

    await expect(container.innerHTML).toEqual(`<button @click="myHandler"></button>`);
    container.querySelector("button")!.click();
    await expect(handlingRecords).toEqual(["fired-B"]);

    cleanup();
  });

  it("Bind/function/Remove", async () => {
    const handlingRecords: string[] = [];

    const { container, update } = setupTemplate(`<button @click="myHandler"></button>`, {
      myHandler: () => handlingRecords.push("fired"),
    });

    await update({
      myHandler: undefined,
    });

    await expect(container.innerHTML).toEqual(`<button @click="myHandler"></button>`);
    container.querySelector("button")!.click();
    await expect(handlingRecords).toEqual([]);

    cleanup();
  });

  it("Bind/function/Remount", async () => {
    const handlingRecords: string[] = [];

    const reusedHandler = () => handlingRecords.push("fired");

    const { container, update } = setupTemplate(`<button @click="myHandler"></button>`, {
      myHandler: reusedHandler,
    });

    await update({
      myHandler: undefined,
    });

    await update({
      myHandler: reusedHandler,
    });

    await expect(container.innerHTML).toEqual(`<button @click="myHandler"></button>`);
    container.querySelector("button")!.click();
    await expect(handlingRecords).toEqual(["fired"]);

    cleanup();
  });
});
