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
  extension?: string;
  name: string;
  lineRange: LineRange;

  private content?: string;

  private GITHUB_URL_REGEX = /https?:\/\/(?:w{3}\.)?github\.com\/([^\s\/]*)\/([^\s\/]*)\/blob\/([^\s#]+)(?:#L(\d+)(?:-L(\d+))?)?/;
  public PREVIEW_MAX_LINES = 25;

  public constructor(url: string) {
    const match = url.match(this.GITHUB_URL_REGEX);

    if (!match) {
      throw Error(`Invalid Github URL passed: ${url}`);
    }

    this.url = url;
    this.username = match[1];
    this.repository = match[2];
    this.filePath = match[3];

    const dirs = this.filePath.split("/");
    this.name = dirs[dirs.length - 1] || "";

    const extensionMatch = this.name.match(/\.(.+)/);
    if (extensionMatch) {
      this.extension = extensionMatch[1];
    }

    let lnStart = 0;
    let lnEnd = this.PREVIEW_MAX_LINES;

    // If at least one L is defined
    if (match[4]) {
      const start = match[4];
      const end = match[5];
      const singleLine = !end;

      lnStart = parseInt(start) || 0;
      lnEnd = singleLine ? lnStart : parseInt(end) || lnStart;

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

    if (!this.content) {
      return "";
    }

    if (ignoreRange) return this.content;

    const startAt = this.lineRange.start === 0 ? this.lineRange.start : this.lineRange.start - 1;

    const lines = this.content.split("\n");
    const previewLines = lines.slice(startAt, this.lineRange.end);
    const preview = previewLines.join("\n").replace(/[`]/, "$&"); // Sanitize

    return preview;
  }
}
