import PageHeader from "@/components/PageHeader";

export default function MyClassesPage() {
  return (
    <div>
      <PageHeader title="My Classes" subtitle="View your assigned classes" />
      <div className="border border-border rounded-xl p-12 text-center text-muted-foreground">
        No classes assigned yet.
      </div>
    </div>
  );
}
