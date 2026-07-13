import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { saveUploadedFile, type UploadKind, type UploadScope } from "@/lib/uploads";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const kind = String(formData.get("kind") ?? "image") as UploadKind;
    const scope = String(formData.get("scope") ?? "").trim() as UploadScope | "";

    if (!(file instanceof File) || !file.size) {
      return NextResponse.json({ error: "Файл не выбран" }, { status: 400 });
    }

    if (kind !== "image" && kind !== "document") {
      return NextResponse.json({ error: "Некорректный тип загрузки" }, { status: 400 });
    }

    const allowedScopes: UploadScope[] = ["product-image", "product-document", "site-image"];
    const resolvedScope = allowedScopes.includes(scope as UploadScope) ? (scope as UploadScope) : undefined;

    const saved = await saveUploadedFile(file, kind, resolvedScope);
    return NextResponse.json(saved);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка загрузки";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
