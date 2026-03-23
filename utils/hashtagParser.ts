export function parseHashtagsToHTML(htmlContent: string): string {
  if (!htmlContent) return '';

  // We want to find `#word` but ONLY if it's inside text (not inside an HTML tag like `<a href="#...">` or `<div style="color: #fff">`).
  // A robust way using regex without a parser is to split the string into HTML tags and text nodes.
  
  // Regex to match any HTML tag
  const tagRegex = /(<[^>]+>)/g;
  
  // Split into alternating text and tag segments. 
  // Every even index (0, 2, 4...) is TEXT. 
  // Every odd index (1, 3, 5...) is an HTML TAG.
  const parts = htmlContent.split(tagRegex);

  for (let i = 0; i < parts.length; i++) {
    // Only process text nodes (even indices)
    if (i % 2 === 0) {
      // Find #hashtag where it is preceded by a boundary or whitespace to avoid replacing parts of normal paths
      // and contains letters/numbers/underscores/bangla characters
      const hashtagRegex = /(?<=\s|>|^|\p{P})(#[\p{L}\p{N}_]+)/gu;
      
      parts[i] = parts[i].replace(hashtagRegex, (match) => {
        // match contains the `#` symbol. substring(1) removes it.
        const tagWithoutHash = match.substring(1);
        return `<a href="/search?q=${encodeURIComponent(tagWithoutHash)}" class="text-indigo-600 dark:text-indigo-400 hover:underline font-bold">${match}</a>`;
      });
    }
  }

  return parts.join('');
}
