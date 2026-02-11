export function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <span className="font-tourney font-semibold uppercase tracking-wider text-xl md:text-2xl">
        {title}
      </span>
      <div className="w-3 h-px bg-foreground rounded-full" />
    </div>
  );
}
