import path from "path";

export const logger = {
  success: (pathName) => {
    const result = path.join(path.basename(process.cwd()), pathName);
    console.log(`Page was successfully downloaded into ${result}'`);
  },
  error: (message) => {
    console.error(`Error: ${message}`);
  },
};
