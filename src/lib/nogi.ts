import { GithubApi } from "./github.api";
import { NotionApi } from "./notion.api";

export class Nogi {
  constructor(private githubApi: GithubApi, private notionApi: NotionApi) {}

  async sync(gitPath: string) {
    const files = await this.getMdFiles(gitPath);

    for (const file of files) {
      const content = await this.getMdContent(file.path);
      if (!this.isSyncable(content)) {
        continue;
      }

      const notionId = this.extractNotionId(content);
      const notionContent = await this.notionApi.convertPageToMd(notionId);
      const header = this.extractDocosaurusHeader(content);

      const mergedContent = header + "\n" + notionContent;
      await this.githubApi.updateGitFile(mergedContent, file.path, file.sha);
    }
  }

  private extractDocosaurusHeader(content: string) {
    const regex = /((---).*?(---))/s;

    const result = regex.exec(content);

    if (result) return result[0];
  }

  private async getMdFiles(gitPath: string) {
    const pages = await this.fetchPathContents(gitPath);

    return pages.filter(
      (page) => page.type === "file" && page.name.includes(".md")
    );
  }

  private isSyncable(content: string) {
    return content.includes("notion_page_id:");
  }

  private extractNotionId(content: string) {
    const regex = /notion_page_id: ((.*)\n)/;
    const parsedRegex = regex.exec(content);

    let pageId;
    if (parsedRegex) {
      pageId = parsedRegex[2];
    }

    return pageId;
  }

  private async getMdContent(pagePath: string) {
    const { content } = await this.githubApi.getFileContent(pagePath);

    const buff = new Buffer(content, "base64");
    const mdContent = buff.toString("utf8");

    return mdContent;
  }

  private async fetchPathContents(path: string) {
    const contents = await this.githubApi.getRepoContent(path);

    const results = [];

    for (const item of contents) {
      if (item.type === "dir") {
        const files = await this.fetchPathContents(item.path);

        results.push(...files);
      } else {
        results.push(item);
      }
    }

    return results;
  }
}
