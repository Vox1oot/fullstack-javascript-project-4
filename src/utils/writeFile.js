import fs from 'fs/promises'
import path from 'path'

export const writeFile = (outputDir, fileName, data) => {
  const filePath = path.join(outputDir, fileName)

  return fs.access(outputDir, fs.constants.F_OK)
    .catch(() => fs.mkdir(outputDir, { recursive: true })
      .catch((error) => {
        if (error.code === 'EACCES') {
          throw new Error(`Недостаточно прав для создания директории: ${outputDir}`)
        }
        throw new Error(`Не удалось создать директорию ${outputDir}: ${error.message}`)
      }))
    .then(() => fs.writeFile(filePath, data))
    .then(() => filePath)
    .catch((error) => {
      if (error.code === 'EACCES') {
        throw new Error(`Недостаточно прав для записи файла: ${filePath}`)
      }
      throw new Error(`Не удалось записать файл ${filePath}: ${error.message}`)
    })
}
