import { Injectable } from '@angular/core';

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
}
