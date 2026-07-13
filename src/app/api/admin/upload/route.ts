import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { saveUploadedFile, type UploadKind } from "@/lib/uploads";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const kind = String(formData.get("kind") ?? "image") as UploadKind;

    if (!(file instanceof File) || !file.size) {
      return NextResponse.json({ error: "Файл не выбран" }, { status: 400 });
    }

    if (kind !== "image" && kind !== "document") {
      return NextResponse.json({ error: "Некорректный тип загрузки" }, { status: 400 });
    }

    const saved = await saveUploadedFile(file, kind);
    return NextResponse.json(saved);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка загрузки";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
