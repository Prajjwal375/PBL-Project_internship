import { readFileSync, readdirSync } from "fs";
import path from "path";
import { parseCsv } from "./csv";

const DATA_ROOT = path.join(process.cwd(), "data");
const PBL_ROOT = path.join(DATA_ROOT, "primary-pbl");
const GRANT_ROOT = path.join(DATA_ROOT, "grant-reporting");

const columns = {
  month: "Reporting Month",
  school: "What is the name of your school?",
  schoolCode: "What is your school's synthetic school code?",
  district: "What is the name of your district?",
  block: "Block Details",
  conducted: "Was the PBL project conducted in your school this month?",
  evidence: "Was evidence submitted for the completed PBL project?",
  classes: "In which class/classes did you conduct the PBL project?",
  subject: "Which subject do you teach?",
  enrollment: "Derived: Total enrollment across Classes 6-8",
  attendance: "Derived: Total attendance across PBL Science and Math sessions",
  attendanceRate: "Derived: Overall PBL attendance rate",
  sourceRisk: "Derived: Risk status",
};

// Raw per-class, per-subject columns. These are populated independently of
// the "classes"/"subject" text fields above, so they are the source of
// truth for any Grade or Subject level metric.
const classColumns: Record<6 | 7 | 8, { enrollment: string; science: string; math: string }> = {
  6: {
    enrollment: "Total number of students enrolled in Class 6, including all sections",
    science: "Average student attendance during the Class 6 PBL Science session. If you did not teach Science in Class 6, enter 0.",
    math: "Average student attendance during the Class 6 PBL Math session. If you did not teach Math in Class 6, enter 0.",
  },
  7: {
    enrollment: "Total number of students enrolled in Class 7, including all sections",
    science: "Average student attendance during the Class 7 PBL Science session. If you did not teach Science in Class 7, enter 0.",
    math: "Average student attendance during the Class 7 PBL Math session. If you did not teach Math in Class 7, enter 0.",
  },
  8: {
    enrollment: "Total number of students enrolled in Class 8, including all sections",
    science: "Average student attendance during the Class 8 PBL Science session. If you did not teach Science in Class 8, enter 0.",
    math: "Average student attendance during the Class 8 PBL Math session. If you did not teach Math in Class 8, enter 0.",
  },
};

type ClassBreakdown = Record<6 | 7 | 8, { enrollment: number; science: number; math: number }>;

export type RiskStatus = "On Track" | "Behind" | "At Risk" | "Critical";

export type ProgramFilters = {
  month?: string;
  district?: string;
  block?: string;
  grade?: string;
  subject?: string;
};

export type PblRecord = {
  month: string;
  school: string;
  schoolCode: string;
  district: string;
  block: string;
  conducted: boolean;
  evidenceSubmitted: boolean;
  classes: string;
  subject: string;
  enrollment: number;
  attendance: number;
  attendanceRate: number;
  sourceRisk: string;
  classBreakdown: ClassBreakdown;
};

export type GeographySummary = {
  name: string;
  totalSchools: number;
  participatingSchools: number;
  evidenceSubmitted: number;
  totalEnrollment: number;
  totalAttendance: number;
  participationRate: number;
  evidenceRate: number;
  attendanceRate: number;
  riskStatus: RiskStatus;
};

export type SchoolSummary = {
  school: string;
  schoolCode: string;
  district: string;
  block: string;
  classes: string;
  subject: string;
  conducted: boolean;
  evidenceSubmitted: boolean;
  enrollment: number;
  attendance: number;
  attendanceRate: number;
  riskStatus: RiskStatus;
};

export type GrantFinanceRow = {
  grantId: string;
  donor: string;
  grantName: string;
  reportingMonth: string;
  coveredDistricts: string;
  budgetLine: string;
  approvedBudgetUnits: number;
  monthlyUtilizedUnits: number;
  cumulativeUtilizedUnits: number;
  cumulativeUtilizationRate: number;
  financeNote: string;
};

export type GrantPerformanceRow = {
  grantId: string;
  donor: string;
  grantName: string;
  reportingMonth: string;
  reportStatus: string;
  coveredDistricts: string;
  sampledSchoolRecords: number;
  schoolsCompletedPbl: number;
  pblCompletionRate: number;
  schoolsWithEvidence: number;
  evidenceSubmissionRate: number;
  totalEnrollment: number;
  totalAttendance: number;
  attendanceRate: number;
  riskStatus: RiskStatus;
  milestoneSummary: string;
  draftReportText: string;
  reportDueDate: string;
  periodEndDate: string;
};

