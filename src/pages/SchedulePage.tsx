import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";

const data = [
  { student: "Ethan Tan", day: "Monday", time: "15:00", frequency: "Weekly", class: "Scratch", tutor: "Arun Sharma", country: "SG", active: "●" },
  { student: "Chloe Lim", day: "Tuesday", time: "19:00", frequency: "Weekly", class: "Python", tutor: "Rizal Hakim", country: "MY", active: "●" },
  { student: "Arjun Menon", day: "Wednesday", time: "11:00", frequency: "Weekly", class: "Web Development", tutor: "Maria Santos", country: "PH", active: "●" },
  { student: "Sofia Reyes", day: "Thursday", time: "11:00", frequency: "Fortnightly", class: "Game Design", tutor: "Dewi Putri", country: "ID", active: "●" },
  { student: "Daniel Wong", day: "Friday", time: "16:00", frequency: "Fortnightly", class: "Roblox", tutor: "Fatima Al-Hassan", country: "AE", active: "●" },
  { student: "Aisha Rahman", day: "Saturday", time: "10:00", frequency: "Weekly", class: "App Development", tutor: "Jason Lau", country: "HK", active: "●" },
];

const columns = [
  { key: "student", header: "Student" },
  { key: "day", header: "Day" },
  { key: "time", header: "Time" },
  { key: "frequency", header: "Frequency" },
  { key: "class", header: "Class" },
  { key: "tutor", header: "Tutor" },
  { key: "country", header: "Country" },
  { key: "active", header: "Active", render: () => <span className="text-success">●</span> },
];

export default function SchedulePage() {
  return (
    <div>
      <PageHeader title="Schedule" subtitle="Class schedules per student" />
      <DataTable columns={columns} data={data} totalItems={6} />
    </div>
  );
}
