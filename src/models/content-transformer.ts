import { RepositoryMetadata } from './repository-metadata';

export type ContentTransformer = (content: string, repositoryMetadata: RepositoryMetadata) => string | null | undefined;
