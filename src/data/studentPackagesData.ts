import { addDays, format, parse } from "date-fns";
import { countryFlags, getChildrenByStatus, type ChildWithParent } from "@/data/parentsData";
import { packages as packageCatalog, type PackageData } from "@/data/packagesCatalog";

const WEEKS_PER_TERM = 8;
const DAYS_PER_TERM = WEEKS_PER_TERM * 7;

export type StudentPackageStatus = "Pending" | "Active" | "Payment Due" | "Completed";
export type InvoiceStatus = "Paid" | "Pending" | "Overdue";

export interface InvoiceRecord {
  id: string;
  packageId: string;
  leadRecordId: string;
  studentId: string;
  studentName: string;
  parentName: string;
  country: string;
  channel: "WhatsApp" | "Messenger";
  program: string;
  packageName: string;
  termNumber: number;
  termStartDate: string;
  termEndDate: string;
  nextInvoiceCreationDate?: string;
  paymentCollectionDate?: string;
  dueDate: string;
  issuedDate: string;
  paidDate?: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
}

export interface StudentPackageRecord {
  id: string;
  leadRecordId: string;
  studentId: string;
  studentName: string;
  parentName: string;
  country: string;
  channel: "WhatsApp" | "Messenger";
  program: string;
  packageName: string;
  termCount: number;
  totalWeeks: number;
  totalInvoices: number;
  paidInvoices: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  currency: string;
  status: StudentPackageStatus;
  packageStartDate: string;
  packageEndDate: string;
  nextInvoiceCreationDate?: string;
  paymentCollectionDate?: string;
  leadStatus: ChildWithParent["status"];
  invoices: InvoiceRecord[];
}

const currencyByCountry: Record<string, string> = {
  Philippines: "PHP",
  Singapore: "SGD",
  Malaysia: "MYR",
  "Sri Lanka": "USD",
  UAE: "AED",
  "Hong Kong": "HKD",
  Indonesia: "IDR",
};

const amountMultiplierByCountry: Record<string, number> = {
  Philippines: 1,
  Singapore: 1.1,
  Malaysia: 0.75,
  "Sri Lanka": 0.7,
  UAE: 1.2,
  "Hong Kong": 1.15,
  Indonesia: 0.6,
};

const baseAmountByInterest: Record<string, number> = {
  "4 lessons / month": 120,
  "8 lessons / month": 220,
  "10 lessons / month": 260,
  "16 lessons / month": 380,
};

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seededRandom(314);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];

function getTermCount(packageInterest?: string) {
  switch (packageInterest) {
    case "16 lessons / month":
      return pick([4, 5, 6]);
    case "10 lessons / month":
      return pick([2, 3, 4]);
    case "8 lessons / month":
      return pick([2, 3]);
    case "4 lessons / month":
    default:
      return pick([1, 2]);
  }
}

function getPerTermAmount(country: string, packageInterest?: string) {
  const base = baseAmountByInterest[packageInterest || "8 lessons / month"] || 220;
  const multiplier = amountMultiplierByCountry[country] || 1;
  return Math.round(base * multiplier);
}

function parsePackageStartDate(value?: string) {
  if (!value) return new Date(2026, 3, 1);
  return parse(value, "d MMM yyyy", new Date(2026, 3, 1));
}

function getInvoiceStatuses(termCount: number, recordIndex: number): InvoiceStatus[] {
  const mode = recordIndex % 4;

  if (mode === 0) return Array.from({ length: termCount }, () => "Paid");
  if (mode === 1) return Array.from({ length: termCount }, (_, index) => index < Math.max(1, termCount - 1) ? "Paid" : "Pending");
  if (mode === 2) return Array.from({ length: termCount }, (_, index) => {
    if (index === 0) return "Paid";
    if (index === 1) return "Overdue";
    return "Pending";
  });

  return Array.from({ length: termCount }, (_, index) => index === 0 ? "Pending" : "Pending");
}

function getPackageStatus(invoices: InvoiceRecord[]): StudentPackageStatus {
  if (invoices.every((invoice) => invoice.status === "Paid")) return "Completed";
  if (invoices.some((invoice) => invoice.status === "Overdue")) return "Payment Due";
  if (invoices.some((invoice) => invoice.status === "Paid")) return "Active";
  return "Pending";
}

