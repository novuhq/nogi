import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";

export class NotionApi {
  public readonly client = new Client({
    auth: this.integrationKey,
  });

  private markdownConverter = new NotionToMarkdown({
    notionClient: this.client,
  });

  constructor(private integrationKey: string) {}

  async convertPageToMd(pageId: string) {
    const mdBlocks = await this.markdownConverter.pageToMarkdown(pageId, 100);
    const mdString = this.markdownConverter.toMarkdownString(mdBlocks);

    return mdString;
  }
}
