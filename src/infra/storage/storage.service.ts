import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { CryptoService } from '../crypto/crypto.service';

@Injectable()
export class StorageService {
  private readonly uploadsDir: string;

  constructor(
    private configService: ConfigService,
    private cryptoService: CryptoService,
  ) {
    this.uploadsDir = path.join(process.cwd(), 'uploads');
    this.ensureUploadsDirectory();
  }

  private async ensureUploadsDirectory() {
    try {
      await fs.access(this.uploadsDir);
    } catch {
      await fs.mkdir(this.uploadsDir, { recursive: true });
    }
  }

  async saveFile(buffer: Buffer, originalName: string, encrypt: boolean = true): Promise<string> {
    const fileId = this.cryptoService.generateUUID();
    const ext = path.extname(originalName);
    const filename = `${fileId}${ext}`;
    const filePath = path.join(this.uploadsDir, filename);

    let dataToWrite = buffer;
    if (encrypt) {
      const base64Data = buffer.toString('base64');
      const encrypted = this.cryptoService.encrypt(base64Data);
      dataToWrite = Buffer.from(encrypted, 'utf8');
    }

    await fs.writeFile(filePath, dataToWrite);
    return fileId;
  }

  async readFile(fileId: string, decrypt: boolean = true): Promise<Buffer> {
    const files = await fs.readdir(this.uploadsDir);
    const file = files.find(f => f.startsWith(fileId));
    
    if (!file) {
      throw new Error('File not found');
    }

    const filePath = path.join(this.uploadsDir, file);
    const data = await fs.readFile(filePath);

    if (decrypt) {
      try {
        const decrypted = this.cryptoService.decrypt(data.toString('utf8'));
        return Buffer.from(decrypted, 'base64');
      } catch {
        // If decryption fails, assume it's not encrypted
        return data;
      }
    }

    return data;
  }

  async deleteFile(fileId: string): Promise<void> {
    const files = await fs.readdir(this.uploadsDir);
    const file = files.find(f => f.startsWith(fileId));
    
    if (file) {
      const filePath = path.join(this.uploadsDir, file);
      await fs.unlink(filePath);
    }
  }

  async fileExists(fileId: string): Promise<boolean> {
    try {
      const files = await fs.readdir(this.uploadsDir);
      return files.some(f => f.startsWith(fileId));
    } catch {
      return false;
    }
  }
}