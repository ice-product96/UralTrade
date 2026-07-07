"use client";

import { Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createFieldDefinition,
  createFieldTemplate,
  deleteFieldDefinition,
  deleteFieldTemplate,
  updateFieldDefinition,
  updateFieldTemplate,
} from "@/app/admin/actions";
import { AdminFormActions } from "@/components/admin/admin-form-footer";
import { AdminModal } from "@/components/admin/admin-modal";
import { useCrudModal } from "@/components/admin/use-crud-modal";

const FIELD_TYPES = ["TEXT", "NUMBER", "SELECT", "MULTISELECT", "BOOLEAN", "FILE", "BRAND_REF", "KEY_VALUE", "RANGE"];
const FILTER_WIDGETS = ["CHECKBOX", "RANGE", "SWITCH", "SEARCHABLE_LIST"];

type FieldOption = { id: string; label: string; slug: string };
type FieldRow = {
  id: string;
  name: string;
  slug: string;
  type: string;
  unit: string | null;
  isFilterable: boolean;
  filterWidget: string | null;
  sortOrder: number;
  group: { name: string } | null;
  options: FieldOption[];
};

type TemplateRow = {
  id: string;
  name: string;
  description: string | null;
  fields: FieldRow[];
};

export function FieldsCrud({ templates }: { templates: TemplateRow[] }) {
  const router = useRouter();
  const templateModal = useCrudModal<TemplateRow>();
  const fieldModal = useCrudModal<FieldRow & { templateId: string }>();
  const [templateMode, setTemplateMode] = useState<"create" | "edit">("create");
  const [fieldMode, setFieldMode] = useState<"create" | "edit">("create");
  const [activeTemplateId, setActiveTemplateId] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(action: (fd: FormData) => Promise<void>, close: () => void) {
    return (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      startTransition(async () => {
        await action(formData);
        router.refresh();
        close();
      });
    };
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-graphite">Конструктор полей</h1>
          <p className="mt-2 text-muted">Шаблоны карточек и настройка фасетного фильтра.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setTemplateMode("create");
              templateModal.openCreate();
            }}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-white px-5 text-sm font-bold text-petrol hover:bg-background"
          >
            <Plus className="h-4 w-4" />
            Шаблон
          </button>
          <button
            type="button"
            onClick={() => {
              setFieldMode("create");
              setActiveTemplateId(templates[0]?.id ?? "");
              fieldModal.openCreate();
            }}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-lime px-5 text-sm font-bold text-white hover:bg-lime-hover"
          >
            <Plus className="h-4 w-4" />
            Поле
          </button>
        </div>
      </div>

      <section className="space-y-5">
        {templates.map((template) => (
          <article key={template.id} className="rounded-[30px] border border-border bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-graphite">{template.name}</h2>
                <p className="mt-1 text-sm text-muted">{template.description}</p>
              </div>
              <div className="flex gap-2">
                <span className="rounded-full bg-background px-3 py-1 text-xs font-bold text-petrol">{template.fields.length} полей</span>
                <button
                  type="button"
                  onClick={() => {
                    setTemplateMode("edit");
                    templateModal.openEdit(template);
                  }}
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-border px-4 text-sm font-bold text-petrol hover:bg-background"
                >
                  <Pencil className="h-4 w-4" />
                  Шаблон
                </button>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              {template.fields.map((field) => (
                <div key={field.id} className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-border p-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-bold text-graphite">{field.name}</div>
                      <span className="rounded-full bg-petrol/10 px-2 py-1 text-xs font-bold text-petrol">{field.type}</span>
                      {field.isFilterable ? <span className="rounded-full bg-lime/10 px-2 py-1 text-xs font-bold text-lime">Фильтр</span> : null}
                    </div>
                    <div className="mt-2 text-sm text-muted">
                      {field.slug} {field.unit ? `• ${field.unit}` : ""} {field.group ? `• ${field.group.name}` : ""}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFieldMode("edit");
                      fieldModal.openEdit({ ...field, templateId: template.id });
                    }}
                    className="inline-flex h-9 items-center gap-2 rounded-full border border-border px-4 text-sm font-bold text-petrol hover:bg-background"
                  >
                    <Pencil className="h-4 w-4" />
                    Изменить
                  </button>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      <AdminModal
        open={templateModal.open}
        onClose={templateModal.close}
        title={templateMode === "edit" ? "Редактировать шаблон" : "Новый шаблон"}
      >
        <form
          onSubmit={submit(templateMode === "edit" ? updateFieldTemplate : createFieldTemplate, templateModal.close)}
          className="space-y-3"
        >
          {templateModal.item ? <input type="hidden" name="id" value={templateModal.item.id} /> : null}
          <input name="name" required defaultValue={templateModal.item?.name} placeholder="Название шаблона" className="admin-input" />
          <textarea name="description" defaultValue={templateModal.item?.description ?? ""} rows={3} placeholder="Описание" className="admin-textarea" />
          <AdminFormActions
            onCancel={templateModal.close}
            onDelete={
              templateMode === "edit" && templateModal.item
                ? () => {
                    if (!confirm(`Удалить шаблон «${templateModal.item?.name}»?`)) return;
                    const fd = new FormData();
                    fd.set("id", templateModal.item!.id);
                    startTransition(async () => {
                      await deleteFieldTemplate(fd);
                      router.refresh();
                      templateModal.close();
                    });
                  }
                : undefined
            }
          />
        </form>
      </AdminModal>

      <AdminModal open={fieldModal.open} onClose={fieldModal.close} title={fieldMode === "edit" ? "Редактировать поле" : "Новое поле"} size="lg">
        <form
          onSubmit={submit(fieldMode === "edit" ? updateFieldDefinition : createFieldDefinition, fieldModal.close)}
          className="space-y-3"
        >
          {fieldModal.item ? <input type="hidden" name="id" value={fieldModal.item.id} /> : null}
          <select
            name="templateId"
            required
            defaultValue={fieldModal.item?.templateId ?? activeTemplateId}
            className="admin-input"
            disabled={fieldMode === "edit"}
          >
            <option value="">Шаблон</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
          <input name="name" required defaultValue={fieldModal.item?.name} placeholder="Название поля" className="admin-input" />
          <input name="slug" defaultValue={fieldModal.item?.slug} placeholder="slug" className="admin-input" />
          <select name="type" required defaultValue={fieldModal.item?.type ?? "TEXT"} className="admin-input">
            {FIELD_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <input name="unit" defaultValue={fieldModal.item?.unit ?? ""} placeholder="Единица измерения" className="admin-input" />
          <input name="groupName" placeholder="Группа фильтра" className="admin-input" />
          <input name="sortOrder" type="number" defaultValue={fieldModal.item?.sortOrder ?? 0} placeholder="Порядок" className="admin-input" />
          <label className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3 text-sm font-semibold">
            <input name="isFilterable" type="checkbox" defaultChecked={fieldModal.item?.isFilterable} className="accent-lime" />
            Участвует в фильтре
          </label>
          <p className="text-xs text-muted">
            Для фильтра каталога используйте тип SELECT или NUMBER, включите «Участвует в фильтре» и задайте опции. Характеристики из импорта также доступны как динамические фильтры.
          </p>
          <select name="filterWidget" defaultValue={fieldModal.item?.filterWidget ?? "CHECKBOX"} className="admin-input">
            {FILTER_WIDGETS.map((widget) => (
              <option key={widget} value={widget}>
                {widget}
              </option>
            ))}
          </select>
          <textarea
            name="options"
            rows={3}
            defaultValue={fieldModal.item?.options.map((option) => option.label).join(", ")}
            placeholder="Опции SELECT через запятую"
            className="admin-textarea"
          />
          <AdminFormActions
            onCancel={fieldModal.close}
            onDelete={
              fieldMode === "edit" && fieldModal.item
                ? () => {
                    if (!confirm(`Удалить поле «${fieldModal.item?.name}»?`)) return;
                    const fd = new FormData();
                    fd.set("id", fieldModal.item!.id);
                    startTransition(async () => {
                      await deleteFieldDefinition(fd);
                      router.refresh();
                      fieldModal.close();
                    });
                  }
                : undefined
            }
          />
          {pending ? <p className="text-sm text-muted">Сохранение...</p> : null}
        </form>
      </AdminModal>
    </>
  );
}