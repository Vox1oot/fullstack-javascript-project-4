import path from 'path'

const DEFAULT_SEPARATOR = '-'
const DEFAULT_EXTENSION = 'html'
const DEFAULT_DIR_SUFFIX = '_files'

const replaceSpecialChars = (str, separator) => {
  return str.replace(/[^a-z0-9]/gi, separator)
}

export const formatFilePath = (
  url,
  separator = DEFAULT_SEPARATOR,
  extension = DEFAULT_EXTENSION,
) => {
  const { hostname, pathname } = new URL(url)
  const { ext, dir, name } = path.parse(pathname)

  const rowPath = path.join(hostname, dir === '/' ? '' : dir, name)
  const formattedPath = replaceSpecialChars(rowPath, separator)

  return ext ? `${formattedPath}${ext}` : `${formattedPath}.${extension}`
}

export const formatDirPath = (url, separator = DEFAULT_SEPARATOR) => {
  const { hostname, pathname } = new URL(url)

  const rowPath = pathname === '/' ? hostname : path.join(hostname, pathname)
  const formattedPath = replaceSpecialChars(rowPath, separator)

  return `${formattedPath}${DEFAULT_DIR_SUFFIX}`
}
