interface FilterTab {
  label: string;
  count?: number;
  active?: boolean;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  activeIndex: number;
  onChange: (index: number) => void;
}

export default function FilterTabs({ tabs, activeIndex, onChange }: FilterTabsProps) {
  return (
    <div className="flex gap-2 mb-6 flex-wrap">
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
          {tab.label}{tab.count !== undefined ? ` ${tab.count}` : ""}
        </button>
      ))}
    </div>
  );
}
