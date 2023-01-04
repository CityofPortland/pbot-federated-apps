/**
 * Capitalizes a single word or the first word of a multiple word string.
 *
 * @param str Word to capitalize
 */
export function capitalize(str: string) {
  return `${str.slice(0, 1).toUpperCase()}${str.slice(1)}`;
}

export function snakeCase(str: string) {
  return (
    str
      // ABc -> A_Bc
      .replace(/([A-Z])([A-Z])([a-z])/g, '$1_$2$3')
      // aC -> a_C
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      .toLowerCase()
  );
}
