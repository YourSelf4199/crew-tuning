import { Injectable } from '@angular/core';
import { getUrl } from '@aws-amplify/storage';

@Injectable({
  providedIn: 'root',
})
export class S3Service {
  private readonly S3_BASE_URL =
    'https://amplify-crewtuning-deave--vehicleassetsbucket9122a-f0z6ljhftsn6.s3.us-east-1.amazonaws.com';

  constructor() {}

  getFullImageUrl(relativePath: string): string {
    return `${this.S3_BASE_URL}/${relativePath}`;
  }

  async getSignedUrl(path: string): Promise<string> {
    try {
      const fixedPath = this.fixImagePath(path);
      const result = await getUrl({ path: fixedPath });
      return result.url.toString();
    } catch (error) {
      console.error('Error getting signed URL:', error);
      throw error;
    }
  }

  async getSignedUrls(paths: string[]): Promise<string[]> {
    try {
      const fixedPaths = paths.map((path) => this.fixImagePath(path));
      const results = await Promise.all(fixedPaths.map((path) => getUrl({ path })));
      return results.map((result) => result.url.toString());
    } catch (error) {
      console.error('Error getting signed URLs:', error);
      throw error;
    }
  }

  private fixImagePath(path: string): string {
    if (path.endsWith('jpg') && !path.endsWith('.jpg')) {
      return path.replace('jpg', '.jpg');
    }
    return path;
  }
}
