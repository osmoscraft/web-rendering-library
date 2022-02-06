export function html(strings: TemplateStringsArray, ...variables: (string | number)[]): HTMLTemplateElement {
  const templateHtml = strings.flatMap((item, index) => [item, `${variables[index] ?? ""}`]).join("");

  return createTemplate(templateHtml);
}

function createTemplate(html: string): HTMLTemplateElement {
  const template = document.createElement("template");
  template.innerHTML = html;

  return template;
}
