import { AlertTriangle, Info, Lightbulb } from "lucide-react";

const variants = {
  warning: {
    icon: AlertTriangle,
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    iconColor: "text-red-500",
    titleColor: "text-red-400",
  },
  info: {
    icon: Info,
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    iconColor: "text-blue-500",
    titleColor: "text-blue-400",
  },
  tip: {
    icon: Lightbulb,
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    iconColor: "text-green-500",
    titleColor: "text-green-400",
  },
} as const;

export function Callout({
  type = "info",
  title,
  children,
}: {
  type?: keyof typeof variants;
  title?: string;
  children: React.ReactNode;
}) {
  const v = variants[type];
  const Icon = v.icon;

  return (
    <div className={`my-6 rounded-lg ${v.bg} ${v.border} border px-4 py-3`}>
      {title && (
        <div
          className={`flex items-center gap-2 font-medium ${v.titleColor} mb-1`}
        >
          <Icon className={`size-4 ${v.iconColor} shrink-0`} />
          <span>{title}</span>
        </div>
      )}
      <div className="text-sm text-muted-foreground leading-relaxed [&>p]:my-0">
        {children}
      </div>
    </div>
  );
}
