import { describe, expect, it } from "@osmoscraft/web-testing-library";
import { useComponent } from "../component";
import { html } from "../html";
import { cleanup, defineTestElement, setupHtml } from "./fixture";

export const testComponent = describe("Component", () => {
  it("Renders Light DOM", async () => {
    class TestElement extends HTMLElement {
      private component = useComponent(html`<div>helloworld</div>`, this, { mode: "none" });
      connectedCallback() {
        this.component.render();
      }
    }

    defineTestElement("component-test-element-1", TestElement);
    const { container } = setupHtml(`<component-test-element-1></component-test-element-1>`);

    await expect(container.querySelector("component-test-element-1")?.innerHTML).toEqual("<div>helloworld</div>");

    cleanup();
  });

  it("Renders Shadow DOM", async () => {
    class TestElement extends HTMLElement {
      private component = useComponent(html`<div>helloworld</div>`, this);
      connectedCallback() {
        this.component.render();
      }
    }

    defineTestElement("component-test-element-2", TestElement);
    const { container } = setupHtml(`<component-test-element-2></component-test-element-2>`);

    await expect(container.querySelector("component-test-element-2")?.shadowRoot?.innerHTML).toEqual(
      "<div>helloworld</div>"
    );

    cleanup();
  });

  it("Handles binding", async () => {
    class TestElement extends HTMLElement {
      private component = useComponent(html`<div $text="myVar"></div>`, this, { mode: "none" });
      connectedCallback() {
        this.component.render({ myVar: "helloworld" });
      }
    }

    defineTestElement("component-test-element-3", TestElement);
    const { container } = setupHtml(`<component-test-element-3></component-test-element-3>`);

    await expect(container.querySelector<HTMLElement>("component-test-element-3")?.innerText).toEqual("helloworld");

    cleanup();
  });

  it("Handles update", async () => {
    class TestElement extends HTMLElement {
      private component = useComponent(html`<div $text="myVar"></div>`, this, { mode: "none" });
      connectedCallback() {
        this.component.render({ myVar: "helloworld" });
        this.component.render({ myVar: "helloworld-updated" });
      }
    }

    defineTestElement("component-test-element-4", TestElement);
    const { container } = setupHtml(`<component-test-element-4></component-test-element-4>`);

    await expect(container.querySelector<HTMLElement>("component-test-element-4")?.innerText).toEqual(
      "helloworld-updated"
    );

    cleanup();
  });

  it("Handles partial update", async () => {
    class TestElement extends HTMLElement {
      private component = useComponent(
        html`<div id="var1" $text="myVar"></div>
          <div id="var2" $text="myVar2"></div>`,
        this,
        { mode: "none" }
      );
      connectedCallback() {
        this.component.render({ myVar: "value1" });
        this.component.render({ myVar2: "value2" });
      }
    }

    defineTestElement("component-test-element-5", TestElement);
    const { container } = setupHtml(`<component-test-element-5></component-test-element-5>`);

    await expect(container.querySelector<HTMLElement>("#var1")?.innerText).toEqual("value1");
    await expect(container.querySelector<HTMLElement>("#var2")?.innerText).toEqual("value2");

    cleanup();
  });

  it("Get empty to data before render", async () => {
    const dataRecords: any[] = [];

    class TestElement extends HTMLElement {
      private component = useComponent(html``, this, { mode: "none" });
      connectedCallback() {
        dataRecords.push(JSON.stringify(this.component.getData()));
        this.component.render({ myVar: "value1" });
      }
    }

    defineTestElement("component-test-element-6", TestElement);
    const { container } = setupHtml(`<component-test-element-6></component-test-element-6>`);

    await expect(dataRecords.length).toEqual(1);
    await expect(dataRecords[0]).toEqual(JSON.stringify({}));

    cleanup();
  });

  it("Get data after initial render", async () => {
    const dataRecords: any[] = [];

    class TestElement extends HTMLElement {
      private component = useComponent(html``, this, { mode: "none" });
      connectedCallback() {
        this.component.render({ myVar: "value1" });
        dataRecords.push(JSON.stringify(this.component.getData()));
      }
    }

    defineTestElement("component-test-element-7", TestElement);
    const { container } = setupHtml(`<component-test-element-7></component-test-element-7>`);

    await expect(dataRecords.length).toEqual(1);
    await expect(dataRecords[0]).toEqual(JSON.stringify({ myVar: "value1" }));

    cleanup();
  });

  it("Get data after update", async () => {
    const dataRecords: any[] = [];

    class TestElement extends HTMLElement {
      private component = useComponent(html``, this, { mode: "none" });
      connectedCallback() {
        this.component.render({ myVar: "value1" });
        this.component.render({ myVar2: "value2" });
        dataRecords.push(JSON.stringify(this.component.getData()));
      }
    }

    defineTestElement("component-test-element-8", TestElement);
    const { container } = setupHtml(`<component-test-element-8></component-test-element-8>`);

    await expect(dataRecords.length).toEqual(1);
    await expect(dataRecords[0]).toEqual(JSON.stringify({ myVar: "value1", myVar2: "value2" }));

    cleanup();
  });

  it("Patch data before render", async () => {
    const dataRecords: any[] = [];

    class TestElement extends HTMLElement {
      private component = useComponent(html``, this, { mode: "none" });
      connectedCallback() {
        this.component.patchData({ myVar: "value1" });
        dataRecords.push(JSON.stringify(this.component.getData()));
      }
    }

    defineTestElement("component-test-element-9", TestElement);
    const { container } = setupHtml(`<component-test-element-9></component-test-element-9>`);

    await expect(dataRecords.length).toEqual(1);
    await expect(dataRecords[0]).toEqual(JSON.stringify({ myVar: "value1" }));

    cleanup();
  });

  it("Patch multiple data before render", async () => {
    const dataRecords: any[] = [];

    class TestElement extends HTMLElement {
      private component = useComponent(html``, this, { mode: "none" });
      connectedCallback() {
        this.component.patchData({ myVar: "value1" });
        this.component.patchData({ myVar2: "value2" });
        dataRecords.push(JSON.stringify(this.component.getData()));
      }
    }

    defineTestElement("component-test-element-10", TestElement);
    const { container } = setupHtml(`<component-test-element-10></component-test-element-10>`);

    await expect(dataRecords.length).toEqual(1);
    await expect(dataRecords[0]).toEqual(JSON.stringify({ myVar: "value1", myVar2: "value2" }));

    cleanup();
  });

  it("Patch data after render", async () => {
    const dataRecords: any[] = [];

    class TestElement extends HTMLElement {
      private component = useComponent(html``, this, { mode: "none" });
      connectedCallback() {
        this.component.patchData({ myVar: "value1" });
        this.component.render({ myVar2: "value2" });
        this.component.patchData({ myVar2: "value2-patch" });
        dataRecords.push(JSON.stringify(this.component.getData()));
      }
    }

    defineTestElement("component-test-element-11", TestElement);
    const { container } = setupHtml(`<component-test-element-11></component-test-element-11>`);

    await expect(dataRecords.length).toEqual(1);
    await expect(dataRecords[0]).toEqual(JSON.stringify({ myVar: "value1", myVar2: "value2-patch" }));

    cleanup();
  });

  it("Renders in memory", async () => {
    const renderRecords: string[] = [];

    class TestElement extends HTMLElement {
      static get observedAttributes() {
        return ["data-my-attr"];
      }

      private component = useComponent(html`<div $text="myVar"></div>`, this, { mode: "none" });

      attributeChangedCallback() {
        renderRecords.push("attr");
        this.component.render({ myVar: this.getAttribute("data-my-attr") });
      }

      connectedCallback() {
        renderRecords.push("connect");
      }
    }

    defineTestElement("component-test-element-12", TestElement);
    const inMemoryDom = document.createElement("div");
    inMemoryDom.innerHTML = `<component-test-element-12 data-my-attr="hello"></component-test-element-12>`;

    await expect(renderRecords).toEqual(["attr"]);
    await expect(inMemoryDom.querySelector<HTMLElement>("component-test-element-12")?.innerText).toEqual("hello");

    inMemoryDom.querySelector<HTMLElement>("component-test-element-12")!.setAttribute("data-my-attr", "world");
    await expect(renderRecords).toEqual(["attr", "attr"]);
    await expect(inMemoryDom.querySelector<HTMLElement>("component-test-element-12")?.innerText).toEqual("world");

    cleanup();
  });
});
