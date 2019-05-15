import { RepositoryMetadata } from './models/repository-metadata';
import { githubClient } from './github-client';
import { RepositoryUpdateFileOptions } from './models/repository-update-file-options';

export class Repository {
  constructor(readonly metadata: RepositoryMetadata) {}

  async getContent(filePath: string) {
    try {
      return await githubClient.repos.getContents({
        owner: this.metadata.owner.login,
        path: filePath,
        repo: this.metadata.name
      });
    } catch (err) {
      throw new Error(err);
    }
  }

  async updateFile(options: RepositoryUpdateFileOptions) {
    const { author, branch, committer, message, filePath } = options;
    const resp = await this.getContent(filePath);

    const content = Buffer.from(resp.data.content, resp.data.encoding).toString();

    const newContent = options.contentTransformer(content, this.metadata);

    // do nothing if null/undefined returned.
    if (newContent === null || newContent === undefined) return;

    try {
      return await githubClient.repos.updateFile({
        author,
        branch,
        committer,
        content: Buffer.from(newContent).toString('base64'),
        message,
        owner: this.metadata.owner.login,
        path: filePath,
        repo: this.metadata.name,
        sha: resp.data.sha
      });
    } catch (err) {
      throw new Error(err);
    }
  }
}
