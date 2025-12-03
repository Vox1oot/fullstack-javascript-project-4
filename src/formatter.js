export const formatter = (url) => {
  const parsedUrl = new URL(url);
  const formattedUrl = parsedUrl
    .toString()
    .replace(`${parsedUrl.protocol}//`, "")
    .replace(/\W/g, "-")
    .concat(".html");

  return formattedUrl;
};
