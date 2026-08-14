import Image from "next/image";

import { APP_FAMILY, APP_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function AppLogo({
  className,
  size = 32,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <Image
      src="/logo.png"
      alt={APP_FAMILY}
      width={size}
      height={size}
      className={cn("object-contain", className)}
      priority
    />
  );
}

export function AuthBrandMark({ subtitle }: { subtitle?: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <AppLogo size={72} className="h-[72px] w-auto" />
      <h1 className="mt-3 font-heading text-2xl font-extrabold tracking-tight text-foreground">
        Realtor<span className="text-primary">One</span>
      </h1>
      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
        WACRM
      </p>
      {subtitle ? (
        <p className="mt-3 text-sm text-muted-foreground">{subtitle}</p>
      ) : null}
      <span className="sr-only">{APP_NAME}</span>
    </div>
  );
}

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 100% 0%, rgba(209, 207, 192, 0.14) 0%, transparent 45%), radial-gradient(circle at 0% 100%, rgba(29, 58, 111, 0.16) 0%, transparent 42%)",
        }}
      />
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}
