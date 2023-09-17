export const toCamelCase = (str: string): string =>
  str.replace(/_(?<char>[a-zA-Z])/g, (g) => g[1].toUpperCase());
