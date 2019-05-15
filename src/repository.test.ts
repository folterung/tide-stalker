jest.mock('./github-client');

import { githubClient } from './github-client';
import { Repository } from './repository';

describe('Repository', () => {
  const pseudoFilePath = 'fakeFilePath';
  const metadata = {
    name: 'turtle',
    owner: { login: 'masterOfDisguise' }
  }; 

  let repo: Repository;

  afterEach(() => jest.resetAllMocks());

  beforeEach(() => {
    repo = new Repository(metadata);
  });

  describe('metadata', () => {
    it('returns the underlying metadata.', () => {
      expect(repo.metadata).toEqual(metadata);
    });
  });

  describe('getContent', () => {
    it('calls "githubClient.repos.getContents" internally and returns the result.', async () => {
      (githubClient as any).repos.getContents.mockResolvedValueOnce({ data: metadata });

      const resp = await repo.getContent(pseudoFilePath);

      expect(githubClient.repos.getContents).toHaveBeenCalledWith({
        owner: metadata.owner.login,
        path: pseudoFilePath,
        repo: metadata.name
      });

      expect(resp.data).toEqual(metadata);
    });

    it('throws an error if "githubClient.repos.getContents" fails.', async () => {
      const errorMessage = 'Something bad happened when trying to call "getContents".';

      let errorThrown = false;
      
      (githubClient as any).repos.getContents.mockRejectedValueOnce(new Error(errorMessage));

      try {
        await repo.getContent(pseudoFilePath);
      } catch (err) {
        errorThrown = true;
        expect(err.message).toBe(`Error: ${errorMessage}`);
      }

      expect(errorThrown).toBe(true);
    });
  });

  describe('updateFile', () => {
    it('calls "getContent" internally and returns the value.', async () => {
      const PSEUDO_UPDATE_FILE_RESPONSE = 'PSEUDO UPDATE FILE RESPONSE';

      const mockContentTransformer = jest.fn(content => content);

      (githubClient as any).repos.updateFile.mockResolvedValueOnce(PSEUDO_UPDATE_FILE_RESPONSE);
      (githubClient as any).repos.getContents.mockResolvedValueOnce({ 
        data: { content: 'VHVSdExl', encoding: 'base64' }
      });

      const resp = await repo.updateFile({
        message: 'fake message',
        filePath: 'fakeFilePath',
        contentTransformer: mockContentTransformer
      });

      expect(resp).toBe(PSEUDO_UPDATE_FILE_RESPONSE);

      expect(githubClient.repos.updateFile).toHaveBeenCalledWith({
        "content": "VHVSdExl",
        "message": "fake message",
        "owner": "masterOfDisguise",
        "path": "fakeFilePath",
        "repo": "turtle"
      });
    });

    it('throws an error if "getContent" fails.', async () => {
      const errorMessage = 'Something bad happened when calling "updateFile".';
      
      let errorThrown = false;

      const mockContentTransformer = jest.fn(content => content);

      (githubClient as any).repos.updateFile.mockRejectedValueOnce(new Error(errorMessage));
      (githubClient as any).repos.getContents.mockResolvedValueOnce({ 
        data: { content: 'VHVSdExl', encoding: 'base64' }
      });

      try {
        await repo.updateFile({
          message: 'fake message',
          filePath: 'fakeFilePath',
          contentTransformer: mockContentTransformer
        });
      } catch (err) {
        errorThrown = true;
        expect(err.message).toBe(`Error: ${errorMessage}`);
      }

      expect(errorThrown).toBe(true);
    });

    it('doesn\'t call "updateFile" if "null" is returned from the "contentTransformer".', async () => {
      const PSEUDO_UPDATE_FILE_RESPONSE = 'PSEUDO UPDATE FILE RESPONSE';

      const nullContentTransformer = jest.fn(() => null);

      (githubClient as any).repos.updateFile.mockResolvedValueOnce(PSEUDO_UPDATE_FILE_RESPONSE);
      (githubClient as any).repos.getContents.mockResolvedValueOnce({ 
        data: { content: 'VHVSdExl', encoding: 'base64' }
      });

      const resp = await repo.updateFile({
        message: 'fake message',
        filePath: 'fakeFilePath',
        contentTransformer: nullContentTransformer
      });

      expect(resp).toBe(undefined);
      expect(githubClient.repos.updateFile).not.toHaveBeenCalled();
    });

    it('doesn\'t call "updateFile" if "undefined" is returned from the "contentTransformer".', async () => {
      const PSEUDO_UPDATE_FILE_RESPONSE = 'PSEUDO UPDATE FILE RESPONSE';

      const nullContentTransformer = jest.fn(() => undefined);

      (githubClient as any).repos.updateFile.mockResolvedValueOnce(PSEUDO_UPDATE_FILE_RESPONSE);
      (githubClient as any).repos.getContents.mockResolvedValueOnce({ 
        data: { content: 'VHVSdExl', encoding: 'base64' }
      });

      const resp = await repo.updateFile({
        message: 'fake message',
        filePath: 'fakeFilePath',
        contentTransformer: nullContentTransformer
      });

      expect(resp).toBe(undefined);
      expect(githubClient.repos.updateFile).not.toHaveBeenCalled();
    });
  });
});
