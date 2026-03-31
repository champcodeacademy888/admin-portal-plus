import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";

const data = [
  { name: "Ethan Goh", status: "ENROLLED", country: "MY", channel: "Whatsapp", age: 10, level: "Intermediate", package: "Intensive 24", enrolled: "15 Mar 2026" },
  { name: "Chloe Ng", status: "ENROLLED", country: "SG", channel: "Messenger", age: 9, level: "Beginner", package: "Premium 16", enrolled: "12 Mar 2026" },
  { name: "Ravi Menon", status: "ENROLLED", country: "PH", channel: "Whatsapp", age: 11, level: "Advanced", package: "Starter 8", enrolled: "08 Mar 2026" },
];

const columns = [
  { key: "name", header: "Name" },
  { key: "status", header: "Status", render: (r: typeof data[0]) => <StatusBadge variant="enrolled">{r.status}</StatusBadge> },
  { key: "country", header: "Country" },
  { key: "channel", header: "Channel" },
  { key: "age", header: "Age" },
  { key: "level", header: "Level" },
  { key: "package", header: "Package" },
  { key: "enrolled", header: "Enrolled" },
];

export default function EnrolmentsPage() {
  return (
    <div>
      <PageHeader title="Enrolments" subtitle="Recently converted leads" />
      <DataTable columns={columns} data={data} totalItems={3} />
    </div>
  );
}
