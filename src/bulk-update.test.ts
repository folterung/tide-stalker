jest.mock("./github-client");

import { bulkUpdate, getReposByName, getReposByOrg } from "./bulk-update";
import { DataIterator } from "./data-iterator";
import { githubClient } from "./github-client";
import { TargetMetadata, RepositoryMetadata } from "./models";

describe("bulkUpdate", () => {
  const fakeFilePath = "fake/file/path.md";
  const fakeOrg = "fakeOrg";
  const fakeUpdateMessage = "fakeUpdateMessage";
  const expectedContent = "expectedContent";
  const targetMetadata: TargetMetadata[] = [
    {
      org: fakeOrg,
      updateMessage: fakeUpdateMessage,
      contentTransformer: () => expectedContent,
      filePath: fakeFilePath
    }
  ];

  afterEach(() => jest.resetAllMocks());

  it('calls "githubClient.repos.listForOrg" for each item provided in "targetMetadataList".', async () => {
    const getContentsResponse = {
      data: { content: "VHVSdExl", encoding: "base64" }
    };
    const listForOrgResponse = {
      data: [{ name: "fakeRepo", owner: { login: "fakeOrg" } }]
    };
    const updateFileResponse = [{ data: { success: true } }];

    (githubClient as any).repos.getContents.mockResolvedValueOnce(
      getContentsResponse
    );
    (githubClient as any).repos.listForOrg.mockResolvedValueOnce(
      listForOrgResponse
    );
    (githubClient as any).repos.updateFile.mockResolvedValueOnce(
      updateFileResponse[0]
    );

    const resp = await bulkUpdate(targetMetadata);

    expect(resp).toEqual(updateFileResponse);
    expect(resp!.length).toBe(1);

    expect(githubClient.repos.getContents).toHaveBeenCalledWith({
      owner: fakeOrg,
      path: fakeFilePath,
      repo: "fakeRepo"
    });
    expect(githubClient.repos.listForOrg).toHaveBeenCalledWith({
      org: fakeOrg
    });
    expect(githubClient.repos.updateFile).toHaveBeenCalledWith({
      content: "ZXhwZWN0ZWRDb250ZW50",
      message: "fakeUpdateMessage",
      owner: "fakeOrg",
      path: "fake/file/path.md",
      repo: "fakeRepo"
    });
  });

  it('does nothing if "targetMetadataList" is an empty Array.', async () => {
    expect(await bulkUpdate([])).toBe(undefined);
  });

  it('runs "getReposByOrg" if "targetMetadata.repos" and "targetMetadata.repos.length === 0".', async () => {
    const getContentsResponse = {
      data: { content: "VHVSdExl", encoding: "base64" }
    };
    const listForOrgResponse = {
      data: [{ name: "fakeRepo", owner: { login: "fakeOrg" } }]
    };
    const updateFileResponse = [{ data: { success: true } }];

    (githubClient as any).repos.getContents.mockResolvedValueOnce(
      getContentsResponse
    );
    (githubClient as any).repos.listForOrg.mockResolvedValueOnce(
      listForOrgResponse
    );
    (githubClient as any).repos.updateFile.mockResolvedValueOnce(
      updateFileResponse[0]
    );

    const metadata = targetMetadata.map(metadata => ({ ...metadata, repos: [] }));

    await bulkUpdate(metadata);

    expect(githubClient.repos.listForOrg).toHaveBeenCalledTimes(1);
  });

  it('runs "getReposByName" if "targetMetadata.repos" and "targetMetadata.repos.length > 0".', async () => {
    const repoData = [
      { data: { name: "fakeRepo_1", owner: { login: "fakeOwner" } } },
      { data: { name: "fakeRepo_2", owner: { login: "fakeOwner" } } },
      { data: { name: "fakeRepo_3", owner: { login: "fakeOwner" } } },
      { data: { name: "fakeRepo_4", owner: { login: "fakeOwner" } } }
    ];

    const responseIterator = new DataIterator(...repoData);

    const getContentsResponse = {
      data: { content: "VHVSdExl", encoding: "base64" }
    };

    const updateFileResponse = [{ data: { success: true } }];

    (githubClient as any).repos.get = jest.fn(
      () => responseIterator.next().value
    );
    (githubClient as any).repos.getContents.mockResolvedValue(
      getContentsResponse
    );
    (githubClient as any).repos.updateFile.mockResolvedValue(
      updateFileResponse[0]
    );

    const metadata = targetMetadata.map(metadata => ({ ...metadata, repos: ['repo_1', 'repo_2'] }));

    await bulkUpdate(metadata);

    expect(githubClient.repos.get).toHaveBeenCalledTimes(2);
  });

  it('throws an error if "pendingUpdates.length === 0".', async () => {
    const getContentsResponse = {
      data: { content: "VHVSdExl", encoding: "base64" }
    };
    const listForOrgResponse = {
      data: []
    };

    let errorThrown = false;

    (githubClient as any).repos.getContents.mockResolvedValueOnce(
      getContentsResponse
    );
    (githubClient as any).repos.listForOrg.mockResolvedValueOnce(
      listForOrgResponse
    );

    try {
      await bulkUpdate(targetMetadata);
    } catch (err) {
      errorThrown = true;
      expect(err.message).toBe('Error: No repository data found for "fakeOrg".');
    }

    expect(errorThrown).toBe(true);
    expect(githubClient.repos.listForOrg).toHaveBeenCalledWith({ org: "fakeOrg" });
    expect(githubClient.repos.getContents).not.toHaveBeenCalled();
    expect(githubClient.repos.updateFile).not.toHaveBeenCalled();
  });
});

