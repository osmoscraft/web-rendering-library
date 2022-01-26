import { describe, expect, it } from "@osmoscraft/web-testing-library";
import { cleanup, setup } from "./fixture";

export const testTemplatingBasic = describe("Templating/Basic", () => {
  it("Empty template/Render", async () => {
    const { container } = setup("");

    await expect(container.innerHTML).toEqual("");

    cleanup();
  });

  it("Empty template/Render", async () => {
    const { container, update } = setup("");

    update();
    await expect(container.innerHTML).toEqual("");

    cleanup();
  });

  it("Static template/Render", async () => {
    const { container } = setup("hello world");

    await expect(container.innerHTML).toEqual("hello world");

    cleanup();
  });

  it("Static template/Render/Deep", async () => {
    const { container } = setup("<ul><li>item1</li><li>item2</li></ul>");

    await expect(container.innerHTML).toEqual("<ul><li>item1</li><li>item2</li></ul>");

    cleanup();
  });

  it("Static template/Update", async () => {
    const { container, update } = setup("hello world");

    update();

    await expect(container.innerHTML).toEqual("hello world");

    cleanup();
  });

  it("Static template/Update/Deep", async () => {
    const { container, update } = setup("<ul><li>item1</li><li>item2</li></ul>");

    update();

    await expect(container.innerHTML).toEqual("<ul><li>item1</li><li>item2</li></ul>");

    cleanup();
  });

  it("Static template/Update/Persistence", async () => {
    const { container, update } = setup("<ul><li id='test-node'>item1</li><li>item2</li></ul>");

    const before = container.querySelector("#test-node");

    update();

    const after = container.querySelector("#test-node");

    await expect(!!before && !!after).toEqual(true);
    await expect(before === after).toEqual(true);

    cleanup();
  });
});
