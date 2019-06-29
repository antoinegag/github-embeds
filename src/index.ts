require("dotenv").config();

import * as Discord from "discord.js";
import { GithubFile } from "./GithubFile";
import { buildFilePreview } from "./FormatHelper";

const client = new Discord.Client();
const GITHUB_URL_REGEX = /https?:\/\/(?:w{3}\.)?github\.com\/([^\s\/]*)\/([^\s\/]*)\/blob\/([^\s#]+)(?:#L(\d+)(?:-L(\d+))?)?/;

client.on("ready", (): void => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on(
  "message",
  async (msg): Promise<any> => {
    if (msg.author.id === client.user.id) return;

    const match = msg.content.match(GITHUB_URL_REGEX);
    if (match) {
      const ghFile = new GithubFile(match[0]);

      let content: string;
      try {
        content = await ghFile.getFileContent();
      } catch (error) {
        msg.channel.send("There was an error getting the content of the file");
        console.error(error);
        return;
      }

      return msg.channel.send(buildFilePreview(ghFile.filePath, content, ghFile.extension));
    }
  },
);

client.login(process.env.DISCORD_SECRET);
