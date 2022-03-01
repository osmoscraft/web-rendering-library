import { describe, expect, it } from "@osmoscraft/web-testing-library";
import { html } from "../html";

export const testHtml = describe("html", () => {
  it("Render empty input", async () => {
    const template = html``;
    await expect(template.content.childNodes.length).toEqual(0);
  });

  it("Render string", async () => {
    const template = html`hello`;
    await expect(template.content.childNodes.length).toEqual(1);
    await expect(template.content.childNodes[0].nodeType).toEqual(Node.TEXT_NODE);
  });

  it("Trims whitespace", async () => {
    const template = html` <span>hello</span> `;
    await expect(template.content.childNodes.length).toEqual(1);
    await expect(template.content.childNodes[0].nodeType).toEqual(Node.ELEMENT_NODE);
  });

  it("Trims new lines", async () => {
    const template = html`
      <span></span>
      <span></span>
    `;
    await expect(template.content.childNodes.length).toEqual(3);
    await expect(template.content.childNodes[0].nodeType).toEqual(Node.ELEMENT_NODE);
    await expect(template.content.childNodes[1].nodeType).toEqual(Node.TEXT_NODE);
    await expect(template.content.childNodes[2].nodeType).toEqual(Node.ELEMENT_NODE);
  });

  it("Preserves inter-element space", async () => {
    const template = html`<span></span> <span></span>`;
    await expect(template.content.childNodes.length).toEqual(3);
    await expect(template.content.childNodes[1].nodeType).toEqual(Node.TEXT_NODE);
  });
});
