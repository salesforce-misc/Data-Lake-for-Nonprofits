import path from "path";
import fs from "fs-extra";
import replace from "lodash/replace";
import endsWith from "lodash/endsWith";
import klaw from "klaw";

/**
 * This is a basic build script that copies the cloudformation files in /infra/cf to /app/data/cfn while
 * making them .ts files that export yaml strings. This makes it easier to ingest them in other .ts files.
 */
async function run(): Promise<void> {
  const sourceDir = path.join(__dirname, "../../infra/cf");
  const destDir = path.join(__dirname, "../src/data/cf");

  for await (const file of klaw(sourceDir, { depthLimit: 0 })) {
    if (!endsWith(file.path, ".yaml")) continue;

    // Load the content of the file
    let content = await fs.readFile(file.path, "utf8");

    // Escape any '$' and '`'
    content = replace(content, /\\/g, "\\\\");
    content = replace(content, /\$/g, "\\$");
    content = replace(content, /`/g, "\\`");

    // Write the .ts file
    const basename = path.basename(file.path);
    await fs.writeFile(path.join(destDir, `${basename}.ts`), `export const yaml = \`${content}\``);
  }
}

run();
export {};
