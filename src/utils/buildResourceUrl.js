export const buildResourceUrl = (url, resourcePath) => {
  const { origin } = new URL(url);

  try {
    return new URL(resourcePath, origin).toString();
  } catch (error) {
    console.error('Error building resource URL:', error);
    return resourcePath;
  }
};
