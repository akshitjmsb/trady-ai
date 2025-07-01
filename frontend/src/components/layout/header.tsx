import { cn } from "@/lib/utils";

export function Header({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <header
      className={cn(
        "flex h-16 w-full items-center justify-between border-b border-border/40 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-4">
        <h1 className="font-bold text-lg">Trady AI</h1>
      </div>
      {/* Placeholder for user menu or other controls */}
      <div className="flex items-center gap-4">
        {/* <UserMenu /> */}
      </div>
    </header>
  );
}
