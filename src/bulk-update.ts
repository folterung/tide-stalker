import Octokit, { ReposGetResponse, ReposUpdateFileResponse } from '@octokit/rest';

import { githubClient } from './github-client';
import { TargetMetadata, RepositoryMetadata } from './models';
import { Repository } from './repository';

/**
 * @description - Updates a file for each repository in the specified GitHub Organization.
 * @param { TargetMetadata[] } targetMetadataList - A list containing all of the target metadata required to update files in GitHub.
 * @throws { Error } - Throw an error if any of the requested file updates fail.
 */
export async function bulkUpdate(targetMetadataList: TargetMetadata[]): Promise<(Octokit.Response<ReposUpdateFileResponse> | undefined)[] | undefined> {
  for (const targetMetadata of targetMetadataList) {
    const pendingUpdates: Promise<Octokit.Response<ReposUpdateFileResponse> | undefined>[] = [];
    const repoMetadataList: RepositoryMetadata[] = (targetMetadata.repos && targetMetadata.repos.length !== 0) ? await getReposByName(targetMetadata) : await getReposByOrg(targetMetadata);

    let result: (Octokit.Response<ReposUpdateFileResponse> | undefined)[] | undefined;

    for (const repoMetadata of repoMetadataList) {
      const repo = new Repository(repoMetadata);

      pendingUpdates.push(repo.updateFile({
        filePath: targetMetadata.filePath,
        message: targetMetadata.updateMessage,
        contentTransformer: content => targetMetadata.contentTransformer(content, repo.metadata)
      }));
    }

    try {
      if (pendingUpdates.length === 0) {
        throw new Error(`No repository data found for "${targetMetadata.org}".`);
      }

      result = await Promise.all(pendingUpdates);
    } catch (err) {
      throw new Error(err);
    }

    return result;
  }
}

/**
 * @description - Gets all repositories supplied via the "repos" property on {@link TargetMetadata}.
 * @param { TargetMetadata } targetMetadata - Necessary information for completing a bulk update to GitHub.
 * @returns { Promise<RepositoryMetadata[]> } - A promise which returns a list of type {@link RepositoryMetadata}.
 */
export async function getReposByName(targetMetadata: TargetMetadata): Promise<RepositoryMetadata[]> {
  const requests = targetMetadata.repos!.map(repoName => githubClient.repos.get({ owner: targetMetadata.org, repo: repoName }));
  const repositoryMetadata = await Promise.all(requests);

  return repositoryMetadata.reduce((memo, resp) => [...memo, resp.data], [] as ReposGetResponse[]);
}

/**
 * @description - Gets a list of all repositories in a given GitHub Organization.
 * @param { TargetMetadata } targetMetadata - {@link TargetMetadata} required for getting all repository information.
 * @returns { Promise<RepositoryMetadata[]> } - A promise which returns a list of type {@link RepositoryMetadata}.
 */
export async function getReposByOrg(targetMetadata: TargetMetadata): Promise<RepositoryMetadata[]> {
  try {
    const resp = await githubClient.repos.listForOrg({ org: targetMetadata.org });

    return resp.data as RepositoryMetadata[];
  } catch (err) {
    throw new Error(err);
  }
}
