import { prepareRichHtml } from "@/lib/rich-text";
import { cn } from "@/lib/utils";

export function RichText({
  html,
  className,
}: {
  html: string | null | undefined;
  className?: string;
}) {
  const prepared = prepareRichHtml(html);
  if (!prepared) return null;

  return <div className={cn("rich-text", className)} dangerouslySetInnerHTML={{ __html: prepared }} />;
}
