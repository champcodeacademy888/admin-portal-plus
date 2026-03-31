import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        active: "bg-success/15 text-success",
        enrolled: "bg-success/15 text-success",
        completed: "bg-success text-success-foreground",
        attended: "bg-success text-success-foreground",
        scheduled: "bg-info/15 text-info",
        upcoming: "bg-info/15 text-info",
        pending: "bg-warning/15 text-warning",
        lead: "bg-muted text-muted-foreground",
        inquiry: "bg-muted text-muted-foreground",
        churned: "bg-destructive/15 text-destructive",
        noshow: "bg-destructive/15 text-destructive",
        absent: "bg-destructive text-destructive-foreground",
        lost: "bg-muted text-muted-foreground",
        cold: "bg-muted text-muted-foreground",
        trial_attended: "bg-success/15 text-success",
        trial_arranged: "bg-info/15 text-info",
        return: "bg-info/15 text-info",
        makeup: "bg-warning/15 text-warning",
        regular: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "lead",
    },
  }
);

interface StatusBadgeProps extends VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
  className?: string;
}

export default function StatusBadge({ variant, children, className }: StatusBadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)}>{children}</span>;
}
