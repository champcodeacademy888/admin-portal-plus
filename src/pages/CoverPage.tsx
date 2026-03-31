import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";

const data = [
  { student: "Ethan Tan", classDate: "27 Mar, 15:20", originalTutor: "Arun Sharma", status: "PENDING", coverTutor: "Unassigned", country: "SG" },
  { student: "Priya Sharma", classDate: "25 Mar, 15:20", originalTutor: "Mei Ling Tan", status: "COMPLETED", coverTutor: "Dewi Putri", country: "SG" },
  { student: "Lily Ong", classDate: "23 Mar, 15:20", originalTutor: "Mei Ling Tan", status: "COMPLETED", coverTutor: "Fatima Al-Hassan", country: "SG" },
  { student: "Jayden Lee", classDate: "19 Mar, 15:20", originalTutor: "Mei Ling Tan", status: "PENDING", coverTutor: "Unassigned", country: "SG" },
  { student: "Isabelle Tan", classDate: "17 Mar, 15:20", originalTutor: "Mei Ling Tan", status: "COMPLETED", coverTutor: "Nuwan Perera", country: "SG" },
  { student: "Aisha Rahman", classDate: "13 Mar, 15:20", originalTutor: "Jason Lau", status: "COMPLETED", coverTutor: "Arun Sharma", country: "HK" },
  { student: "Anya Krishnan", classDate: "11 Mar, 15:20", originalTutor: "Jason Lau", status: "PENDING", coverTutor: "Unassigned", country: "HK" },
  { student: "Noah Ibrahim", classDate: "2 Mar, 15:20", originalTutor: "Jason Lau", status: "COMPLETED", coverTutor: "Rizal Hakim", country: "HK" },
  { student: "Hannah Goh", classDate: "5 Mar, 15:20", originalTutor: "Jason Lau", status: "COMPLETED", coverTutor: "Maria Santos", country: "HK" },
];

const columns = [
  { key: "student", header: "Student" },
  { key: "classDate", header: "Class Date" },
  { key: "originalTutor", header: "Original Tutor" },
  { key: "status", header: "Status", render: (r: typeof data[0]) => <span className={`font-semibold text-sm ${r.status === "PENDING" ? "text-warning" : "text-success"}`}>{r.status}</span> },
  { key: "coverTutor", header: "Cover Tutor" },
  { key: "country", header: "Country" },
];

export default function CoverPage() {
  return (
    <div>
      <PageHeader title="Cover" subtitle="Arrange cover teachers for classes" />
      <DataTable columns={columns} data={data} totalItems={9} />
    </div>
  );
}
