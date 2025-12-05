import fs from "fs/promises";
import path from "path";

export const write = (outputDir, fileName, data) => {
  const filePath = path.join(outputDir, fileName);
  return fs.writeFile(filePath, data).then(() => filePath);
};
