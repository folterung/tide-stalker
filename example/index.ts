import { readFileSync } from 'fs';
import { join } from 'path';

import { bulkUpdate, RepositoryMetadata } from '../src';

const targets = [
  {
    org: 'bulk-update',
    filePath: 'README.md',
    contentTransformer: (content: string, repo: RepositoryMetadata) => {
      const message = readFileSync(join(__dirname, 'update-message.md')).toString();

      console.log(`Updating "${repo.owner.login}/${repo.name}"...`);

      return content + '\n---\n' + message;
    },
    updateMessage: 'test update #2'
  }
];

bulkUpdate(targets);
