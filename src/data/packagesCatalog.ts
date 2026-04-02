export interface PackageData {
  id: number;
  name: string;
  description: string;
  type: "Recurring" | "1x" | "";
  country: string;
  currency: string;
  totalAmount: number;
  numberOfLessons: number;
  url: string;
  active: boolean;
}

const packageNames = [
  "PH 8 weeks",
  "PH 10 Lessons ( 700)",
  "1x minecraft education premium account",
  "PH 5 Lessons (4250)",
  "PH 6 Lessons (3125)",
  "PH 4 weeks (850)",
  "MY 16 weeks",
  "Korea Level 2 20 lessons",
  "MY 3 weeks",
  "Champ-Code-Academy-30perlesson-SGD-Every-8-weeks",
  "Reservation",
  "SG 8 weeks ($40)",
  "Reservation FEE",
  "SG 4 Weeks ($25)",
  "MY 2 weeks",
  "SG 10 Weeks ($25)",
  "SG 8 weeks with $10 deposit",
  "MY 8 weeks with RM 10 deposit",
  "Champ-Code-Academy-Coding-Lessons-PH-PHP-Every-23-weeks",
  "4 weeks",
  "Dubai every 8 weeks",
  "PH 16 weeks",
  "PH Package 3 (750) 10 Lessons",
  "PH 22 weeks",
  "MY 8 weeks for test",
  "PH Package 3 Installment plan 4 weeks",
  "SG 5 Weeks ($25)",
  "SG 18 weeks ($25)",
  "SG 15 weeks ($30)",
  "PH 8 weeks (5000)",
  "PH 7 weeks (850)",
  "PH 8 weeks (6800)",
  "PH 17 weeks(₱650)",
  "PH 8 Lessons (875)",
  "SG package 1 4 week instalment ($100)",
  "PH 8 Weeks (700)",
  "SG Level 2 20 lessons",
  "SG 10 weeks ($30)",
  "SG 22 weeks ($25)",
  "MY 22 weeks",
  "PH 6 Weeks (850) Group",
  "test-automation-1sgd",
  "PH 1 Week (1050)",
  "PH 3 Weeks (850)",
  "450 PHP every 8 weeks (Lecture)",
  "SG 4 weeks ($40)",
  "MY 6 Lessons (RM 65)",
  "SG 23 weeks ($25)",
  "SG 8 weeks ($30)",
  "test-MYR-Every-8-weeks",
  "Sri Lanka 8 weeks",
  "SG Mastery Plan MC1 (22 weeks)",
  "SG 4 weeks ($30)",
  "MY Monthly installment 4 weeks",
  "SG Level 2 50 lessons",
  "PH 4 Weeks (1100) Private",
  "MY 12 Weeks",
  "MY Roblox 23 weeks",
  "SG 8 weeks ($32)",
  "PH 18 weeks",
  "MY 25 weeks (RB 2)",
  "SG 8 Weeks Plan with $10 Deposit",
  "SG 7 Weeks ($25)",
  "PH Package 2 Roblox 2 (20 lessons)",
  "Champ-Code-Academy-850perlesson-PHP-Every-8-weeks",
  "PH 23 weeks(₱650)",
  "MY 5 Weeks ( RB 2 )",
  "PH Package 1 Installment plan 4 weeks (22 Lessons)",
  "MY 8 weeks PRIVATE",
  "SG 1 Week ($40)",
  "SG Mastery Plan Roblox1 (23 weeks)",
  "Champ-Code-Academy-Coding-Lessons-SGD-SGD-Every-8-weeks",
  "PH 23 weeks(₱850)",
  "SG 16 weeks ($25)",
  "PH 13 weeks (850)",
  "PH 8 weeks (8400)",
  "SG Mastery Plan MC1 (22 weeks)",
  "MY 22 weeks ( MC Group Class )",
  "PH 4 Weeks (625)",
  "PH 8 weeks Private",
  "MY 8 weeks",
  "SG 8 Weeks ($25)",
  "Champ-Code-Academy-Test-PHP-Every-4-weeks",
  "PH 2 Weeks (850)",
  "8 weeks",
  "MY 22 weeks (MC Private)",
  "SG 6 Lessons ($25)",
  "SG Level 2 20 lessons ($25)",
  "SG $10 Deposit",
  "MY 30RM Deposit",
  "SG 6 weeks($40)",
  "MY 2 weeks (WebD Private)",
  "MY 7 weeks",
  "SG 2 weeks ($25)",
  "PH 4 weeks (₱450)",
  "PH 1 Week (850)",
  "SG 3 weeks ($25)",
  "SG 15 weeks ($40)",
  "PH weekly payment (₱850)",
  "MY weekly payment (65MYR)",
  "PH Package 2 Roblox 2 (20 lessons) (650)",
  "SG 18 weeks ($30)",
  "SG 10 weeks ($40)",
  "SG 4 weeks ($80)",
  "PH Package 2 Roblox 2 (20 lessons) (750)",
  "6 weeks",
  "SG 23 weeks Mastery Plan ( Private )",
  "MY 5 Weeks",
  "PH 15 weeks (850)",
  "MY 10 weeks ( level 2 )",
  "PH 5 weeks (850)",
  "MY 15 weeks",
  "SG 5 Weeks ($30)",
  "MY Package 1 Roblox 2 (50 Lessons)",
  "MY 14 weeks",
  "MY 14 weeks",
  "MY MC Level 2 - 40 weeks",
  "SG 1 Week ($30)",
  "SG 14 Weeks ($30)",
  "SG Intro to AI Camp",
  "SG $10 Deposit",
  "PH 500PHP Deposit",
  "MY 30MYR Deposit",
  "SG 3 Weeks ($30)",
  "SG 25 Weeks ($25)",
  "PH 18 Weeks (Website Design Package 1)",
  "SG 8 weeks Private ($60)",
  "AED 4 weeks (AED 85)",
  "MY Package 2 Roblox 2 (20 Lessons)",
  "AUS 8 weeks (35AUD)",
  "Dubai 8 weeks (85AED)",
  "Dubai 8 weeks (85AED) 1x",
  "Dubai 4 weeks (85AED) 1x ",
  "Dubai 4 weeks (85AED) 1x",
  "Dubai 4 weeks (55AED)",
  "Dubai 8 weeks (55AED)",
  "Dubai Roblox AI Camp",
  "Hong Kong 8 weeks (180HKD)",
  "Hong Kong 8 weeks (360HKD) private",
  "Hong Kong 4 weeks (180HKD)",
  "Hong Kong 23 weeks (180HKD)",
  "Dubai 23 weeks (AED 85)",
  "Indonesia 4 weeks (250,000.00IDR)",
  "Indonesia 8 weeks (250,000.00IDR)",
  "New Zealand 4 weeks (40NZD)",
  "New Zealand 8 weeks (40NZD)",
  "Vietnam 4 weeks (400000VND)",
  "Vietnam 8 weeks (400000VND)",
  "Dubai 30AED Deposit",
  "Hong Kong 60HKD Deopsit",
  "MY Camp (5 Days)",
  "SG 5 Weeks ($40)",
  "MY 30 lessons (RB2)",
  "PH 6 Weeks (750) Group",
  "SG 6 Weeks ($30)",
  "Hong Kong 4 weeks 1x",
  "Hong Kong 8 weeks 1x",
  "Sri Lanka 8 weeks (4750LKR)",
  "Sri Lanka 4 weeks (4750LKR)",
  "Korea 8 weeks (32500KRW)",
  "Korea 4 weeks (32500KRW)",
  "Dubai 23 weeks (AED 55)",
  "PH 10 Lessons (850)",
  "Hong Kong 8 weeks (165HKD)",
  "Sri Lanka 23 weeks (3800LKR)",
  "Dubai 8 weeks (70AED)",
  "Dubai 4 weeks (70AED)",
  "PH 12 weeks(₱650)",
  "PH 11 weeks(₱650)",
  "PH Package 1 Installment plan 4 weeks (23 Lessons)",
  "Sri Lanka 8 weeks (3800LKR)",
  "Sri Lanka 4 weeks (3800LKR)",
  "Sri Lanka 2500LKR Deposit",
  "PH 8 Weeks (5200)",
  "Hong Kong 8 weeks (360HKD) private - 2 lessons per week",
  "Hong Kong 7 weeks Private 1x",
  "PH 4 weeks - 2 lessons per week (₱850)",
  "PH 4 weeks",
  "PH 10 Lessons (750)",
  "MY 1 Week",
  "PH 14 weeks (650)",
  "PH 16 weeks (650) Python",
  "SG 3 weeks ($40)",
  "PH 4 weeks Python (650)",
  "PH 3 weeks (625)",
  "SG 11 weeks ($25)",
  "SG 9 weeks ($30)",
  "MY Mastery Monthly installment 4 weeks",
  "MY Mastery 23 weeks",
  "SG 13 weeks ($25)",
  "Dubai 4weeks Mastery 23 weeks (55AED)",
  "SG 2 weeks ($30)",
];

