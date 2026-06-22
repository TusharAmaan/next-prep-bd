/**
 * Helper utility to capitalize the first letter of each word in a string.
 * This is useful for minimal UI labels, headers, and placeholders.
 * E.g., "join the discussion" -> "Join The Discussion"
 *
 * @param str The string to format.
 * @returns The capitalized string.
 */
export function capitalizeEachWord(str: string): string {
  if (!str) return str;
  return str
    .toLowerCase()
    .split(' ')
    .map(word => {
      if (!word) return '';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}
