import axios from "axios";
import fs from "node:fs/promises";
import path from "path";

export const load = (url, outputDir, fileName) => {
  const filePath = path.join(outputDir, fileName);

  return axios
    .get(url)
    .then((response) => fs.writeFile(filePath, response.data))
    .then(() => filePath);
};
