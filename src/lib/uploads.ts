import path from "node:path";

export type UploadKind = "image" | "document";
export type UploadScope = "product-image" | "product-document" | "site-image";

const IMAGE_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
};

const DOCUMENT_MIME: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/vnd.ms-excel": ".xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "text/plain": ".txt",
};

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_DOCUMENT_BYTES = 20 * 1024 * 1024;

function extensionFromName(fileName: string) {
  const ext = path.extname(fileName).toLowerCase();
  return ext && ext.length <= 8 ? ext : "";
}

function resolveExtension(kind: UploadKind, mimeType: string, fileName: string) {
  const fromName = extensionFromName(fileName);
  if (fromName) return fromName;

  const map = kind === "image" ? IMAGE_MIME : DOCUMENT_MIME;
  return map[mimeType] ?? "";
}

/** Корень загрузок: в Docker — volume /app/data/uploads, локально — data/uploads. */
export function getUploadRoot() {
  return process.env.UPLOADS_DIR ?? path.join(process.cwd(), "data", "uploads");
}

export function getUploadDir(scope: UploadScope) {
  const segments =
    scope === "product-document"
      ? ["products", "documents"]
      : scope === "site-image"
        ? ["site", "images"]
        : ["products", "images"];

  return path.join(getUploadRoot(), ...segments);
}

export function getUploadPublicPath(scope: UploadScope, fileName: string) {
  const segments =
    scope === "product-document"
      ? ["products", "documents"]
      : scope === "site-image"
        ? ["site", "images"]
        : ["products", "images"];

  return `/uploads/${segments.join("/")}/${fileName}`;
}

export function resolveUploadedFilePath(segments: string[]) {
  const root = path.resolve(getUploadRoot());
  const filePath = path.resolve(root, ...segments);

  if (!filePath.startsWith(`${root}${path.sep}`) && filePath !== root) {
    return null;
  }

  return filePath;
}

export const UPLOAD_EXTENSION_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".txt": "text/plain",
};

export async function saveUploadedFile(file: File, kind: UploadKind, scope?: UploadScope) {
  const resolvedScope: UploadScope =
    scope ?? (kind === "document" ? "product-document" : "product-image");
  const mimeType = file.type || "application/octet-stream";
  const allowed = kind === "image" ? IMAGE_MIME : DOCUMENT_MIME;
  const maxBytes = kind === "image" ? MAX_IMAGE_BYTES : MAX_DOCUMENT_BYTES;

  if (!allowed[mimeType]) {
    throw new Error(kind === "image" ? "Допустимы JPG, PNG, WebP, GIF, SVG" : "Допустимы PDF, DOC, DOCX, XLS, XLSX, TXT");
  }

  if (file.size > maxBytes) {
    throw new Error(`Файл слишком большой (макс. ${kind === "image" ? "10" : "20"} МБ)`);
  }

  const ext = resolveExtension(kind, mimeType, file.name);
  if (!ext) {
    throw new Error("Не удалось определить тип файла");
  }

  const { mkdir, writeFile, stat } = await import("node:fs/promises");
  const { randomBytes } = await import("node:crypto");

  const dir = getUploadDir(resolvedScope);
  await mkdir(dir, { recursive: true });

  const safeName = `${Date.now()}-${randomBytes(6).toString("hex")}${ext}`;
  const diskPath = path.join(dir, safeName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(diskPath, buffer);

  const saved = await stat(diskPath);
  if (!saved.isFile() || saved.size !== buffer.length) {
    throw new Error("Файл не сохранился на диск");
  }

  const publicPath = getUploadPublicPath(resolvedScope, safeName);

  return {
    url: publicPath,
    fileName: file.name,
    mimeType,
  };
}
