import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

async function createProjectZip() {
  const zip = new JSZip();
  const rootDir = process.cwd();

  const ignoreDirs = ['node_modules', '.git', 'dist', '.data', 'uploads', '.aistudio', '.cache'];
  const ignoreFiles = ['.DS_Store', 'smart-file-organizer-project.zip', 'bun.lock'];

  function addDirToZip(currentDir: string, zipFolder: JSZip) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (ignoreDirs.includes(entry.name)) continue;
        const subFolder = zipFolder.folder(entry.name);
        if (subFolder) {
          addDirToZip(path.join(currentDir, entry.name), subFolder);
        }
      } else {
        if (ignoreFiles.includes(entry.name)) continue;
        if (entry.name.endsWith('.tmp') || entry.name.endsWith('.zip')) continue;

        const filePath = path.join(currentDir, entry.name);
        const fileContent = fs.readFileSync(filePath);
        zipFolder.file(entry.name, fileContent);
      }
    }
  }

  console.log('Packaging project files into ZIP...');
  addDirToZip(rootDir, zip);

  const zipBuffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });

  const outputPath = path.join(rootDir, 'smart-file-organizer-project.zip');
  fs.writeFileSync(outputPath, zipBuffer);
  console.log(`Successfully generated: ${outputPath} (${(zipBuffer.length / 1024).toFixed(1)} KB)`);
}

createProjectZip().catch(err => {
  console.error('Failed to create project ZIP:', err);
  process.exit(1);
});
