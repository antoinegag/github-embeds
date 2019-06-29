import { extensionToMarkup } from "./extensionToMarkup";

export function escapeSpecialText(text: string): string {
  return text.replace(/[`*_~]/, "$&").replace("@", "at");
}

export function bold(text: string): string {
  return `**${text}**`;
}

export function underline(text: string): string {
  return `__${text}__`;
}
export function formatFileName(name: string): string {
  return underline(escapeSpecialText(name));
}
export function buildFilePreview(name: string, content: string, extension?: string): string {
  return [formatFileName(name), `\`\`\`${extensionToMarkup(extension)}`, content, `\`\`\``].join("\n");
}
