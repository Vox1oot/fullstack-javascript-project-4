import path from 'path'

export const logger = {
  success: (pathName) => {
    const relativePath = path.relative(process.cwd(), pathName)
    const result = path.join(path.basename(process.cwd()), relativePath)
    console.log(`[SUCCESS]: Page was successfully downloaded into ${result}'`)
  },
  error: (message) => {
    console.error(`[ERROR]: ${message}`)
  },
}
