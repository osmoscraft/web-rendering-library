import { build } from "esbuild";
import { safeCopyFile } from "./ts-utils";

async function buildAll() {
  Promise.all([buildScripts(), copyHtml()]);
}

async function buildScripts() {
  const result = await build({
    entryPoints: ["src/tests.ts"],
    bundle: true,
    format: "esm",
    outdir: "dist",
    sourcemap: true,
  });

  console.log(`[build] scripts (${result.errors.length} errors)`);
}

async function copyHtml() {
  await safeCopyFile("src/tests.html", "dist/tests.html");

  console.log(`[build] html copied`);
}

buildAll();
