import { reportSummary } from "@osmoscraft/web-testing-library";
import { testComponent } from "./__tests__/component.tests";
import {
  testAttrBindingDirective,
  testEventBindingDirective,
  testForDirective,
  testIfDirective,
  testModelDirective,
  testTextDirective,
} from "./__tests__/directives.tests";
import { testEvaluate } from "./__tests__/evaluate.tests";
import { testHtml } from "./__tests__/html.tests";
import { testTemplatingBasic } from "./__tests__/templating.tests";

async function testAll() {
  const start = performance.now();
  await testHtml();
  await testTemplatingBasic();
  await testIfDirective();
  await testForDirective();
  await testTextDirective();
  await testModelDirective();
  await testAttrBindingDirective();
  await testEventBindingDirective();
  await testEvaluate();
  await testComponent();
  const duration = (performance.now() - start) / 1000;
  console.log(`[test] Finished in ${duration}`);

  reportSummary();
}

testAll();
