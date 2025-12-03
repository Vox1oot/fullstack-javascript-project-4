export const formatter = (url, separator = "-", extension = "html") => {
  const { hostname, pathname } = new URL(url);

  const normalizedPathname = pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;

  const fullPath = `${hostname}${normalizedPathname}`;
  const formatted = fullPath.replace(/\W+/g, separator);

  return `${formatted}.${extension}`;
};
