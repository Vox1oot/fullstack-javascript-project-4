import fs from 'fs/promises'
import path from 'path'

const ensureDirExists = (dir) => {
  return new Promise((resolve, reject) => {
    fs.access(dir, fs.constants.F_OK)
      .then(() => resolve())
      .catch(() => {
        fs.mkdir(dir, { recursive: true })
          .then(() => resolve())
          .catch((error) => {
            if (error.code === 'EACCES') {
              reject(
                new Error(`Недостаточно прав для создания директории: ${dir}`),
              )
            }
            else {
              reject(
                new Error(
                  `Не удалось создать директорию ${dir}: ${error.message}`,
                ),
              )
            }
          })
      })
  })
}

export const writeFile = (outputDir, fileName, data) => {
  return new Promise((resolve, reject) => {
    ensureDirExists(outputDir)
      .then(() => {
        const filePath = path.join(outputDir, fileName)
        fs.writeFile(filePath, data)
          .then(() => resolve(filePath))
          .catch((error) => {
            if (error.code === 'EACCES') {
              reject(
                new Error(`Недостаточно прав для записи файла: ${filePath}`),
              )
            }
            else {
              reject(
                new Error(
                  `Не удалось записать файл ${filePath}: ${error.message}`,
                ),
              )
            }
          })
      })
      .catch(reject)
  })
}
