import { Octokit } from "@octokit/rest";

export class GithubApi {
  private octokit = new Octokit({
    auth: this.authToken,
  });

  constructor(
    private authToken: string,
    private owner: string,
    private repo: string,
    private ref: string = "master"
  ) {}

  async getFileContent(
    path: string
  ): Promise<{ content: string; path: string }> {
    const { data: contents } = await this.octokit.repos.getContent({
      owner: this.owner,
      repo: this.repo,
      path,
      ref: this.ref,
    });

    return contents as any;
  }

  async getRepoContent(
    path: string
  ): Promise<{ path: string; content: string; type: "dir" }[]> {
    const { data: contents } = await this.octokit.repos.getContent({
      owner: this.owner,
      repo: this.repo,
      path,
      ref: this.ref,
    });

    return contents as any;
  }

  async updateGitFile(content: string, path: string, sha: string) {
    let buff = new Buffer(content);
    let base64data = buff.toString("base64");

    const response = await this.octokit.repos.createOrUpdateFileContents({
      owner: this.owner,
      repo: this.repo,
      path: path,
      content: base64data,
      message: "📝 Update documentation file from notion",
      sha: sha,
      branch: this.ref,
    });

    return response;
  }
}