function buildStudentPackages() {
  const closedWonChildren = getChildrenByStatus("CLOSED WON").filter(
    (child) => child.packageInterest && child.packageInterest !== "Trial only"
  );

  const packages: StudentPackageRecord[] = closedWonChildren.map((child, index) => {
    const termCount = getTermCount(child.packageInterest);
    const totalWeeks = termCount * WEEKS_PER_TERM;
    const perTermAmount = getPerTermAmount(child.parent.country, child.packageInterest);
    const currency = currencyByCountry[child.parent.country] || "USD";
    const packageId = `PKG-${8200 + index}`;
    const packageStartDate = parsePackageStartDate(child.lessonStartDate);
    const invoiceStatuses = getInvoiceStatuses(termCount, index);
    const packageName = `${child.program || "General Coding"} ${totalWeeks}-Week Package`;

    const invoices: InvoiceRecord[] = invoiceStatuses.map((status, invoiceIndex) => {
      const termStartDate = addDays(packageStartDate, invoiceIndex * DAYS_PER_TERM);
      const termEndDate = addDays(termStartDate, DAYS_PER_TERM - 1);
      const dueDate = termStartDate;
      const issuedDate = addDays(dueDate, -7);
      const paidDate = status === "Paid" ? addDays(dueDate, -pick([1, 2, 3, 5])) : undefined;
      const nextInvoiceCreationDate = invoiceIndex < termCount - 1 ? addDays(termEndDate, -7) : undefined;
      const paymentCollectionDate = status === "Paid" ? paidDate : status === "Overdue" ? addDays(dueDate, 3) : dueDate;

      return {
        id: `INV-${8200 + index}-${invoiceIndex + 1}`,
        packageId,
        leadRecordId: child.parent.id,
        studentId: child.id,
        studentName: child.name,
        parentName: child.parent.name,
        country: child.parent.country,
        channel: child.parent.channel,
        program: child.program || "General Coding",
        packageName,
        termNumber: invoiceIndex + 1,
        termStartDate: format(termStartDate, "d MMM yyyy"),
        termEndDate: format(termEndDate, "d MMM yyyy"),
        nextInvoiceCreationDate: nextInvoiceCreationDate ? format(nextInvoiceCreationDate, "d MMM yyyy") : undefined,
        paymentCollectionDate: format(paymentCollectionDate, "d MMM yyyy"),
        dueDate: format(dueDate, "d MMM yyyy"),
        issuedDate: format(issuedDate, "d MMM yyyy"),
        paidDate: paidDate ? format(paidDate, "d MMM yyyy") : undefined,
        amount: perTermAmount,
        currency,
        status,
      };
    });

    const paidAmount = invoices
      .filter((invoice) => invoice.status === "Paid")
      .reduce((sum, invoice) => sum + invoice.amount, 0);
    const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
    const status = getPackageStatus(invoices);
    const packageEndDate = addDays(packageStartDate, Math.max(totalWeeks * 7 - 1, 0));
    const nextInvoiceCreationDate = invoices.find((invoice) => invoice.status !== "Paid")?.nextInvoiceCreationDate;
    const paymentCollectionDate = invoices.find((invoice) => invoice.status !== "Paid")?.paymentCollectionDate ?? invoices[invoices.length - 1]?.paymentCollectionDate;

    return {
      id: packageId,
      leadRecordId: child.parent.id,
      studentId: child.id,
      studentName: child.name,
      parentName: child.parent.name,
      country: child.parent.country,
      channel: child.parent.channel,
      program: child.program || "General Coding",
      packageName,
      termCount,
      totalWeeks,
      totalInvoices: invoices.length,
      paidInvoices: invoices.filter((invoice) => invoice.status === "Paid").length,
      totalAmount,
      paidAmount,
      balanceAmount: totalAmount - paidAmount,
      currency,
      status,
      packageStartDate: format(packageStartDate, "d MMM yyyy"),
      packageEndDate: format(packageEndDate, "d MMM yyyy"),
      nextInvoiceCreationDate,
      paymentCollectionDate,
      leadStatus: child.status,
      invoices,
    };
  });

  const invoices = packages.flatMap((record) => record.invoices);

  return { packages, invoices };
}

const dataset = buildStudentPackages();

export const studentPackages: StudentPackageRecord[] = dataset.packages;
export const invoices: InvoiceRecord[] = dataset.invoices;
export { countryFlags };

