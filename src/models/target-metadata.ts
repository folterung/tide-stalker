import { ContentTransformer } from './content-transformer';

export interface TargetMetadata {
  contentTransformer: ContentTransformer;
  filePath: string;
  org: string;
  repos?: string[];
  updateMessage: string;
}
