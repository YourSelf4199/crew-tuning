import { Injectable } from '@angular/core';
import { getUrl } from '@aws-amplify/storage';
import { Observable, from, map, catchError, forkJoin } from 'rxjs';

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

  getSignedUrl(path: string): Observable<string> {
    return from(getUrl({ path: this.fixImagePath(path) })).pipe(
      map((result) => result.url.toString()),
      catchError((error) => {
        console.error('Error getting signed URL:', error);
        throw error;
      }),
    );
  }

  getSignedUrls(paths: string[]): Observable<string[]> {
    return forkJoin(
      paths.map((path) =>
        from(getUrl({ path: this.fixImagePath(path) })).pipe(
          map((result) => result.url.toString()),
        ),
      ),
    ).pipe(
      catchError((error) => {
        console.error('Error getting signed URLs:', error);
        throw error;
      }),
    );
  }

  private fixImagePath(path: string): string {
    if (path.endsWith('jpg') && !path.endsWith('.jpg')) {
      return path.replace('jpg', '.jpg');
    }
    return path;
  }
}
