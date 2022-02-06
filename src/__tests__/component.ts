import { describe, expect, it } from "@osmoscraft/web-testing-library";
import { useComponent } from "../component";
import { html } from "../html";
import { cleanup, defineTestElement, setupHtml } from "./fixture";

export const testComponent = describe("Component", () => {
  it("Renders Light DOM", async () => {
    class TestElement1 extends HTMLElement {
      private component = useComponent(this, html`<div>helloworld</div>`, { mode: "none" });
      connectedCallback() {
        this.component.render();
      }
    }

    defineTestElement("component-test-element-1", TestElement1);
    const { container } = setupHtml(`<component-test-element-1></component-test-element-1>`);

    await expect(container.querySelector("component-test-element-1")?.innerHTML).toEqual("<div>helloworld</div>");

    cleanup();
  });

  it("Renders Shadow DOM", async () => {
    class TestElement1 extends HTMLElement {
      private component = useComponent(this, html`<div>helloworld</div>`);
      connectedCallback() {
        this.component.render();
      }
    }

    defineTestElement("component-test-element-2", TestElement1);
    const { container } = setupHtml(`<component-test-element-2></component-test-element-2>`);

    await expect(container.querySelector("component-test-element-2")?.shadowRoot?.innerHTML).toEqual(
      "<div>helloworld</div>"
    );

    cleanup();
  });

  it("Handles binding", async () => {
    class TestElement1 extends HTMLElement {
      private component = useComponent(this, html`<div $text="myVar"></div>`, { mode: "none" });
      connectedCallback() {
        this.component.render({ myVar: "helloworld" });
      }
    }

    defineTestElement("component-test-element-3", TestElement1);
    const { container } = setupHtml(`<component-test-element-3></component-test-element-3>`);

    await expect(container.querySelector<HTMLElement>("component-test-element-3")?.innerText).toEqual("helloworld");

    cleanup();
  });

  it("Handles update", async () => {
    class TestElement1 extends HTMLElement {
      private component = useComponent(this, html`<div $text="myVar"></div>`, { mode: "none" });
      connectedCallback() {
        this.component.render({ myVar: "helloworld" });
        this.component.render({ myVar: "helloworld-updated" });
      }
    }

    defineTestElement("component-test-element-4", TestElement1);
    const { container } = setupHtml(`<component-test-element-4></component-test-element-4>`);

    await expect(container.querySelector<HTMLElement>("component-test-element-4")?.innerText).toEqual(
      "helloworld-updated"
    );

    cleanup();
  });

  it("Handles partial update", async () => {
    class TestElement1 extends HTMLElement {
      private component = useComponent(
        this,
        html`<div id="var1" $text="myVar"></div>
          <div id="var2" $text="myVar2"></div>`,
        { mode: "none" }
      );
      connectedCallback() {
        this.component.render({ myVar: "value1" });
        this.component.render({ myVar2: "value2" });
      }
    }

    defineTestElement("component-test-element-5", TestElement1);
    const { container } = setupHtml(`<component-test-element-5></component-test-element-5>`);

    await expect(container.querySelector<HTMLElement>("#var1")?.innerText).toEqual("value1");
    await expect(container.querySelector<HTMLElement>("#var2")?.innerText).toEqual("value2");

    cleanup();
  });
});