export function formatMoney(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Country mapping from parentsData countries to packagesCatalog countries
const countryToPackageCountry: Record<string, string> = {
  Philippines: "Philippines",
  Singapore: "Singapore",
  Malaysia: "Malaysia",
  "Sri Lanka": "Sri Lanka",
  UAE: "Dubai",
  "Hong Kong": "Hong Kong",
  Indonesia: "Indonesia",
};

export function getPackagesByCountry(parentCountry: string): PackageData[] {
  const catalogCountry = countryToPackageCountry[parentCountry] || parentCountry;
  return packageCatalog.filter((p) => p.country === catalogCountry && p.active);
}

let nextPackageIndex = studentPackages.length;

export function createStudentPackageFromLead(
  child: ChildWithParent,
  selectedPackage: PackageData,
  lessonStartDate: Date
): { pkg: StudentPackageRecord; newInvoices: InvoiceRecord[] } {
  const today = new Date();
  nextPackageIndex++;
  const packageId = `PKG-${9000 + nextPackageIndex}`;
  const currency = selectedPackage.currency || currencyByCountry[child.parent.country] || "USD";
  const totalWeeks = selectedPackage.numberOfLessons || 8;
  const termCount = Math.max(1, Math.ceil(totalWeeks / WEEKS_PER_TERM));
  const perTermAmount = selectedPackage.totalAmount > 0
    ? Math.round(selectedPackage.totalAmount / termCount)
    : getPerTermAmount(child.parent.country, child.packageInterest);
  const packageName = selectedPackage.name;

  // Determine if payment is already past due (start date passed without payment)
  const isPastStartDate = lessonStartDate < today;

  const newInvoices: InvoiceRecord[] = Array.from({ length: termCount }, (_, i) => {
    const termStartDate = addDays(lessonStartDate, i * DAYS_PER_TERM);
    const termEndDate = addDays(termStartDate, DAYS_PER_TERM - 1);
    const dueDate = termStartDate;
    const issuedDate = addDays(dueDate, -7);
    const nextInvoiceCreationDate = i < termCount - 1 ? addDays(termEndDate, -7) : undefined;

    // If past start date and not cleared → Overdue
    const status: InvoiceStatus = (i === 0 && isPastStartDate) ? "Overdue" : "Pending";

    return {
      id: `INV-${9000 + nextPackageIndex}-${i + 1}`,
      packageId,
      leadRecordId: child.parent.id,
      studentId: child.id,
      studentName: child.name,
      parentName: child.parent.name,
      country: child.parent.country,
      channel: child.parent.channel,
      program: child.program || "General Coding",
      packageName,
      termNumber: i + 1,
      termStartDate: format(termStartDate, "d MMM yyyy"),
      termEndDate: format(termEndDate, "d MMM yyyy"),
      nextInvoiceCreationDate: nextInvoiceCreationDate ? format(nextInvoiceCreationDate, "d MMM yyyy") : undefined,
      paymentCollectionDate: format(dueDate, "d MMM yyyy"),
      dueDate: format(dueDate, "d MMM yyyy"),
      issuedDate: format(issuedDate, "d MMM yyyy"),
      amount: perTermAmount,
      currency,
      status,
    };
  });

  const totalAmount = newInvoices.reduce((s, inv) => s + inv.amount, 0);

  // If past start date and not paid → Payment Failed status for lead, Payment Due for package
  const pkgStatus: StudentPackageStatus = isPastStartDate ? "Payment Due" : "Pending";

  const pkg: StudentPackageRecord = {
    id: packageId,
    leadRecordId: child.parent.id,
    studentId: child.id,
    studentName: child.name,
    parentName: child.parent.name,
    country: child.parent.country,
    channel: child.parent.channel,
    program: child.program || "General Coding",
    packageName,
    termCount,
    totalWeeks,
    totalInvoices: newInvoices.length,
    paidInvoices: 0,
    totalAmount,
    paidAmount: 0,
    balanceAmount: totalAmount,
    currency,
    status: pkgStatus,
    packageStartDate: format(lessonStartDate, "d MMM yyyy"),
    packageEndDate: format(addDays(lessonStartDate, Math.max(totalWeeks * 7 - 1, 0)), "d MMM yyyy"),
    nextInvoiceCreationDate: newInvoices.find((inv) => inv.status !== "Paid")?.nextInvoiceCreationDate,
    paymentCollectionDate: newInvoices[0]?.paymentCollectionDate,
    leadStatus: child.status,
    invoices: newInvoices,
  };

  // Add to global arrays
  studentPackages.push(pkg);
  invoices.push(...newInvoices);

  return { pkg, newInvoices };
}