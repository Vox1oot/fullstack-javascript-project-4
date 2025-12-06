import fs from "fs/promises";
import path from "path";

const ensureDirExists = (dir) => {
  return new Promise((resolve, reject) => {
    fs.access(dir, fs.constants.F_OK)
      .then(() => resolve())
      .catch(() => {
        fs.mkdir(dir, { recursive: true })
          .then(() => resolve())
          .catch(reject);
      });
  });
};

export const writeFile = (outputDir, fileName, data) => {
  return new Promise((resolve, reject) => {
    ensureDirExists(outputDir)
      .then(() => {
        const filePath = path.join(outputDir, fileName);
        fs.writeFile(filePath, data)
          .then(() => resolve(filePath))
          .catch(reject);
      })
      .catch(reject);
  });
};
