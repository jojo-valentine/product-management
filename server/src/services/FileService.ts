import fs from "fs/promises";
import path from "path";

class FileService {
  async createDirectory(folderPath: string) {
    await fs.mkdir(folderPath, {
      recursive: true,
    });
  }
  async moveFile(source: string, destination: string) {
    await fs.rename(source, destination);
  }

  async moveFiles(files: Express.Multer.File[], destination: string) {
    const movedFiles: string[] = [];
    for (const file of files) {
      // ย้ายทีละไฟล์
      const oldPath = file.path;
      // path ใหม่ เช่น uploads/products/{productUuid}/xxx.webp
      const newPath = path.join(destination, file.filename);

      // ย้ายไฟล์
      await fs.rename(oldPath, newPath);

      movedFiles.push(newPath);
    }
    return movedFiles;
  }

  async deleteFile(filePath: string) {
    await fs.unlink(filePath);
  }
  // async deleteFiles(files: string[]) {
  //   for (const file of files) {
  //   }
  // }
  async deleteDirectory(folderPath: string) {
    await fs.rm(folderPath, {
      recursive: true,
      force: true,
    });
  }
  async removeFiles(filePaths: string[]) {
    await Promise.all(
      filePaths.map(async (filePath) => {
        try {
          await fs.unlink(filePath);
        } catch (error: any) {
          if (error.code !== "ENOENT") {
            throw error;
          }
        }
      }),
    );
  }
}

export default new FileService();
