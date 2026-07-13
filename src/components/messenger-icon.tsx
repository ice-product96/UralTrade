export const MESSENGER_ICONS = {
  telegram: { src: "/icons/messengers/telegram.svg", label: "Telegram" },
  whatsapp: { src: "/icons/messengers/whatsapp.svg", label: "WhatsApp" },
  max: { src: "/icons/messengers/max.svg", label: "MAX" },
} as const;

export type MessengerKey = keyof typeof MESSENGER_ICONS;

export function MessengerIcon({ messenger, size = 20 }: { messenger: MessengerKey; size?: number }) {
  const item = MESSENGER_ICONS[messenger];

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={item.src} alt="" width={size} height={size} className="shrink-0 rounded-md" aria-hidden />
  );
}
