#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";

const dir = dirname(fileURLToPath(import.meta.url));
const templateDir = join(dir, "..", "template");

const args = process.argv.slice(2);
const getArg = (flag: string) => {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : undefined;
};

async function prompt(
  rl: ReturnType<typeof createInterface>,
  msg: string,
  defaultVal?: string,
): Promise<string> {
  const q = defaultVal ? `${msg} (${defaultVal}) ` : `${msg} `;
  const answer = await rl.question(q);
  return answer || defaultVal || "";
}

async function main() {
  let name = getArg("--name");
  let description = getArg("--description");

  if (!name || !description) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    if (!name) name = await prompt(rl, "Package name (kebab-case):");
    if (!description) description = await prompt(rl, "Package description:");
    rl.close();
  }

  if (!name || !description) {
    console.error("Both --name and --description are required");
    process.exit(1);
  }

  const outDir = join(process.cwd(), "packages", name);

  await mkdir(join(outDir, "src"), { recursive: true });

  const files = ["package.json", "tsconfig.json", "src/index.ts"];
  for (const file of files) {
    const content = await readFile(join(templateDir, file), "utf8");
    const result = content
      .replace(/\{\{name\}\}/g, name)
      .replace(/\{\{description\}\}/g, description);
    await writeFile(join(outDir, file), result, "utf8");
  }

  console.log(`\nCreated package at packages/${name}`);
}

void main();
