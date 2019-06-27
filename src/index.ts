require("dotenv").config();

import * as Discord from "discord.js";
import fetch, { Response } from "node-fetch";

const client = new Discord.Client();
const GITHUB_URL_REGEX = /https?:\/\/(?:www.)?github.com\/([^\/]*)\/([^\/]*)\/blob\/((.*)\/(.*))(?:#L(\d*)-L(\d*))?/;
const PREVIEW_MAX_LINES = 25;

function toRawURL(user: string, repo: string, path: string): string {
  return `https://raw.githubusercontent.com/${user}/${repo}/${path}`;
}

function codeFormat(extension: string): string {
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

function checkStatus(res: Response): Response {
  if (res.ok) {
    return res;
  } else {
    throw Error(res.statusText);
  }
}

client.on("ready", (): void => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on(
  "message",
  async (msg): Promise<any> => {
    const match = msg.content.match(GITHUB_URL_REGEX);
    if (match) {
      const user = match[1];
      const repo = match[2];
      const path = match[3];
      const fileName = match[5].replace(">", "");
      const extension = fileName.match(/\.([^#]+)/)[1];

      const rawUrl = toRawURL(user, repo, path);

      let response;
      try {
        response = await fetch(rawUrl)
          .then(checkStatus)
          .then((res): Promise<string> => res.text());
      } catch (error) {
        msg.channel.send(`There was an error processing link: ${error}`);
        return;
      }

      let lnStart = 0;
      let lnEnd = PREVIEW_MAX_LINES;
      const range = fileName.match(/#L(\d*)(?:-L)?(\d*)?/);
      if (range) {
        const singleLine = !range[2];

        lnStart = parseInt(range[1]) || 0;
        lnEnd = singleLine ? lnStart : parseInt(range[2]) || lnStart;

        if (lnEnd - lnStart > PREVIEW_MAX_LINES) {
          lnEnd = lnStart + PREVIEW_MAX_LINES;
        }

        if (lnStart > lnEnd) {
          lnEnd = lnStart;
        }
      }

      const startAt = lnStart === 0 ? lnStart : lnStart - 1;

      const lines = response.split("\n");
      const previewLines = lines.slice(startAt, lnEnd);
      const preview = previewLines.join("\n").replace(/[`]/, "$&");

      msg.channel.send([`\`\`\`${codeFormat(extension)}`, preview, `\`\`\``].join("\n"));
    }
  },
);

client.login(process.env.DISCORD_SECRET);
