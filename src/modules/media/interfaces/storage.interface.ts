export interface UploadResult {
  url: string;
  key: string;
  filename: string;
  mimetype: string;
  size: number;
}

export interface IStorageService {
  upload(file: Express.Multer.File, folder?: string): Promise<UploadResult>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
}
