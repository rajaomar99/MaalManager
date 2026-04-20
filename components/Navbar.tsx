"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Bell, Store, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  Icon: typeof LayoutDashboard;
};

const items: NavItem[] = [
  { href: "/", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", Icon: Package },
  { href: "/alerts", label: "Alerts", Icon: Bell },
  { href: "/categories", label: "Categories", Icon: Tag },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Navbar({ alertCount = 0 }: { alertCount?: number }) {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex md:w-60 md:flex-col md:border-r md:bg-sidebar md:text-sidebar-foreground">
        <div className="flex h-16 items-center gap-2 border-b px-5">
          <Store className="h-6 w-6 text-primary" aria-hidden />
          <div className="leading-tight">
            <p className="text-sm font-semibold">Maal Manager</p>
            <p className="text-xs text-muted-foreground">مال مینیجر</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {items.map(({ href, label, Icon }) => {
            const active = isActive(pathname, href);
            const showBadge = href === "/alerts" && alertCount > 0;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
                <span className="flex-1">{label}</span>
                {showBadge && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-semibold text-white">
                    {alertCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="border-t px-5 py-3 text-xs text-muted-foreground">
          Al-Madina General Store
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-background md:hidden">
        <ul className="grid grid-cols-4">
          {items.map(({ href, label, Icon }) => {
            const active = isActive(pathname, href);
            const showBadge = href === "/alerts" && alertCount > 0;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "relative flex min-h-[60px] flex-col items-center justify-center gap-1 py-2 text-xs font-medium",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                  <span>{label}</span>
                  {showBadge && (
                    <span className="absolute right-[calc(50%-20px)] top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white">
                      {alertCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
