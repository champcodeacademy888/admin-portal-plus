interface FilterTab {
  label: string;
  count?: number;
  active?: boolean;
  badgeCount?: number;
  badgeColor?: string;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  activeIndex: number;
  onChange: (index: number) => void;
  subtitle?: string;
}

export default function FilterTabs({ tabs, activeIndex, onChange, subtitle }: FilterTabsProps) {
  return (
    <div className="mb-6">
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => onChange(i)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              i === activeIndex
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-foreground border-border hover:border-primary/50"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full px-1 text-[10px] font-bold text-white ${
                tab.badgeColor || "bg-muted-foreground/60"
              }`}>
                {tab.count}
              </span>
            )}
            {tab.badgeCount !== undefined && (
              <span className={`ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full px-1 text-[10px] font-bold text-white ${tab.badgeColor || "bg-destructive"}`}>
                {tab.badgeCount}
              </span>
            )}
          </button>
        ))}
      </div>
      {subtitle && <p className="text-xs text-muted-foreground mt-2 ml-1">{subtitle}</p>}
    </div>
  );
}
