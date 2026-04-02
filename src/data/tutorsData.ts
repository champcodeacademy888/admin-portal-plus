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
  { id: 1, name: "James Yeo", country: "Singapore", isSingaporeTrial: true, contactNumber: "6591234567", email: "james.yeo@champcode.com" },
  { id: 2, name: "James Yeo2", country: "Singapore", isSingaporeTrial: false, contactNumber: "6592345678", email: "james.yeo2@champcode.com" },
  { id: 3, name: "Lester Tan", country: "Singapore", isSingaporeTrial: true, contactNumber: "6593456789", email: "lester.tan@champcode.com" },
  { id: 4, name: "Melinda Chua", country: "Singapore", isSingaporeTrial: true, contactNumber: "6594567890", email: "melinda.chua@champcode.com" },
  { id: 5, name: "Sarah Darois", country: "Singapore", isSingaporeTrial: false, contactNumber: "6595678901", email: "sarah.darois@champcode.com" },

  // Philippines
  { id: 6, name: "Abigael Pastrana", country: "Philippines", isSingaporeTrial: false, contactNumber: "639171234567", email: "abigael.pastrana@champcode.com" },
  { id: 7, name: "Adriane Manzano", country: "Philippines", isSingaporeTrial: false, contactNumber: "639182345678", email: "adriane.manzano@champcode.com" },
  { id: 8, name: "Christie Cadio", country: "Philippines", isSingaporeTrial: false, contactNumber: "639193456789", email: "christie.cadio@champcode.com" },
  { id: 9, name: "Eleanor Dapas", country: "Philippines", isSingaporeTrial: false, contactNumber: "639204567890", email: "eleanor.dapas@champcode.com" },
  { id: 10, name: "Lizzane Majes", country: "Philippines", isSingaporeTrial: false, contactNumber: "639215678901", email: "lizzane.majes@champcode.com" },
  { id: 11, name: "Nelson Philip Alo St. Nic.", country: "Philippines", isSingaporeTrial: false, contactNumber: "639226789012", email: "nelson.alo@champcode.com" },

  // Malaysia
  { id: 12, name: "Abigail Chong", country: "Malaysia", isSingaporeTrial: false, contactNumber: "60123456789", email: "abigail.chong@champcode.com" },
  { id: 13, name: "Ching Lun Yeong", country: "Malaysia", isSingaporeTrial: false, contactNumber: "60134567890", email: "chinglun.yeong@champcode.com" },
  { id: 14, name: "Dickson Hau", country: "Malaysia", isSingaporeTrial: false, contactNumber: "60145678901", email: "dickson.hau@champcode.com" },
  { id: 15, name: "Karina Chai", country: "Malaysia", isSingaporeTrial: false, contactNumber: "60166789012", email: "karina.chai@champcode.com" },

  // India
  { id: 16, name: "Ayesha Zeeshan", country: "India", isSingaporeTrial: false, contactNumber: "919876543210", email: "ayesha.zeeshan@champcode.com" },
  { id: 17, name: "Deeksha Banjal", country: "India", isSingaporeTrial: false, contactNumber: "919876543211", email: "deeksha.banjal@champcode.com" },
  { id: 18, name: "Divina Violet", country: "India", isSingaporeTrial: false, contactNumber: "919876543212", email: "divina.violet@champcode.com" },
  { id: 19, name: "Kamal Jaglani", country: "India", isSingaporeTrial: false, contactNumber: "919876543213", email: "kamal.jaglani@champcode.com" },
  { id: 20, name: "Rahul Shastri", country: "India", isSingaporeTrial: false, contactNumber: "919876543214", email: "rahul.shastri@champcode.com" },
  { id: 21, name: "Sandhya Kumar", country: "India", isSingaporeTrial: false, contactNumber: "919876543215", email: "sandhya.kumar@champcode.com" },
  { id: 22, name: "Salso Saseen", country: "India", isSingaporeTrial: false, contactNumber: "919876543216", email: "salso.saseen@champcode.com" },

  // Pakistan
  { id: 23, name: "Abdullah Qazi", country: "Pakistan", isSingaporeTrial: false, contactNumber: "923001234567", email: "abdullah.qazi@champcode.com" },
  { id: 24, name: "Aisha Rizvi", country: "Pakistan", isSingaporeTrial: false, contactNumber: "923012345678", email: "aisha.rizvi@champcode.com" },
  { id: 25, name: "Iqra Zafar", country: "Pakistan", isSingaporeTrial: false, contactNumber: "923023456789", email: "iqra.zafar@champcode.com" },
  { id: 26, name: "Mohammad Naheel", country: "Pakistan", isSingaporeTrial: false, contactNumber: "923034567890", email: "mohammad.naheel@champcode.com" },

  // Indonesia
  { id: 27, name: "Anetta Widapa", country: "Indonesia", isSingaporeTrial: false, contactNumber: "628123456890", email: "anetta.widapa@champcode.com" },
  { id: 28, name: "Keke Putri Gangi", country: "Indonesia", isSingaporeTrial: false, contactNumber: "628134567901", email: "keke.gangi@champcode.com" },
  { id: 29, name: "Gadis Nur Fauziah", country: "Indonesia", isSingaporeTrial: false, contactNumber: "628145678012", email: "gadis.fauziah@champcode.com" },
  { id: 30, name: "Shanti Widayanti", country: "Indonesia", isSingaporeTrial: false, contactNumber: "628156789123", email: "shanti.widayanti@champcode.com" },
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
