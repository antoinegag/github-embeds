export function extensionToMarkup(extension: string): string {
  let language = extension;
  switch (extension) {
    case "kt":
      language = "kotlin";
      break;
    default:
      break;
  }
  return language;
}
