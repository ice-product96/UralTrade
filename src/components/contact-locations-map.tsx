"use client";

import { Building2, Clock3, ExternalLink, MapPin, Phone, Warehouse } from "lucide-react";
import { useState } from "react";
import {
  buildMapEmbedHref,
  buildMapsHref,
  buildTelHref,
  type ContactLocationData,
} from "@/lib/contacts";

const kindLabels: Record<string, string> = {
  OFFICE: "Офис",
  WAREHOUSE: "Склад",
  OTHER: "Представительство",
};

export function ContactLocationsMap({ locations }: { locations: ContactLocationData[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = locations[selectedIndex] ?? locations[0];

  if (!selected) return null;

  const mapSrc = buildMapEmbedHref(selected.address, selected.mapUrl);

  return (
    <section className="mt-10">
      <div className="mb-5">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-lime">Мы рядом</div>
        <h2 className="mt-2 text-2xl font-black text-graphite sm:text-3xl">Офисы и склады</h2>
        <p className="mt-2 text-sm text-muted">Выберите нужный адрес — он откроется на карте.</p>
      </div>

      <div className="grid overflow-hidden rounded-[30px] border border-border bg-white shadow-xl shadow-petrol/5 lg:grid-cols-[360px_1fr]">
        <div className="border-b border-border bg-background/70 p-3 lg:max-h-[560px] lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <div className="space-y-2">
            {locations.map((location, index) => {
              const Icon = location.kind === "WAREHOUSE" ? Warehouse : Building2;
              const selectedLocation = index === selectedIndex;

              return (
                <button
                  key={location.id}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className={`w-full rounded-[22px] border p-4 text-left transition ${
                    selectedLocation
                      ? "border-petrol/20 bg-white shadow-lg shadow-petrol/5"
                      : "border-transparent hover:border-border hover:bg-white/70"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                        selectedLocation ? "bg-petrol text-white" : "bg-white text-petrol"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold uppercase tracking-[0.16em] text-lime">
                        {kindLabels[location.kind] ?? kindLabels.OTHER}
                      </div>
                      <h3 className="mt-1 font-black text-graphite">{location.name}</h3>
                      <div className="mt-2 flex items-start gap-2 text-sm leading-5 text-muted">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{location.address}</span>
                      </div>
                      {location.workingHours ? (
                        <div className="mt-2 flex items-center gap-2 text-xs text-muted">
                          <Clock3 className="h-4 w-4 shrink-0" />
                          <span>{location.workingHours}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex min-h-[420px] flex-col bg-background lg:min-h-[560px]">
          <div className="relative flex-1 overflow-hidden">
            <iframe
              key={`${selected.id}-${mapSrc}`}
              src={mapSrc}
              title={`Карта: ${selected.name}`}
              loading="lazy"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-white px-4 py-3 sm:px-5">
            <div className="min-w-0">
              <div className="font-black text-graphite">{selected.name}</div>
              <div className="truncate text-xs text-muted">{selected.address}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {selected.phone ? (
                <a
                  href={buildTelHref(selected.phone)}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-bold text-petrol hover:bg-background"
                >
                  <Phone className="h-4 w-4" />
                  {selected.phone}
                </a>
              ) : null}
              <a
                href={buildMapsHref(selected.address)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-petrol px-4 text-sm font-bold text-white hover:bg-petrol-soft"
              >
                Открыть карту
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