const countryMatchers: Array<[string, string]> = [
  ["Philippines", "PH"],
  ["Singapore", "SG"],
  ["Malaysia", "MY"],
  ["Australia", "AUS"],
  ["Korea", "Korea"],
  ["Dubai", "Dubai"],
  ["Hong Kong", "Hong Kong"],
  ["Sri Lanka", "Sri Lanka"],
  ["Indonesia", "Indonesia"],
  ["New Zealand", "New Zealand"],
  ["Vietnam", "Vietnam"],
  ["Australia", "AUD"],
  ["Dubai", "AED"],
];

const currencyMatchers: Array<[string, string]> = [
  ["PHP", "PHP"],
  ["PHP", "₱"],
  ["SGD", "SGD"],
  ["SGD", "$"],
  ["MYR", "MYR"],
  ["MYR", "RM"],
  ["AUD", "AUD"],
  ["AED", "AED"],
  ["KRW", "KRW"],
  ["HKD", "HKD"],
  ["LKR", "LKR"],
  ["IDR", "IDR"],
  ["NZD", "NZD"],
  ["VND", "VND"],
];

function inferCountry(name: string) {
  const matched = countryMatchers.find(([, token]) => name.includes(token));
  return matched?.[0] ?? "";
}

function inferCurrency(name: string, country: string) {
  const matched = currencyMatchers.find(([, token]) => name.includes(token));
  if (matched) return matched[0];

  const byCountry: Record<string, string> = {
    Philippines: "PHP",
    Singapore: "SGD",
    Malaysia: "MYR",
    Australia: "AUD",
    Korea: "KRW",
    Dubai: "AED",
    "Hong Kong": "HKD",
    "Sri Lanka": "LKR",
    Indonesia: "IDR",
    "New Zealand": "NZD",
    Vietnam: "VND",
  };

  return byCountry[country] ?? "";
}

