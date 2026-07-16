"use client";

import { cn } from "@/lib/utils";

export function SmoothScrollLink({
  targetId,
  children,
  className,
}: {
  targetId: string;
  children: React.ReactNode;
  className?: string;
}) {
  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    const target = document.getElementById(targetId);
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "start" });

    target.classList.add("scroll-target-flash");
    window.setTimeout(() => target.classList.remove("scroll-target-flash"), 900);

    const url = new URL(window.location.href);
    url.hash = targetId;
    window.history.replaceState(null, "", url);
  }

  return (
    <a href={`#${targetId}`} onClick={handleClick} className={cn(className)}>
      {children}
    </a>
  );
}
