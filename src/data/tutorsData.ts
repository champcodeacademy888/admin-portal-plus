export interface Tutor {
  id: number;
  name: string;
  country: string;
  isSingaporeTrial: boolean;
}

export const tutors: Tutor[] = [
  // Singapore
  { id: 1, name: "James Yeo", country: "Singapore", isSingaporeTrial: true },
  { id: 2, name: "James Yeo2", country: "Singapore", isSingaporeTrial: false },
  { id: 3, name: "Lester Tan", country: "Singapore", isSingaporeTrial: true },
  { id: 4, name: "Melinda Chua", country: "Singapore", isSingaporeTrial: true },
  { id: 5, name: "Sarah Darois", country: "Singapore", isSingaporeTrial: false },

  // Philippines
  { id: 6, name: "Abigael Pastrana", country: "Philippines", isSingaporeTrial: false },
  { id: 7, name: "Adriane Manzano", country: "Philippines", isSingaporeTrial: false },
  { id: 8, name: "Christie Cadio", country: "Philippines", isSingaporeTrial: false },
  { id: 9, name: "Eleanor Dapas", country: "Philippines", isSingaporeTrial: false },
  { id: 10, name: "Lizzane Majes", country: "Philippines", isSingaporeTrial: false },
  { id: 11, name: "Nelson Philip Alo St. Nic.", country: "Philippines", isSingaporeTrial: false },

  // Malaysia
  { id: 12, name: "Abigail Chong", country: "Malaysia", isSingaporeTrial: false },
  { id: 13, name: "Ching Lun Yeong", country: "Malaysia", isSingaporeTrial: false },
  { id: 14, name: "Dickson Hau", country: "Malaysia", isSingaporeTrial: false },
  { id: 15, name: "Karina Chai", country: "Malaysia", isSingaporeTrial: false },

  // India
  { id: 16, name: "Ayesha Zeeshan", country: "India", isSingaporeTrial: false },
  { id: 17, name: "Deeksha Banjal", country: "India", isSingaporeTrial: false },
  { id: 18, name: "Divina Violet", country: "India", isSingaporeTrial: false },
  { id: 19, name: "Kamal Jaglani", country: "India", isSingaporeTrial: false },
  { id: 20, name: "Rahul Shastri", country: "India", isSingaporeTrial: false },
  { id: 21, name: "Sandhya Kumar", country: "India", isSingaporeTrial: false },
  { id: 22, name: "Salso Saseen", country: "India", isSingaporeTrial: false },

  // Pakistan
  { id: 23, name: "Abdullah Qazi", country: "Pakistan", isSingaporeTrial: false },
  { id: 24, name: "Aisha Rizvi", country: "Pakistan", isSingaporeTrial: false },
  { id: 25, name: "Iqra Zafar", country: "Pakistan", isSingaporeTrial: false },
  { id: 26, name: "Mohammad Naheel", country: "Pakistan", isSingaporeTrial: false },

  // Indonesia
  { id: 27, name: "Anetta Widapa", country: "Indonesia", isSingaporeTrial: false },
  { id: 28, name: "Keke Putri Gangi", country: "Indonesia", isSingaporeTrial: false },
  { id: 29, name: "Gadis Nur Fauziah", country: "Indonesia", isSingaporeTrial: false },
  { id: 30, name: "Shanti Widayanti", country: "Indonesia", isSingaporeTrial: false },
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
