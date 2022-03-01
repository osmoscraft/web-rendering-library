import { describe, expect, it } from "@osmoscraft/web-testing-library";
import { cleanup, setupTemplate } from "./fixture";

export const testTemplatingBasic = describe("Templating/Basic", () => {
  it("Empty template/Render", async () => {
    const { container } = setupTemplate("");

    await expect(container.innerHTML).toEqual("");

    cleanup();
  });

  it("Empty template/Render", async () => {
    const { container, update } = setupTemplate("");

    update();
    await expect(container.innerHTML).toEqual("");

    cleanup();
  });

  it("Static template/Render/Text node", async () => {
    const { container } = setupTemplate("hello world");

    await expect(container.innerHTML).toEqual("hello world");

    cleanup();
  });

  it("Static template/Render/Element node", async () => {
    const { container } = setupTemplate("<span>hello world</span>");

    await expect(container.innerHTML).toEqual("<span>hello world</span>");

    cleanup();
  });

  it("Static template/Render/Element node", async () => {
    const { container } = setupTemplate("<!-- hello world -->");

    await expect(container.innerHTML).toEqual("<!-- hello world -->");

    cleanup();
  });

  it("Static template/Render/Deep", async () => {
    const { container } = setupTemplate("<ul><li>item1</li><li>item2</li></ul>");

    await expect(container.innerHTML).toEqual("<ul><li>item1</li><li>item2</li></ul>");

    cleanup();
  });

  it("Static template/Update", async () => {
    const { container, update } = setupTemplate("hello world");

    update();

    await expect(container.innerHTML).toEqual("hello world");

    cleanup();
  });

  it("Static template/Update/Deep", async () => {
    const { container, update } = setupTemplate("<ul><li>item1</li><li>item2</li></ul>");

    update();

    await expect(container.innerHTML).toEqual("<ul><li>item1</li><li>item2</li></ul>");

    cleanup();
  });

  it("Static template/Update/Persistence", async () => {
    const { container, update } = setupTemplate("<ul><li id='test-node'>item1</li><li>item2</li></ul>");

    const before = container.querySelector("#test-node");

    update();

    const after = container.querySelector("#test-node");

    await expect(!!before && !!after).toEqual(true);
    await expect(before === after).toEqual(true);

    cleanup();
  });
});
