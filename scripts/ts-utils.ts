import { readdir, readFile, mkdir, copyFile, access, writeFile } from "fs/promises";
import path from "path";

export async function copyDirRecursive(srcDir: string, destDir: string) {
  const srcPaths = await readDirRecursive(srcDir);
  const copyTask = srcPaths.map((srcPath) => ({
    from: path.resolve(srcPath),
    to: path.resolve(destDir, path.relative(srcDir, srcPath)),
  }));

  await Promise.all(copyTask.map((copyTask) => safeCopyFile(copyTask.from, copyTask.to)));

  return copyTask;
}

export async function readDirRecursive(dir: string): Promise<string[]> {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map(async (dirent) => {
      const res = path.join(dir, dirent.name);
      return dirent.isDirectory() ? await readDirRecursive(res) : res;
    })
  );
  return files.flat();
}

export async function batchReadTextFiles(paths: string[]): Promise<string[]> {
  return Promise.all(paths.map((path) => readFile(path, "utf-8")));
}

export async function transformTextFile(srcPath: string, targetPath: string, transformer: (content: string) => string) {
  const contentIn = await readFile(srcPath, "utf-8");
  const contentOut = transformer(contentIn);
  await writeFile(targetPath, contentOut);
}

export async function safeCopyFile(src: string, dest: string) {
  const dir = path.dirname(dest);

  await mkdir(dir, { recursive: true });
  return copyFile(src, dest);
}

export async function exists(path: string) {
  try {
    await access(path);
    return true;
  } catch (error) {
    return false;
  }
}
