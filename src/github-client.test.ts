jest.mock('@octokit/rest');

import Octokit from '@octokit/rest';

describe('githubClient', () => {
  it('creates an instance of "Octokit" and returns it', () => {
    require('./github-client');
    expect(Octokit).toHaveBeenCalledWith({ 
      auth: `<<ADD TOKEN HERE>>`,
      baseUrl: 'https://api.github.com/'
    });
  });
});