"use client";

import { useState } from "react";
import { NEW_FILTER_GROUP } from "@/lib/filter-groups";

export type FilterGroupOption = { id: string; name: string };

export function FilterGroupSelect({
  groups,
  defaultGroupId,
}: {
  groups: FilterGroupOption[];
  defaultGroupId?: string | null;
}) {
  // Пока в базе есть одноимённые группы, показываем их одной строкой: при сохранении они склеятся.
  const byName = new Map<string, string>();
  for (const group of groups) {
    if (!byName.has(group.name)) byName.set(group.name, group.id);
  }
  const uniqueGroups = [...byName].map(([name, id]) => ({ id, name }));
  const currentName = groups.find((group) => group.id === defaultGroupId)?.name;

  const [value, setValue] = useState(currentName ? (byName.get(currentName) ?? "") : "");

  return (
    <div className="space-y-2 rounded-2xl border border-border bg-background p-4">
      <div className="text-sm font-bold text-graphite">Группа фильтра</div>
      <select name="groupId" value={value} onChange={(event) => setValue(event.target.value)} className="admin-input">
        <option value="">Без группы</option>
        {uniqueGroups.map((group) => (
          <option key={group.id} value={group.id}>
            {group.name}
          </option>
        ))}
        <option value={NEW_FILTER_GROUP}>+ Новая группа</option>
      </select>
      {value === NEW_FILTER_GROUP ? (
        <input name="groupName" required placeholder="Название новой группы" className="admin-input" />
      ) : null}
      <p className="text-xs text-muted">Поля с одной группой выводятся в фильтре каталога одним блоком.</p>
    </div>
  );
}