function inferLessons(name: string) {
  const lessonMatch = name.match(/(\d+)\s*lessons?/i);
  if (lessonMatch) return Number(lessonMatch[1]);

  const weekMatch = name.match(/(\d+)\s*weeks?/i);
  if (weekMatch) return Number(weekMatch[1]);

  if (/1x/i.test(name)) return 1;
  if (/deposit|reservation/i.test(name)) return 0;

  return 0;
}

function inferAmount(name: string, lessons: number) {
  const compact = name.replace(/,/g, "");
  const bracket = compact.match(/\((?:[^\d]*)(\d+(?:\.\d+)?)\)/);
  if (bracket) {
    const amount = Number(bracket[1]);
    if (/weeks?/i.test(name) && !/private - 2 lessons per week/i.test(name) && lessons > 1 && !/deposit|reservation/i.test(name)) {
      return amount * lessons;
    }
    return amount;
  }

  const inlineCurrency = compact.match(/(\d+(?:\.\d+)?)(PHP|MYR|AUD|AED|KRW|HKD|LKR|IDR|NZD|VND)/i);
  if (inlineCurrency) return Number(inlineCurrency[1]);

  const leadingPhp = compact.match(/^(\d+(?:\.\d+)?)\s*PHP/i);
  if (leadingPhp) return Number(leadingPhp[1]) * Math.max(lessons, 1);

  if (/deposit/i.test(name)) {
    const deposit = compact.match(/(\d+(?:\.\d+)?)/);
    return deposit ? Number(deposit[1]) : 0;
  }

  return 0;
}

function inferType(name: string) {
  if (/1x|deposit|reservation|camp|premium account/i.test(name)) return "1x" as const;
  if (/weeks?|weekly|every-|every\s|monthly|installment/i.test(name)) return "Recurring" as const;
  return "" as const;
}

export const packages: PackageData[] = packageNames.map((name, index) => {
  const country = inferCountry(name);
  const currency = inferCurrency(name, country);
  const numberOfLessons = inferLessons(name);

  return {
    id: index + 1,
    name,
    description: "",
    type: inferType(name),
    country,
    currency,
    totalAmount: inferAmount(name, numberOfLessons),
    numberOfLessons,
    url: name.includes("Champ-Code-Academy") ? "https://champcodeacademy.chargebee.com/hosted_pages/checkout" : "",
    active: true,
  };
});