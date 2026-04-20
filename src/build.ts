import { $ } from "bun";

const outdir = "dist";

const result = await Bun.build({
  entrypoints: ["src/main.ts"],
  outdir,
  minify: true,
  target: "browser",
});

if (!result.success) {
  console.error("Build failed:");
  for (const log of result.logs) {
    console.error(log);
  }
  process.exit(1);
}

// Copy static assets
await $`cp src/index.html ${outdir}/index.html`;
await $`cp src/styles.css ${outdir}/styles.css`;

console.log(`Built ${result.outputs.length} files to ${outdir}/`);
