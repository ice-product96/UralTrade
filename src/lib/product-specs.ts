export type SpecFieldValueLike = {
  option: { label: string } | null;
  brandRef: { name: string } | null;
  valueNumber: number | { toString(): string } | null;
  valueBoolean: boolean | null;
  valueText: string | null;
  valueJson: unknown;
  field: { unit: string | null };
};

export function formatFieldValue(value: SpecFieldValueLike) {
  if (value.option) return value.option.label;
  if (value.brandRef) return value.brandRef.name;
  if (value.valueNumber != null) return `${value.valueNumber}${value.field.unit ? ` ${value.field.unit}` : ""}`;
  if (value.valueBoolean != null) return value.valueBoolean ? "Да" : "Нет";
  if (value.valueText) return value.valueText;
  if (Array.isArray(value.valueJson)) {
    return value.valueJson
      .map((item) => {
        if (!item || typeof item !== "object" || !("key" in item) || !("value" in item)) return null;
        return `${String(item.key)}: ${String(item.value)}`;
      })
      .filter(Boolean)
      .join(", ");
  }
  return "Заполнено";
}
