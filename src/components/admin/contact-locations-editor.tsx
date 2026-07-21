"use client";

import { ArrowDown, ArrowUp, MapPin, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export type ContactLocationRow = {
  id: string;
  name: string;
  kind: string;
  address: string;
  phone: string | null;
  workingHours: string | null;
  mapUrl: string | null;
  published: boolean;
};

export function ContactLocationsEditor({ initialLocations }: { initialLocations: ContactLocationRow[] }) {
  const [locations, setLocations] = useState(initialLocations);

  function addLocation() {
    setLocations((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: "",
        kind: "OFFICE",
        address: "",
        phone: null,
        workingHours: null,
        mapUrl: null,
        published: true,
      },
    ]);
  }

  function updateLocation(index: number, patch: Partial<ContactLocationRow>) {
    setLocations((current) => current.map((location, itemIndex) => (itemIndex === index ? { ...location, ...patch } : location)));
  }

  function moveLocation(index: number, direction: -1 | 1) {
    setLocations((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <input name="locationsJson" type="hidden" value={JSON.stringify(locations)} readOnly />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-black uppercase tracking-[0.16em] text-petrol">Офисы и склады</div>
          <p className="mt-1 text-xs leading-5 text-muted">
            Адрес автоматически появится на карте. При необходимости вставьте точную ссылку из конструктора Яндекс Карт, 2ГИС или Google Maps.
          </p>
        </div>
        <button
          type="button"
          onClick={addLocation}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-petrol px-4 text-sm font-bold text-white hover:bg-petrol-soft"
        >
          <Plus className="h-4 w-4" />
          Добавить
        </button>
      </div>

      {locations.length ? (
        <div className="mt-4 space-y-4">
          {locations.map((location, index) => (
            <article key={location.id} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 font-black text-graphite">
                  <MapPin className="h-4 w-4 text-lime" />
                  {location.name || `Адрес ${index + 1}`}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveLocation(index, -1)}
                    disabled={index === 0}
                    aria-label="Переместить выше"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-petrol disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveLocation(index, 1)}
                    disabled={index === locations.length - 1}
                    aria-label="Переместить ниже"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-petrol disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocations((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                    aria-label="Удалить адрес"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-sale/20 text-sale hover:bg-sale/5"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-muted">Название</span>
                  <input
                    value={location.name}
                    onChange={(event) => updateLocation(index, { name: event.target.value })}
                    placeholder="Главный офис"
                    className="admin-input"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-muted">Тип</span>
                  <select
                    value={location.kind}
                    onChange={(event) => updateLocation(index, { kind: event.target.value })}
                    className="admin-input"
                  >
                    <option value="OFFICE">Офис</option>
                    <option value="WAREHOUSE">Склад</option>
                    <option value="OTHER">Другое</option>
                  </select>
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-muted">Адрес</span>
                  <textarea
                    value={location.address}
                    onChange={(event) => updateLocation(index, { address: event.target.value })}
                    rows={2}
                    placeholder="Екатеринбург, ул. Примерная, 1"
                    className="admin-textarea"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-muted">Телефон</span>
                  <input
                    value={location.phone ?? ""}
                    onChange={(event) => updateLocation(index, { phone: event.target.value })}
                    placeholder="+7 (343) 000-00-00"
                    className="admin-input"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-muted">Режим работы</span>
                  <input
                    value={location.workingHours ?? ""}
                    onChange={(event) => updateLocation(index, { workingHours: event.target.value })}
                    placeholder="Пн–Пт, 09:00–18:00"
                    className="admin-input"
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-muted">Ссылка для карты (необязательно)</span>
                  <input
                    value={location.mapUrl ?? ""}
                    onChange={(event) => updateLocation(index, { mapUrl: event.target.value })}
                    placeholder="https://yandex.ru/map-widget/v1/… или код iframe"
                    className="admin-input"
                  />
                </label>
              </div>

              <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-graphite">
                <input
                  type="checkbox"
                  checked={location.published}
                  onChange={(event) => updateLocation(index, { published: event.target.checked })}
                  className="accent-lime"
                />
                Показывать на странице контактов
              </label>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-border bg-white p-6 text-center text-sm text-muted">
          Добавьте первый офис или склад.
        </div>
      )}
    </div>
  );
}
