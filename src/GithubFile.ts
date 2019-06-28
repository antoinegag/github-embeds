import fetch, { Response } from "node-fetch";

interface LineRange {
  start: number;
  end?: number;
}

export class GithubFile {
  url: string;
  username: string;
  repository: string;
  filePath: string;
  extension: string;
  name: string;
  lineRange: LineRange;

  private content: string;

  private GITHUB_URL_REGEX = /https?:\/\/(?:www.)?github.com\/([^\/]*)\/([^\/]*)\/blob\/((.*)\/(.*))(?:#L(\d*)-L(\d*))?/;
  private PREVIEW_MAX_LINES = 25;

  public constructor(url: string) {
    this.parse(url);
  }

  private parse(url: string): void {
    const match = url.match(this.GITHUB_URL_REGEX);

    this.url = url;
    this.username = match[1];
    this.repository = match[2];
    this.filePath = match[3];
    this.name = match[5].replace(">", ""); // Remove from <url> <--
    this.extension = this.name.match(/\.([^#]+)/)[1];

    this.parseLineRange(this.name);
  }

  private parseLineRange(fileName: string): void {
    const range = fileName.match(/#L(\d*)(?:-L)?(\d*)?/);
    let lnStart = 0;
    let lnEnd = this.PREVIEW_MAX_LINES;
    if (range) {
      const singleLine = !range[2];

      lnStart = parseInt(range[1]) || 0;
      lnEnd = singleLine ? lnStart : parseInt(range[2]) || lnStart;

      if (lnEnd - lnStart > this.PREVIEW_MAX_LINES) {
        lnEnd = lnStart + this.PREVIEW_MAX_LINES;
      }

      if (lnStart > lnEnd) {
        lnEnd = lnStart;
      }
    }

    this.lineRange = {
      start: lnStart,
      end: lnEnd,
    };
  }

  public getRawURL(): string {
    return `https://raw.githubusercontent.com/${this.username}/${this.repository}/${this.filePath}`;
  }

  private checkStatus(res: Response): Response {
    if (res.ok) {
      return res;
    } else {
      throw Error(`Error downloading file ${this.getRawURL()}: ${res.statusText}`);
    }
  }

  public async getFileContent(ignoreRange = false): Promise<string> {
    const fileContent =
      this.content ||
      (await fetch(this.getRawURL())
        .then(this.checkStatus)
        .then((res): Promise<string> => res.text()));

    this.content = fileContent;

    if (ignoreRange) return fileContent; // TODO: trim to not exceed Discord's limit (not in this class tho)

    const startAt = this.lineRange.start === 0 ? this.lineRange.start : this.lineRange.start - 1;

    const lines = fileContent.split("\n");
    const previewLines = lines.slice(startAt, this.lineRange.end);
    const preview = previewLines.join("\n").replace(/[`]/, "$&"); // Sanitize

    return preview;
  }
}
