export const toSnakeCase = (str: string): string =>
  str
    .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
    .substring(str.slice(0, 1).match(/(?<char>[A-Z])/g) ? 1 : 0);
