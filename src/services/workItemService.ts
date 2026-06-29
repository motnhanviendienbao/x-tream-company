// "DB" giả lập bằng localStorage cho Work Items (không cần backend).
// Mỗi Work Item gắn với một Investor + một Account có thật (đúng logic production).

import {
  getSeedInvestors,
  type Investor,
} from "./investorService";

export type WorkItemStatus = "Open" | "Rejected" | "Approved";

export interface WorkItem {
  id: string; // Work Item ID (số nguyên dạng chuỗi), vd "1"
  investorId: string; // Khóa ngoại -> Investor.id
  investorName: string;
  investorAccountId: string; // Khóa ngoại -> InvestorAccount.id
  workItemType: string;
  partyType: string;
  status: WorkItemStatus;
  amount: number; // AUD
  createdDate: string; // yyyy-mm-dd
  note: string;
  hasActiveAccount: boolean;
}

export interface WorkItemSearchCriteria {
  workItemId?: string;
  workItemType?: string | "All";
  status?: WorkItemStatus | "All";
  investorAccountId?: string;
  partyType?: string | "All";
  receivedFrom?: string; // yyyy-mm-dd
  receivedTo?: string; // yyyy-mm-dd
  hasActiveAccountOnly?: boolean;
}

// Hệ thống hiện chỉ xử lý loại "Application".
export const WORK_ITEM_TYPES = ["Application"];

export const WORK_ITEM_STATUSES: WorkItemStatus[] = [
  "Open",
  "Rejected",
  "Approved",
];

export const PARTY_TYPES = ["Individual", "Joint", "Company", "Trust"];

const WORK_ITEMS_KEY = "xtream_work_items_v4";

const LONG_NOTE =
  "This is a very very very long note that should be truncated with ellipsis and shown in full on hover via tooltip";

function generateSeedWorkItems(): WorkItem[] {
  const investors: Investor[] = getSeedInvestors();
  const list: WorkItem[] = [];
  const statuses: WorkItemStatus[] = ["Open", "Approved", "Rejected"];
  let seq = 1;

  // Tạo Work Item từ chính các Account có thật của Investor.
  investors.forEach((inv, invIndex) => {
    inv.accounts.forEach((account, accIndex) => {
      const status = statuses[(invIndex + accIndex) % statuses.length];
      // Số tiền hợp lệ (tối thiểu 50 AUD), mang tính quyết định.
      const amount = 5000 + ((seq * 9173) % 495000);

      list.push({
        id: String(seq),
        investorId: inv.id,
        investorName: inv.name,
        investorAccountId: account.id,
        workItemType: "Application",
        partyType: inv.partyType,
        status,
        amount,
        createdDate: account.openedDate,
        note:
          seq === 2
            ? LONG_NOTE
            : seq % 4 === 0
            ? ""
            : `Application work item for ${account.id}`,
        hasActiveAccount: account.status === "Active",
      });
      seq += 1;
    });
  });

  return list;
}

const SEED_WORK_ITEMS: WorkItem[] = generateSeedWorkItems();

export function getWorkItems(): WorkItem[] {
  const raw = localStorage.getItem(WORK_ITEMS_KEY);
  if (!raw) {
    localStorage.setItem(WORK_ITEMS_KEY, JSON.stringify(SEED_WORK_ITEMS));
    return SEED_WORK_ITEMS;
  }
  try {
    return JSON.parse(raw) as WorkItem[];
  } catch {
    return SEED_WORK_ITEMS;
  }
}

function saveWorkItems(list: WorkItem[]): void {
  localStorage.setItem(WORK_ITEMS_KEY, JSON.stringify(list));
}

export function getWorkItemById(id: string): WorkItem | undefined {
  return getWorkItems().find((w) => w.id === id);
}

// Sinh Work Item ID kế tiếp (số nguyên tăng dần dạng chuỗi).
export function nextWorkItemId(): string {
  const list = getWorkItems();
  const maxSeq = list.reduce((max, w) => {
    const num = Number(w.id);
    return Number.isNaN(num) ? max : Math.max(max, num);
  }, 0);
  return String(maxSeq + 1);
}

export function addWorkItem(item: WorkItem): void {
  const list = getWorkItems();
  list.push(item);
  // Sắp xếp theo id số tăng dần để dữ liệu luôn đúng thứ tự như trong DB.
  list.sort((a, b) => Number(a.id) - Number(b.id));
  saveWorkItems(list);
}

export function updateWorkItem(id: string, patch: Partial<WorkItem>): void {
  saveWorkItems(
    getWorkItems().map((w) => (w.id === id ? { ...w, ...patch } : w))
  );
}

export function deleteWorkItem(id: string): void {
  saveWorkItems(getWorkItems().filter((w) => w.id !== id));
}

export function searchWorkItems(
  criteria: WorkItemSearchCriteria
): WorkItem[] {
  const {
    workItemId,
    workItemType,
    status,
    investorAccountId,
    partyType,
    receivedFrom,
    receivedTo,
    hasActiveAccountOnly,
  } = criteria;

  return getWorkItems().filter((w) => {
    if (workItemId && w.id.toLowerCase() !== workItemId.trim().toLowerCase()) {
      return false;
    }
    if (
      investorAccountId &&
      w.investorAccountId.toLowerCase() !==
        investorAccountId.trim().toLowerCase()
    ) {
      return false;
    }
    if (workItemType && workItemType !== "All" && w.workItemType !== workItemType) {
      return false;
    }
    if (status && status !== "All" && w.status !== status) {
      return false;
    }
    if (partyType && partyType !== "All" && w.partyType !== partyType) {
      return false;
    }
    if (receivedFrom && w.createdDate < receivedFrom) return false;
    if (receivedTo && w.createdDate > receivedTo) return false;
    if (hasActiveAccountOnly && !w.hasActiveAccount) return false;
    return true;
  });
}

export function exportWorkItemsToCsv(list: WorkItem[]): void {
  const headers = [
    "Work Item ID",
    "Investor Name",
    "Status",
    "The Amount of Money",
    "Created Date",
    "Note",
  ];

  const escape = (value: string | number) => {
    const text = String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  const rows = list.map((w) =>
    [
      w.id,
      w.investorName,
      w.status,
      `${w.amount.toFixed(2)} AUD`,
      w.createdDate,
      w.note,
    ]
      .map(escape)
      .join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "work-items.csv";
  link.click();
  URL.revokeObjectURL(url);
}
