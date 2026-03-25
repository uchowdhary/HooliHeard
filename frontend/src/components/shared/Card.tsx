import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
}

export function StatCard({ title, value, subtitle, icon, className }: StatCardProps) {
  const valueStr = String(value);
  const isLong = valueStr.length > 8;
  return (
    <div className={cn("card p-4", className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 truncate">{title}</p>
          <p className={cn(
            "mt-1 font-bold text-slate-900 truncate",
            isLong ? "text-lg" : "text-2xl",
          )} title={valueStr}>
            {value}
          </p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-400 truncate">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function Card({ title, subtitle, children, className, action }: CardProps) {
  return (
    <div className={cn("card", className)}>
      {title && (
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