describe("getReposByName", () => {
  it('calls "githubClient.repos.get" for each "repo" in TargetMetadata.', async () => {
    const responseData = [
      { data: { name: "fakeRepo_1", owner: { login: "fakeOwner" } } },
      { data: { name: "fakeRepo_2", owner: { login: "fakeOwner" } } },
      { data: { name: "fakeRepo_3", owner: { login: "fakeOwner" } } },
      { data: { name: "fakeRepo_4", owner: { login: "fakeOwner" } } }
    ];
    const targetData = [
      {
        targetMetadata: {
          org: "fakeOrg",
          repos: responseData.map(repo => repo.data.name),
          updateMessage: "fakeUpdateMessage",
          contentTransformer: () => "expectedContent",
          filePath: "fakeFilePath"
        }
      },
      {
        targetMetadata: {
          org: "Overwatch",
          repos: responseData.map(repo => repo.data.name),
          updateMessage: "overwatchUpdateMessage",
          contentTransformer: () => "overwatchExpectedContent",
          filePath: "overwatchFakeFilePath"
        }
      }
    ];

    const responseIterator = new DataIterator(...responseData);
    const targetIterator = new DataIterator(...targetData);

    (githubClient as any).repos.get = jest.fn(
      () => responseIterator.next().value
    );

    do {
      const target = targetIterator.next().value;

      const response = await getReposByName(target.targetMetadata);

      expect(response).toEqual(
        responseData.reduce(
          (memo, repo) => [...memo, repo.data],
          [] as RepositoryMetadata[]
        )
      );
    } while (!targetIterator.done);

    expect(githubClient.repos.get).toHaveBeenCalledTimes(4);
  });
});

describe("getReposByOrg", () => {
  it('calls "githubClient.repos.listForOrg" internally.', async () => {
    const targetData = [
      {
        org: "fakeOrg",
        updateMessage: "fakeUpdateMessage",
        contentTransformer: () => "expectedContent",
        filePath: "fakeFilePath",
        response: [
          {
            name: "fakeRepo_1",
            result: {
              data: { name: "fakeRepo_1", owner: { login: "fakeOrg" } }
            }
          },
          {
            name: "fakeRepo_2",
            result: {
              data: { name: "fakeRepo_2", owner: { login: "fakeOrg" } }
            }
          },
          {
            name: "fakeRepo_3",
            result: {
              data: { name: "fakeRepo_3", owner: { login: "fakeOrg" } }
            }
          },
          {
            name: "fakeRepo_4",
            result: {
              data: { name: "fakeRepo_4", owner: { login: "fakeOrg" } }
            }
          }
        ]
      },
      {
        org: "overwatchOrg",
        repos: [],
        updateMessage: "overwatchUpdateMessage",
        contentTransformer: () => "overwatchExpectedContent",
        filePath: "overwatchFakeFilePath",
        response: [
          {
            name: "overwatchFakeRepo_1",
            result: {
              data: {
                name: "overwatchFakeRepo_1",
                owner: { login: "overwatchOrg" }
              }
            }
          },
          {
            name: "overwatchFakeRepo_2",
            result: {
              data: {
                name: "overwatchFakeRepo_2",
                owner: { login: "overwatchOrg" }
              }
            }
          }
        ]
      }
    ];
    const targetIterator = new DataIterator(...targetData);

    do {
      const target = targetIterator.next().value;

      (githubClient as any).repos.listForOrg = jest.fn(() => {
        const resp = target.response.reduce(
          (memo, next) => [...memo, next.result.data],
          [] as Partial<RepositoryMetadata>[]
        );

        return { data: resp };
      });

      const response = await getReposByOrg(target);

      expect(githubClient.repos.listForOrg).toHaveBeenCalledTimes(1);
      expect(response).toEqual(
        target.response.reduce(
          (memo, repo) => [...memo, repo.result.data],
          [] as RepositoryMetadata[]
        )
      );
    } while (!targetIterator.done);
  });

  it('throws an error if "githubClient.repos.listForOrg" fails.', async () => {
    const errorMessage =
      'Something bad happened when trying to get "listForOrg".';
    let errorThrown = false;

    (githubClient as any).repos.listForOrg.mockRejectedValueOnce(
      new Error(errorMessage)
    );

    try {
      await getReposByOrg({
        org: "overwatchOrg",
        repos: [],
        updateMessage: "overwatchUpdateMessage",
        contentTransformer: () => "overwatchExpectedContent",
        filePath: "overwatchFakeFilePath"
      });
    } catch (err) {
      errorThrown = true;
      expect(err.message).toBe(`Error: ${errorMessage}`);
    }

    expect(errorThrown).toBe(true);
  });
});
