import { ReposUpdateFileParamsAuthor, ReposUpdateFileParamsCommitter } from '@octokit/rest';

import { ContentTransformer } from './content-transformer';

export interface RepositoryUpdateFileOptions {
  author?: ReposUpdateFileParamsAuthor;
  branch?: string;
  committer?: ReposUpdateFileParamsCommitter;
  contentTransformer: ContentTransformer
  filePath: string;
  message: string;
}
