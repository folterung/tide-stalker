import Octokit from '@octokit/rest';

import config from '../config';

export const githubClient = new Octokit({
  baseUrl: config.baseURL,
  auth: `<<ADD TOKEN HERE>>`
});