export type EvidenceRecord = {
  recordId: string;
  recordType: string;
  grantId: string;
  donor: string;
  reportingMonth: string;
  district: string;
  title: string;
  summary: string;
  fileName: string;
  relativePath: string;
  publicPath: string;
  usageNote: string;
};

type MovementMetric = {
  metric: string;
  current: number;
  previous: number;
  delta: number;
};

type SummaryPayload = {
  achievements: string[];
  risks: string[];
  discussionPoints: string[];
};

type ReviewAction = {
  owner: string;
  priority: "High" | "Medium" | "Low";
  dueDate: string;
  status: "Open" | "Watching" | "Resolved";
  linkedMetric: string;
};

function readCsvFile(filePath: string) {
  return parseCsv(readFileSync(filePath, "utf8"));
}

function numberValue(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function percent(value: number) {
  return Math.round(value * 1000) / 10;
}

// Parse a reporting month string into a sortable timestamp.
// Handles both "YYYY-MM" (ISO, e.g. "2025-09") and "Month YYYY" (e.g. "September 2025").
// Falls back to lexicographic comparison for unknown formats.
function parseMonthToDate(value: string): number {
  // ISO format: 2025-09
  const iso = value.match(/^(\d{4})-(\d{2})$/);
  if (iso) return new Date(`${iso[1]}-${iso[2]}-01`).getTime();

  // "Month YYYY" format: September 2025
  const named = value.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (named) {
    const ts = new Date(`${named[1]} 1, ${named[2]}`).getTime();
    if (!isNaN(ts)) return ts;
  }

  // Fallback: lexicographic order (may be wrong, but won't crash)
  return 0;
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((left, right) =>
    left.localeCompare(right, "en", { numeric: true }),
  );
}

function sortMonths(values: string[]) {
  const unique = Array.from(new Set(values.filter(Boolean)));
  return unique.sort((left, right) => {
    const tLeft = parseMonthToDate(left);
    const tRight = parseMonthToDate(right);
    // Both parseable — sort by date
    if (tLeft !== 0 && tRight !== 0) return tLeft - tRight;
    // Fallback: lexicographic with numeric awareness
    return left.localeCompare(right, "en", { numeric: true });
  });
}

// Which class numbers should be included in a metric calculation, given the
// selected Grade filter (defaults to all three when no grade is selected).
function gradesToInclude(grade?: string): (6 | 7 | 8)[] {
  const selected = grade?.match(/[6-8]/)?.[0];
  return selected ? [Number(selected) as 6 | 7 | 8] : [6, 7, 8];
}

// Which subject sessions should be included, given the selected Subject
// filter (defaults to both Science and Math when no subject is selected).
function subjectsToInclude(subject?: string): ("science" | "math")[] {
  if (!subject) return ["science", "math"];
  const lower = subject.toLowerCase();
  const hasScience = lower.includes("science");
  const hasMath = lower.includes("math");
  if (hasScience && !hasMath) return ["science"];
  if (hasMath && !hasScience) return ["math"];
  return ["science", "math"];
}

// Computes enrollment/attendance/rate for ONE record, narrowed to the
// selected grade(s) and subject(s). This reads directly from the raw
// per-class columns rather than the row's pre-aggregated totals, so a
// Grade or Subject filter changes the actual numbers, not just which rows
// are displayed.
function recordMetrics(record: PblRecord, filters: Pick<ProgramFilters, "grade" | "subject">) {
  const grades = gradesToInclude(filters.grade);
  const subjects = subjectsToInclude(filters.subject);

  let enrollment = 0;
  let attendance = 0;

  for (const grade of grades) {
    const breakdown = record.classBreakdown[grade];
    enrollment += breakdown.enrollment;
    for (const subject of subjects) {
      attendance += breakdown[subject];
    }
  }

  const sessionCount = subjects.length; // 1 session if a single subject is selected, 2 otherwise
  const rate = enrollment ? attendance / (enrollment * sessionCount) : 0;

  return { enrollment, attendance, rate };
}

export function classifyRisk(rate: number): RiskStatus {
  if (rate >= 0.75) return "On Track";
  if (rate >= 0.6) return "Behind";
  if (rate >= 0.35) return "At Risk";
  return "Critical";
}

const pblRecords: PblRecord[] = readdirSync(PBL_ROOT)
  .filter((file) => file.endsWith(".csv"))
  .sort()
  .flatMap((file) => readCsvFile(path.join(PBL_ROOT, file)))
  .map((row) => ({
    month: row[columns.month],
    school: row[columns.school],
    schoolCode: row[columns.schoolCode],
    district: row[columns.district],
    block: row[columns.block],
    conducted: row[columns.conducted].toLowerCase() === "yes",
    evidenceSubmitted: row[columns.evidence].toLowerCase() === "yes",
    classes: row[columns.classes],
    subject: row[columns.subject],
    enrollment: numberValue(row[columns.enrollment]),
    attendance: numberValue(row[columns.attendance]),
    attendanceRate: numberValue(row[columns.attendanceRate]),
    sourceRisk: row[columns.sourceRisk],
    classBreakdown: {
      6: {
        enrollment: numberValue(row[classColumns[6].enrollment]),
        science: numberValue(row[classColumns[6].science]),
        math: numberValue(row[classColumns[6].math]),
      },
      7: {
        enrollment: numberValue(row[classColumns[7].enrollment]),
        science: numberValue(row[classColumns[7].science]),
        math: numberValue(row[classColumns[7].math]),
      },
      8: {
        enrollment: numberValue(row[classColumns[8].enrollment]),
        science: numberValue(row[classColumns[8].science]),
        math: numberValue(row[classColumns[8].math]),
      },
    },
  }));

const grantFinanceRows: GrantFinanceRow[] = readCsvFile(path.join(GRANT_ROOT, "01_Grant_Profile_and_Finance.csv")).map((row) => ({
  grantId: row.grant_id,
  donor: row.donor,
  grantName: row.grant_name,
  reportingMonth: row.reporting_month,
  coveredDistricts: row.covered_districts,
  budgetLine: row.budget_line,
  approvedBudgetUnits: numberValue(row.approved_budget_units),
  monthlyUtilizedUnits: numberValue(row.monthly_utilized_units),
  cumulativeUtilizedUnits: numberValue(row.cumulative_utilized_units),
  cumulativeUtilizationRate: numberValue(row.cumulative_utilization_rate),
  financeNote: row.finance_note,
}));

const grantPerformanceRows: GrantPerformanceRow[] = readCsvFile(path.join(GRANT_ROOT, "02_Grant_Performance_and_Report_Material.csv")).map((row) => ({
  grantId: row.grant_id,
  donor: row.donor,
  grantName: row.grant_name,
  reportingMonth: row.reporting_month,
  periodEndDate: row.period_end_date,
  reportDueDate: row.report_due_date,
  reportStatus: row.report_status,
  coveredDistricts: row.covered_districts,
  sampledSchoolRecords: numberValue(row.sampled_school_records),
  schoolsCompletedPbl: numberValue(row.schools_completed_pbl),
  pblCompletionRate: numberValue(row.pbl_completion_rate),
  schoolsWithEvidence: numberValue(row.schools_with_evidence),
  evidenceSubmissionRate: numberValue(row.evidence_submission_rate),
  totalEnrollment: numberValue(row.total_enrollment),
  totalAttendance: numberValue(row.total_attendance),
  attendanceRate: numberValue(row.attendance_rate),
  riskStatus: classifyRisk(numberValue(row.attendance_rate)),
  milestoneSummary: row.milestone_summary,
  draftReportText: row.draft_report_text,
}));

const evidenceRows: EvidenceRecord[] = readCsvFile(path.join(GRANT_ROOT, "03_Evidence_and_Media_Index.csv")).map((row) => ({
  recordId: row.record_id,
  recordType: row.record_type,
  grantId: row.grant_id,
  donor: row.donor,
  reportingMonth: row.reporting_month,
  district: row.district,
  title: row.title,
  summary: row.summary_or_caption,
  fileName: row.file_name,
  relativePath: row.relative_path,
  publicPath: `/evidence/${row.file_name}`,
  usageNote: row.usage_note,
}));

export function getPblRecords() {
  return [...pblRecords];
}

export function getFilterOptions(filters?: Pick<ProgramFilters, "district">) {
  const records = getPblRecords();
  const districtRecords = filters?.district ? records.filter(r => r.district === filters.district) : records;
  return {
    months: sortMonths(records.map((record) => record.month)),
    districts: unique(records.map((record) => record.district)),
    blocks: unique(districtRecords.map((record) => record.block)),
    grades: ["Class 6", "Class 7", "Class 8"],
    subjects: ["Science", "Math"],
  };
}

export function filterPblRecords(records: PblRecord[], filters: ProgramFilters) {
  return records.filter(
    (record) =>
      (!filters.month || record.month === filters.month) &&
      (!filters.district || record.district === filters.district) &&
      (!filters.block || record.block === filters.block),
  );
}

function buildMetrics(records: PblRecord[], filters: Pick<ProgramFilters, "grade" | "subject"> = {}) {
  const totalSchools = records.length;
  const participatingSchools = records.filter((record) => record.conducted).length;
  const evidenceSubmitted = records.filter((record) => record.evidenceSubmitted).length;

  let totalEnrollment = 0;
  let totalAttendance = 0;
  const riskDistribution = {
    "On Track": 0,
    "Behind": 0,
    "At Risk": 0,
    "Critical": 0,
  };

  records.forEach((record) => {
    const { enrollment, attendance, rate } = recordMetrics(record, filters);
    totalEnrollment += enrollment;
    totalAttendance += attendance;
    riskDistribution[classifyRisk(rate)]++;
  });

  const participationRate = totalSchools ? participatingSchools / totalSchools : 0;
  const evidenceRate = participatingSchools ? evidenceSubmitted / participatingSchools : 0;
  const sessionCount = subjectsToInclude(filters.subject).length;
  const attendanceRate = totalEnrollment ? totalAttendance / (totalEnrollment * sessionCount) : 0;

  return {
    totalSchools,
    participatingSchools,
    participationRate,
    evidenceSubmitted,
    evidenceRate,
    totalEnrollment,
    totalAttendance,
    attendanceRate,
    riskStatus: classifyRisk(attendanceRate),
    riskDistribution,
  };
}

function buildGeographySummary(
  records: PblRecord[],
  field: "district" | "block",
  filters: Pick<ProgramFilters, "grade" | "subject"> = {},
): GeographySummary[] {
  const groups = new Map<string, PblRecord[]>();

  for (const record of records) {
    const key = record[field];
    const group = groups.get(key) ?? [];
    group.push(record);
    groups.set(key, group);
  }

  return Array.from(groups.entries())
    .map(([name, groupRecords]) => {
      const metrics = buildMetrics(groupRecords, filters);
      return {
        name,
        totalSchools: metrics.totalSchools,
        participatingSchools: metrics.participatingSchools,
        evidenceSubmitted: metrics.evidenceSubmitted,
        totalEnrollment: metrics.totalEnrollment,
        totalAttendance: metrics.totalAttendance,
        participationRate: percent(metrics.participationRate),
        evidenceRate: percent(metrics.evidenceRate),
        attendanceRate: percent(metrics.attendanceRate),
        riskStatus: metrics.riskStatus,
      };
    })
    .sort((left, right) => {
      if (right.attendanceRate !== left.attendanceRate) {
        return right.attendanceRate - left.attendanceRate;
      }
      return left.name.localeCompare(right.name);
    });
}

function buildSchoolRankings(records: PblRecord[], filters: Pick<ProgramFilters, "grade" | "subject"> = {}) {
  const schools = records.map((record) => {
    const { enrollment, attendance, rate } = recordMetrics(record, filters);
    return {
      school: record.school,
      schoolCode: record.schoolCode,
      district: record.district,
      block: record.block,
      classes: record.classes,
      subject: record.subject,
      conducted: record.conducted,
      evidenceSubmitted: record.evidenceSubmitted,
      enrollment,
      attendance,
      attendanceRate: percent(rate),
      riskStatus: classifyRisk(rate),
    };
  });

  const top = [...schools].sort((left, right) => right.attendanceRate - left.attendanceRate).slice(0, 8);
  const bottom = [...schools].sort((left, right) => left.attendanceRate - right.attendanceRate).slice(0, 8);

  return { top, bottom };
}

function movementSnapshot(filters: ProgramFilters, records: PblRecord[]): MovementMetric[] {
  const months = getFilterOptions().months;
  const selectedMonth = filters.month ?? months.at(-1);

  if (!selectedMonth) {
    return [];
  }

  const currentIndex = months.indexOf(selectedMonth);
  const previousMonth = currentIndex > 0 ? months[currentIndex - 1] : undefined;

  if (!previousMonth) {
    return [];
  }

  const baseFilters = { ...filters, month: undefined };
  const current = buildMetrics(filterPblRecords(records, { ...baseFilters, month: selectedMonth }), filters);
  const previous = buildMetrics(filterPblRecords(records, { ...baseFilters, month: previousMonth }), filters);

  return [
    {
      metric: "Participation",
      current: percent(current.participationRate),
      previous: percent(previous.participationRate),
      delta: percent(current.participationRate - previous.participationRate),
    },
    {
      metric: "Evidence",
      current: percent(current.evidenceRate),
      previous: percent(previous.evidenceRate),
      delta: percent(current.evidenceRate - previous.evidenceRate),
    },
    {
      metric: "Attendance",
      current: percent(current.attendanceRate),
      previous: percent(previous.attendanceRate),
      delta: percent(current.attendanceRate - previous.attendanceRate),
    },
  ];
}

function buildSummary(
  metrics: ReturnType<typeof buildMetrics>,
  districts: GeographySummary[],
  blocks: GeographySummary[],
  month: string,
): SummaryPayload {
  const strongestDistrict = districts[0];
  const weakestDistrict = districts.at(-1);
  const strongestBlock = blocks[0];
  const weakestBlock = blocks.at(-1);

  return {
    achievements: [
      `${metrics.participatingSchools} of ${metrics.totalSchools} schools conducted PBL in ${month}.`,
      `${metrics.evidenceSubmitted} schools submitted evidence, which is ${percent(metrics.evidenceRate)}% of participating schools.`,
      `Overall attendance reached ${percent(metrics.attendanceRate)}%, placing the selected view in ${metrics.riskStatus} status.`,
    ],
    risks: [
      weakestDistrict ? `${weakestDistrict.name} is the lowest-performing district on attendance at ${weakestDistrict.attendanceRate}%.` : "No district-level attendance gap was identified.",
      weakestBlock ? `${weakestBlock.name} is the lowest-performing block at ${weakestBlock.attendanceRate}%.` : "No block-level attendance gap was identified.",
    ],
    discussionPoints: [
      strongestDistrict ? `What practices in ${strongestDistrict.name} can be copied to lower-performing districts?` : "Which district-level practices should be shared more widely?",
      strongestBlock ? `Which follow-up actions will move ${strongestBlock.name} above the 75% threshold?` : "Which blocks need immediate support?",
      weakestDistrict && weakestBlock
        ? `How do district and block field notes explain the gap between ${strongestDistrict.name} and ${weakestDistrict.name}?`
        : "How do field notes align with the dashboard trend lines?",
    ],
  };
}

function buildActions(blocks: GeographySummary[], districts: GeographySummary[]): ReviewAction[] {
  const byAttendance = (list: GeographySummary[]) => [...list].sort((left, right) => left.attendanceRate - right.attendanceRate);
  const byEvidence = (list: GeographySummary[]) => [...list].sort((left, right) => left.evidenceRate - right.evidenceRate);

  const weakestBlocks = byAttendance(blocks).slice(0, 2);
  const weakestDistrictAttendance = byAttendance(districts)[0];
  const weakestDistrictEvidence = byEvidence(districts)[0];
  const weakestBlockEvidence = byEvidence(blocks)[0];

  const candidates: ReviewAction[] = [];

  weakestBlocks.forEach((block, index) => {
    candidates.push({
      owner: index === 0 ? "Block Coordinator" : "Program Manager",
      priority: block.riskStatus === "Critical" || block.riskStatus === "At Risk" ? "High" : "Medium",
      dueDate: "Within 7 days",
      status: "Open",
      linkedMetric: `${block.name} block attendance at ${block.attendanceRate}% (${block.riskStatus})`,
    });
  });

  if (weakestDistrictAttendance) {
    candidates.push({
      owner: "District Lead",
      priority: weakestDistrictAttendance.riskStatus === "Critical" || weakestDistrictAttendance.riskStatus === "At Risk" ? "High" : "Medium",
      dueDate: "Within 10 days",
      status: "Watching",
      linkedMetric: `${weakestDistrictAttendance.name} district attendance at ${weakestDistrictAttendance.attendanceRate}% (${weakestDistrictAttendance.riskStatus})`,
    });
  }

  if (weakestDistrictEvidence) {
    candidates.push({
      owner: "MIS / Data Officer",
      priority: weakestDistrictEvidence.evidenceRate < 60 ? "High" : "Medium",
      dueDate: "Within 10 days",
      status: "Open",
      linkedMetric: `${weakestDistrictEvidence.name} district evidence rate at ${weakestDistrictEvidence.evidenceRate}%`,
    });
  }

  if (weakestBlockEvidence) {
    candidates.push({
      owner: "Block Coordinator",
      priority: weakestBlockEvidence.evidenceRate < 60 ? "Medium" : "Low",
      dueDate: "Within 14 days",
      status: "Open",
      linkedMetric: `${weakestBlockEvidence.name} block evidence rate at ${weakestBlockEvidence.evidenceRate}%`,
    });
  }

  // De-duplicate on the linked metric and keep 3-5 actions.
  const seen = new Set<string>();
  const unique = candidates.filter((action) => {
    if (seen.has(action.linkedMetric)) return false;
    seen.add(action.linkedMetric);
    return true;
  });

  return unique.slice(0, 5);
}

export function getProgramReview(filters: ProgramFilters = {}) {
  const options = getFilterOptions();
  const selectedMonth = filters.month ?? options.months.at(-1) ?? "";
  const selectedFilters: ProgramFilters = { ...filters, month: selectedMonth || undefined };
  const records = filterPblRecords(getPblRecords(), selectedFilters);
  const metrics = buildMetrics(records, selectedFilters);
  const districts = buildGeographySummary(records, "district", selectedFilters);
  const blocks = buildGeographySummary(records, "block", selectedFilters);
  const schools = buildSchoolRankings(records, selectedFilters);

  return {
    filters: options,
    selectedFilters,
    latestMonth: selectedMonth,
    metrics: {
      ...metrics,
      participationRate: percent(metrics.participationRate),
      evidenceRate: percent(metrics.evidenceRate),
      attendanceRate: percent(metrics.attendanceRate),
    },
    movement: movementSnapshot(selectedFilters, getPblRecords()),
    districts: {
      top: districts.slice(0, 5),
      bottom: [...districts].sort((left, right) => left.attendanceRate - right.attendanceRate).slice(0, 5),
    },
    blocks: {
      top: blocks.slice(0, 5),
      bottom: [...blocks].sort((left, right) => left.attendanceRate - right.attendanceRate).slice(0, 5),
    },
    schools,
    summary: buildSummary(metrics, districts, blocks, selectedMonth || "the selected month"),
    recommendedActions: buildActions(blocks, districts),
  };
}

export function getGrantFinance() {
  return [...grantFinanceRows];
}

export function getGrantPerformance() {
  return [...grantPerformanceRows];
}

export function getEvidence() {
  return [...evidenceRows];
}

export function getGrantOptions() {
  const performance = getGrantPerformance();
  const grants = Array.from(
    new Map(
      performance.map((row) => [
        row.grantId,
        {
          grantId: row.grantId,
          grantName: row.grantName,
          donor: row.donor,
        },
      ]),
    ).values(),
  ).sort((left, right) => left.grantName.localeCompare(right.grantName));

  return {
    grants,
    months: sortMonths(performance.map((row) => row.reportingMonth)),
  };
}

export function getGrantReport(grantId?: string, month?: string) {
  const options = getGrantOptions();
  const selectedGrantId = grantId ?? options.grants[0]?.grantId;
  const selectedMonth = month ?? options.months.at(-1);
  const performance = getGrantPerformance().find(
    (row) => row.grantId === selectedGrantId && row.reportingMonth === selectedMonth,
  );

  if (!selectedGrantId || !selectedMonth || !performance) {
    return { options, report: null };
  }

  const finance = getGrantFinance().filter(
    (row) => row.grantId === selectedGrantId && row.reportingMonth === selectedMonth,
  );
  const evidence = getEvidence().filter(
    (row) => row.grantId === selectedGrantId && row.reportingMonth === selectedMonth,
  );

  const approvedBudget = finance.reduce((sum, row) => sum + row.approvedBudgetUnits, 0);
  const cumulativeUtilized = finance.reduce((sum, row) => sum + row.cumulativeUtilizedUnits, 0);
  const utilizationRate = approvedBudget ? cumulativeUtilized / approvedBudget : 0;

  const sourceFacts = [
    `Completion rate: ${percent(performance.pblCompletionRate)}%`,
    `Evidence submission rate: ${percent(performance.evidenceSubmissionRate)}%`,
    `Attendance rate: ${percent(performance.attendanceRate)}%`,
    `Finance utilization: ${percent(utilizationRate)}%`,
    `Risk status: ${performance.riskStatus}`,
    `Covered districts: ${performance.coveredDistricts}`,
    `Report status: ${performance.reportStatus}`,
    `Milestone summary: ${performance.milestoneSummary}`,
    `Evidence records: ${evidence.map((item) => item.recordId).join(", ") || "None for selected month"}`,
  ];

  const narrative = [
    `${performance.grantName} for ${selectedMonth} reached ${percent(performance.pblCompletionRate)}% PBL completion, ${percent(performance.evidenceSubmissionRate)}% evidence submission, and ${percent(performance.attendanceRate)}% attendance across ${performance.sampledSchoolRecords} sampled school records.`,
    `Finance utilization is ${percent(utilizationRate)}% across ${finance.length} budget lines, and the deterministic risk status is ${performance.riskStatus}.`,
    evidence.length
      ? `Linked evidence includes ${evidence.map((item) => item.title).join(", ")}.`
      : "No linked evidence is available for the selected grant and month.",
  ].join(" ");

  return {
    options,
    report: {
      performance: {
        ...performance,
        pblCompletionRate: percent(performance.pblCompletionRate),
        evidenceSubmissionRate: percent(performance.evidenceSubmissionRate),
        attendanceRate: percent(performance.attendanceRate),
      },
      finance,
      financeSummary: {
        approvedBudget,
        cumulativeUtilized,
        utilizationRate: percent(utilizationRate),
      },
      evidence,
      narrative,
      sourceFacts,
    },
  };
}

export function getAssistantResponse(body: {
  prompt?: string;
  month?: string;
  district?: string;
  block?: string;
  grantId?: string;
}) {
  const prompt = body.prompt?.toLowerCase() ?? "";

  if (prompt.includes("grant")) {
    const grant = getGrantReport(body.grantId, body.month);

    return {
      mode: "grant",
      answer: grant.report?.narrative ?? "No grant facts matched the selected filters.",
      facts: grant.report?.sourceFacts ?? [],
      references: grant.report?.evidence.map((item) => item.recordId) ?? [],
    };
  }

  const review = getProgramReview({
    month: body.month,
    district: body.district,
    block: body.block,
  });

  return {
    mode: "program",
    answer: [
      review.summary.achievements.join(" "),
      review.summary.risks.join(" "),
      `Priority follow-up: ${review.recommendedActions[0]?.linkedMetric ?? "No priority action found"}.`,
    ].join(" "),
    facts: [
      `Participation: ${review.metrics.participationRate}%`,
      `Evidence: ${review.metrics.evidenceRate}%`,
      `Attendance: ${review.metrics.attendanceRate}%`,
      `Risk: ${review.metrics.riskStatus}`,
    ],
    references: review.recommendedActions.map((action) => action.linkedMetric),
  };
}

export function getGradeOptionsFromData() {
  return ["Class 6", "Class 7", "Class 8"];
}

export function getSchoolRecordsForMonth(filters: ProgramFilters = {}) {
  const options = getFilterOptions();
  const selectedMonth = filters.month ?? options.months.at(-1) ?? "";
  const selectedFilters: ProgramFilters = { ...filters, month: selectedMonth || undefined };
  const records = filterPblRecords(getPblRecords(), selectedFilters);

  return records.map((record) => {
    const { enrollment, attendance, rate } = recordMetrics(record, selectedFilters);
    return {
      school: record.school,
      schoolCode: record.schoolCode,
      district: record.district,
      block: record.block,
      classes: record.classes,
      subject: record.subject,
      conducted: record.conducted,
      evidenceSubmitted: record.evidenceSubmitted,
      enrollment,
      attendance,
      attendanceRate: percent(rate),
      riskStatus: classifyRisk(rate),
      month: record.month,
    };
  });
}
