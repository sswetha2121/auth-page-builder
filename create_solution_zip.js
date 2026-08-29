const fs = require("fs");
const path = require("path");
const JSZip = require("./js/jszip.min.js");

async function zipFolder(dir, zip, rootDir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === "node_modules" || file === ".git" || file === "auth-page-builder-complete-solution.zip" || file.startsWith(".env.local")) {
      continue;
    }
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    const relPath = path.relative(rootDir, filePath).replace(/\\/g, "/");

    if (stat.isDirectory()) {
      const folder = zip.folder(file);
      await zipFolder(filePath, folder, rootDir);
    } else {
      const content = fs.readFileSync(filePath);
      zip.file(file, content);
    }
  }
}

async function main() {
  console.log("Generating auth-page-builder-complete-solution.zip...");
  const zip = new JSZip();
  const rootDir = __dirname;

  await zipFolder(rootDir, zip, rootDir);

  const content = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  const outputPath = path.join(rootDir, "auth-page-builder-complete-solution.zip");
  fs.writeFileSync(outputPath, content);
  console.log(`[SUCCESS] Solution ZIP created at: ${outputPath} (${(content.length / 1024 / 1024).toFixed(2)} MB)`);
}

main().catch(err => console.error("Error creating ZIP:", err));
