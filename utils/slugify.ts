export const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Replace spaces with -
    .replace(/\s+/g, '-')
    // Remove characters that are NOT letters, numbers, or dashes
    // The previous regex [^\w\-] removed Bengali. We removed that restriction.
    .replace(/[&/\\#,+()$~%.'":*?<>{}]/g, '') 
    // Replace multiple - with single -
    .replace(/\-\-+/g, '-');
};