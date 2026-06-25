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

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((left, right) =>
    left.localeCompare(right, "en", { numeric: true }),
  );
}

function sortMonths(values: string[]) {
  return unique(values);
}

function extractGradeNumbers(classes: string) {
  return Array.from(classes.matchAll(/\b([6-8])\b/g), (match) => `Class ${match[1]}`);
}

function matchesGrade(classes: string, grade?: string) {
  if (!grade) {
    return true;
  }

  const selected = grade.match(/\d+/)?.[0];
  if (!selected) {
    return true;
  }

  return new RegExp(`\\b${selected}\\b`).test(classes);
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

export function getFilterOptions() {
  const records = getPblRecords();
  return {
    months: sortMonths(records.map((record) => record.month)),
    districts: unique(records.map((record) => record.district)),
    blocks: unique(records.map((record) => record.block)),
    grades: ["Class 6", "Class 7", "Class 8"],
    subjects: unique(records.map((record) => record.subject)),
  };
}

export function filterPblRecords(records: PblRecord[], filters: ProgramFilters) {
  return records.filter((record) => {
    const subjectMatch = !filters.subject || record.subject.toLowerCase().includes(filters.subject.toLowerCase());

    return (
      (!filters.month || record.month === filters.month) &&
      (!filters.district || record.district === filters.district) &&
      (!filters.block || record.block === filters.block) &&
      matchesGrade(record.classes, filters.grade) &&
      subjectMatch
    );
  });
}

function buildMetrics(records: PblRecord[]) {
  const totalSchools = records.length;
  const participatingSchools = records.filter((record) => record.conducted).length;
  const evidenceSubmitted = records.filter((record) => record.evidenceSubmitted).length;
  const totalEnrollment = records.reduce((sum, record) => sum + record.enrollment, 0);
  const totalAttendance = records.reduce((sum, record) => sum + record.attendance, 0);
  const participationRate = totalSchools ? participatingSchools / totalSchools : 0;
  const evidenceRate = participatingSchools ? evidenceSubmitted / participatingSchools : 0;
  const attendanceRate = totalEnrollment ? totalAttendance / (totalEnrollment * 2) : 0;

  const riskDistribution = {
    "On Track": 0,
    "Behind": 0,
    "At Risk": 0,
    "Critical": 0,
  };

  records.forEach((record) => {
    const status = classifyRisk(record.attendanceRate);
    riskDistribution[status]++;
  });

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

function buildGeographySummary(records: PblRecord[], field: "district" | "block"): GeographySummary[] {
  const groups = new Map<string, PblRecord[]>();

  for (const record of records) {
    const key = record[field];
    const group = groups.get(key) ?? [];
    group.push(record);
    groups.set(key, group);
  }

  return Array.from(groups.entries())
    .map(([name, groupRecords]) => {
      const metrics = buildMetrics(groupRecords);
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

function buildSchoolRankings(records: PblRecord[]) {
  const schools = records.map((record) => ({
    school: record.school,
    schoolCode: record.schoolCode,
    district: record.district,
    block: record.block,
    classes: record.classes,
    subject: record.subject,
    conducted: record.conducted,
    evidenceSubmitted: record.evidenceSubmitted,
    enrollment: record.enrollment,
    attendance: record.attendance,
    attendanceRate: percent(record.attendanceRate),
    riskStatus: classifyRisk(record.attendanceRate),
  }));

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
  const current = buildMetrics(filterPblRecords(records, { ...baseFilters, month: selectedMonth }));
  const previous = buildMetrics(filterPblRecords(records, { ...baseFilters, month: previousMonth }));

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
  const weakestBlocks = [...blocks].sort((left, right) => left.attendanceRate - right.attendanceRate).slice(0, 2);
  const weakestDistricts = [...districts].sort((left, right) => left.attendanceRate - right.attendanceRate).slice(0, 1);

  return [
    ...weakestBlocks.map((block, index) => ({
      owner: index === 0 ? "Block Coordinator" : "Program Manager",
      priority: index === 0 ? "High" : "Medium",
      dueDate: "Within 7 days",
      status: "Open" as const,
      linkedMetric: `${block.name} attendance at ${block.attendanceRate}%`,
    })),
    ...weakestDistricts.map((district) => ({
      owner: "District Lead",
      priority: "High" as const,
      dueDate: "Within 10 days",
      status: "Watching" as const,
      linkedMetric: `${district.name} evidence rate at ${district.evidenceRate}%`,
    })),
  ].slice(0, 3);
}

export function getProgramReview(filters: ProgramFilters = {}) {
  const options = getFilterOptions();
  const selectedMonth = filters.month ?? options.months.at(-1) ?? "";
  const selectedFilters: ProgramFilters = { ...filters, month: selectedMonth || undefined };
  const records = filterPblRecords(getPblRecords(), selectedFilters);
  const metrics = buildMetrics(records);
  const districts = buildGeographySummary(records, "district");
  const blocks = buildGeographySummary(records, "block");
  const schools = buildSchoolRankings(records);

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

  return records.map((record) => ({
    school: record.school,
    schoolCode: record.schoolCode,
    district: record.district,
    block: record.block,
    classes: record.classes,
    subject: record.subject,
    conducted: record.conducted,
    evidenceSubmitted: record.evidenceSubmitted,
    enrollment: record.enrollment,
    attendance: record.attendance,
    attendanceRate: percent(record.attendanceRate),
    riskStatus: classifyRisk(record.attendanceRate),
    month: record.month,
  }));
}
