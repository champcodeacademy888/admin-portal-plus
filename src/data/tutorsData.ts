export interface Tutor {
  id: number;
  name: string;
  country: string;
  isSingaporeTrial: boolean;
  contactNumber: string;
  email: string;
}

export const tutors: Tutor[] = [
  // Singapore
  { id: 1, name: "James Yeo", country: "Singapore", isSingaporeTrial: true, contactNumber: "+65 9123 4567", email: "james.yeo@champcode.com" },
  { id: 2, name: "James Yeo2", country: "Singapore", isSingaporeTrial: false, contactNumber: "+65 9234 5678", email: "james.yeo2@champcode.com" },
  { id: 3, name: "Lester Tan", country: "Singapore", isSingaporeTrial: true, contactNumber: "+65 9345 6789", email: "lester.tan@champcode.com" },
  { id: 4, name: "Melinda Chua", country: "Singapore", isSingaporeTrial: true, contactNumber: "+65 9456 7890", email: "melinda.chua@champcode.com" },
  { id: 5, name: "Sarah Darois", country: "Singapore", isSingaporeTrial: false, contactNumber: "+65 9567 8901", email: "sarah.darois@champcode.com" },

  // Philippines
  { id: 6, name: "Abigael Pastrana", country: "Philippines", isSingaporeTrial: false, contactNumber: "+63 917 123 4567", email: "abigael.pastrana@champcode.com" },
  { id: 7, name: "Adriane Manzano", country: "Philippines", isSingaporeTrial: false, contactNumber: "+63 918 234 5678", email: "adriane.manzano@champcode.com" },
  { id: 8, name: "Christie Cadio", country: "Philippines", isSingaporeTrial: false, contactNumber: "+63 919 345 6789", email: "christie.cadio@champcode.com" },
  { id: 9, name: "Eleanor Dapas", country: "Philippines", isSingaporeTrial: false, contactNumber: "+63 920 456 7890", email: "eleanor.dapas@champcode.com" },
  { id: 10, name: "Lizzane Majes", country: "Philippines", isSingaporeTrial: false, contactNumber: "+63 921 567 8901", email: "lizzane.majes@champcode.com" },
  { id: 11, name: "Nelson Philip Alo St. Nic.", country: "Philippines", isSingaporeTrial: false, contactNumber: "+63 922 678 9012", email: "nelson.alo@champcode.com" },

  // Malaysia
  { id: 12, name: "Abigail Chong", country: "Malaysia", isSingaporeTrial: false, contactNumber: "+60 12 345 6789", email: "abigail.chong@champcode.com" },
  { id: 13, name: "Ching Lun Yeong", country: "Malaysia", isSingaporeTrial: false, contactNumber: "+60 13 456 7890", email: "chinglun.yeong@champcode.com" },
  { id: 14, name: "Dickson Hau", country: "Malaysia", isSingaporeTrial: false, contactNumber: "+60 14 567 8901", email: "dickson.hau@champcode.com" },
  { id: 15, name: "Karina Chai", country: "Malaysia", isSingaporeTrial: false, contactNumber: "+60 16 678 9012", email: "karina.chai@champcode.com" },

  // India
  { id: 16, name: "Ayesha Zeeshan", country: "India", isSingaporeTrial: false, contactNumber: "+91 98765 43210", email: "ayesha.zeeshan@champcode.com" },
  { id: 17, name: "Deeksha Banjal", country: "India", isSingaporeTrial: false, contactNumber: "+91 98765 43211", email: "deeksha.banjal@champcode.com" },
  { id: 18, name: "Divina Violet", country: "India", isSingaporeTrial: false, contactNumber: "+91 98765 43212", email: "divina.violet@champcode.com" },
  { id: 19, name: "Kamal Jaglani", country: "India", isSingaporeTrial: false, contactNumber: "+91 98765 43213", email: "kamal.jaglani@champcode.com" },
  { id: 20, name: "Rahul Shastri", country: "India", isSingaporeTrial: false, contactNumber: "+91 98765 43214", email: "rahul.shastri@champcode.com" },
  { id: 21, name: "Sandhya Kumar", country: "India", isSingaporeTrial: false, contactNumber: "+91 98765 43215", email: "sandhya.kumar@champcode.com" },
  { id: 22, name: "Salso Saseen", country: "India", isSingaporeTrial: false, contactNumber: "+91 98765 43216", email: "salso.saseen@champcode.com" },

  // Pakistan
  { id: 23, name: "Abdullah Qazi", country: "Pakistan", isSingaporeTrial: false, contactNumber: "+92 300 1234567", email: "abdullah.qazi@champcode.com" },
  { id: 24, name: "Aisha Rizvi", country: "Pakistan", isSingaporeTrial: false, contactNumber: "+92 301 2345678", email: "aisha.rizvi@champcode.com" },
  { id: 25, name: "Iqra Zafar", country: "Pakistan", isSingaporeTrial: false, contactNumber: "+92 302 3456789", email: "iqra.zafar@champcode.com" },
  { id: 26, name: "Mohammad Naheel", country: "Pakistan", isSingaporeTrial: false, contactNumber: "+92 303 4567890", email: "mohammad.naheel@champcode.com" },

  // Indonesia
  { id: 27, name: "Anetta Widapa", country: "Indonesia", isSingaporeTrial: false, contactNumber: "+62 812 3456 7890", email: "anetta.widapa@champcode.com" },
  { id: 28, name: "Keke Putri Gangi", country: "Indonesia", isSingaporeTrial: false, contactNumber: "+62 813 4567 8901", email: "keke.gangi@champcode.com" },
  { id: 29, name: "Gadis Nur Fauziah", country: "Indonesia", isSingaporeTrial: false, contactNumber: "+62 814 5678 9012", email: "gadis.fauziah@champcode.com" },
  { id: 30, name: "Shanti Widayanti", country: "Indonesia", isSingaporeTrial: false, contactNumber: "+62 815 6789 0123", email: "shanti.widayanti@champcode.com" },
];

export const tutorNames = tutors.map(t => t.name);

export function getTutorsByCountry(country: string): Tutor[] {
  return tutors.filter(t => t.country === country);
}

export function getRandomTutor(): string {
  return tutors[Math.floor(Math.random() * tutors.length)].name;
}

export function getRandomTutorForCountry(country: string): string {
  const countryTutors = getTutorsByCountry(country);
  if (countryTutors.length === 0) return getRandomTutor();
  return countryTutors[Math.floor(Math.random() * countryTutors.length)].name;
}

const countryFlags: Record<string, string> = {
  Singapore: "🇸🇬",
  Philippines: "🇵🇭",
  Malaysia: "🇲🇾",
  India: "🇮🇳",
  Pakistan: "🇵🇰",
  Indonesia: "🇮🇩",
};

export { countryFlags as tutorCountryFlags };
