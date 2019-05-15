import { Token } from './token';

describe('Token', () => {
  it('stores the key', () => {
    const token = new Token('GITHUB_ACCESS_TOKEN');

    expect(token.locations).toEqual(['GITHUB_ACCESS_TOKEN']);
  });

  describe('value', () => {
    it('returns the value of the first valid environment variable', () => {
      const token = new Token('bad_access_token', 'GITHUB_ACCESS_TOKEN');

      process.env.GITHUB_ACCESS_TOKEN = 'fakeGithubToken';

      expect(token.value()).toBe('fakeGithubToken');
    });

    it('throws an error if no matching environment variable can be found', () => {
      const token = new Token('bad_access_token', 'GITHUB_ACCESS_TOKEN');
      let errorThrown = false;

      delete process.env.GITHUB_ACCESS_TOKEN;

      try {
        token.value();
      } catch (err) {
        errorThrown = true;
        expect(err.message).toBe('No matching environment variable found in locations "bad_access_token, GITHUB_ACCESS_TOKEN".');
      }

      expect(errorThrown).toBe(true);
    });
  });
});
