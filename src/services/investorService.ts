// "DB" giả lập bằng localStorage cho Investor + Account (không cần backend).
// Mô hình theo chuẩn production:
//   - Mỗi Investor sở hữu nhiều Account (quan hệ 1-n qua account.investorId).
//   - Id là số nguyên tuần tự bắt đầu từ 1 (investor: 1,2,3...; account: 1,2,3...).
//   - Investor được coi là Active khi có ít nhất 1 Account đang Active.

export type InvestorStatus = "Active" | "Inactive";
export type AccountStatus = "Active" | "Inactive";

export const PRODUCT_TYPES = [
  "Managed Fund",
  "Term Deposit",
  "Shares",
  "Superannuation",
];

export const INVESTOR_PARTY_TYPES = [
  "Individual",
  "Joint",
  "Company",
  "Trust",
];

export interface InvestorAccount {
  id: string; // Account Id (số nguyên dạng chuỗi), vd "1"
  investorId: string; // Khóa ngoại -> Investor.id
  productType: string;
  status: AccountStatus;
  balance: number; // AUD
  openedDate: string; // yyyy-mm-dd
}

export interface Investor {
  id: string; // Investor Id (số nguyên dạng chuỗi), vd "1"
  name: string;
  partyType: string; // Individual / Joint / Company / Trust
  status: InvestorStatus; // suy ra từ trạng thái các account
  dateOfBirth: string; // yyyy-mm-dd
  postcode: string;
  email: string;
  accounts: InvestorAccount[];
}

export interface InvestorSearchCriteria {
  investorId?: string;
  investorName?: string;
  status?: InvestorStatus | "All";
  accountId?: string;
  dobFrom?: string; // yyyy-mm-dd
  dobTo?: string; // yyyy-mm-dd
  email?: string;
  postcode?: string;
  hasActiveAccountOnly?: boolean;
}

// Đổi version key khi thay đổi cấu trúc seed để tự động seed lại.
const INVESTORS_KEY = "xtream_investors_v5";

const FIRST_NAMES = [
  "John", "Mary", "David", "Emily", "Robert", "Sophia", "James", "Olivia",
  "William", "Emma", "Daniel", "Grace", "Michael", "Chloe", "Henry", "Lily",
];
const LAST_NAMES = [
  "Smith", "Johnson", "Nguyen", "Tran", "Brown", "Wilson", "Taylor", "Lee",
  "Pham", "Walker", "Hall", "Allen", "Young", "King", "Wright", "Scott",
];
const POSTCODES = ["2000", "3000", "4000", "5000", "2150", "6000", "7000"];

const pad = (value: number, length: number) =>
  String(value).padStart(length, "0");

// ----- Helpers suy ra trạng thái từ quan hệ -----

export function activeAccountCount(inv: Investor): number {
  return inv.accounts.filter((a) => a.status === "Active").length;
}

export function deriveInvestorStatus(accounts: InvestorAccount[]): InvestorStatus {
  return accounts.some((a) => a.status === "Active") ? "Active" : "Inactive";
}

// ----- Sinh dữ liệu seed mang tính quyết định (deterministic) -----

function generateSeedInvestors(): Investor[] {
  const investors: Investor[] = [];
  let accountSeq = 1; // Account id chạy tuần tự toàn hệ thống, bắt đầu từ 1.

  const buildAccount = (
    investorId: string,
    productIndex: number,
    status: AccountStatus,
    seedBalance: number,
    openedDate: string
  ): InvestorAccount => {
    const account: InvestorAccount = {
      id: String(accountSeq),
      investorId,
      productType: PRODUCT_TYPES[productIndex % PRODUCT_TYPES.length],
      status,
      balance: seedBalance,
      openedDate,
    };
    accountSeq += 1;
    return account;
  };

  const buildInvestor = (
    index: number, // 1-based
    name: string,
    partyType: string,
    accountStatuses: AccountStatus[]
  ): Investor => {
    const id = String(index);
    const dobYear = 1960 + (index % 40);
    const dobMonth = pad(((index * 5) % 12) + 1, 2);
    const dobDay = pad(((index * 7) % 28) + 1, 2);

    const accounts = accountStatuses.map((status, j) => {
      const openedYear = 2015 + ((index + j) % 10);
      const openedMonth = pad(((index + j) % 12) + 1, 2);
      const openedDay = pad(((index + j) % 28) + 1, 2);
      const balance =
        status === "Active"
          ? 25000 + ((index * 13759 + j * 4271) % 1975000)
          : 0;
      return buildAccount(
        id,
        index + j,
        status,
        balance,
        `${openedYear}-${openedMonth}-${openedDay}`
      );
    });

    // Email suy ra từ chính tên (slug) + index để vừa khớp tên vừa duy nhất.
    const emailLocal = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ".")
      .replace(/^\.|\.$/g, "");

    return {
      id,
      name,
      partyType,
      status: deriveInvestorStatus(accounts),
      dateOfBirth: `${dobYear}-${dobMonth}-${dobDay}`,
      postcode: POSTCODES[(index - 1) % POSTCODES.length],
      email: `${emailLocal}${index}@example.com`,
      accounts,
    };
  };

  // 2 bản ghi mẫu cố định để minh hoạ UI (gồm 1 tên rất dài cho tooltip).
  investors.push(buildInvestor(1, "Sponge Bob", "Individual", ["Active", "Active"]));
  investors.push(
    buildInvestor(
      2,
      "This is a very very very long super long name",
      "Company",
      ["Inactive"]
    )
  );

  // Phần còn lại sinh tự động nhưng vẫn đúng logic.
  // Ghép (first, last) theo cặp duy nhất: first chạy nhanh, last chạy mỗi khi
  // first quay vòng. Vì FIRST_NAMES & LAST_NAMES không có phần tử trùng nên mỗi
  // cặp tạo ra một họ tên khác nhau (đủ cho tối đa 16 x 16 = 256 investor).
  const TOTAL = 48;
  for (let i = 3; i <= TOTAL; i++) {
    const first = FIRST_NAMES[(i - 1) % FIRST_NAMES.length];
    const last =
      LAST_NAMES[
        Math.floor((i - 1) / FIRST_NAMES.length) % LAST_NAMES.length
      ];
    const partyType = INVESTOR_PARTY_TYPES[(i - 1) % INVESTOR_PARTY_TYPES.length];

    const accountCount = 1 + ((i - 1) % 3); // 1..3 account/investor
    const investorActive = i % 4 !== 0; // ~75% investor đang hoạt động

    const statuses: AccountStatus[] = [];
    for (let j = 0; j < accountCount; j++) {
      if (!investorActive) {
        statuses.push("Inactive");
      } else {
        // Account đầu tiên luôn Active để đảm bảo investor Active có account Active.
        statuses.push(j === 0 || (i + j) % 2 === 0 ? "Active" : "Inactive");
      }
    }

    investors.push(buildInvestor(i, `${first} ${last}`, partyType, statuses));
  }

  return investors;
}

const SEED_INVESTORS: Investor[] = generateSeedInvestors();

// Dùng cho seed Work Items (dữ liệu quyết định, không phụ thuộc localStorage).
export function getSeedInvestors(): Investor[] {
  return SEED_INVESTORS;
}

export function getInvestors(): Investor[] {
  const raw = localStorage.getItem(INVESTORS_KEY);
  if (!raw) {
    localStorage.setItem(INVESTORS_KEY, JSON.stringify(SEED_INVESTORS));
    return SEED_INVESTORS;
  }
  try {
    return JSON.parse(raw) as Investor[];
  } catch {
    return SEED_INVESTORS;
  }
}

function saveInvestors(list: Investor[]): void {
  localStorage.setItem(INVESTORS_KEY, JSON.stringify(list));
}

export function getInvestorById(id: string): Investor | undefined {
  return getInvestors().find((inv) => inv.id === id);
}

export function getAllAccounts(): InvestorAccount[] {
  return getInvestors().flatMap((inv) => inv.accounts);
}

export function getInvestorByAccountId(accountId: string): Investor | undefined {
  return getInvestors().find((inv) =>
    inv.accounts.some((a) => a.id === accountId)
  );
}

export function addInvestor(investor: Investor): void {
  const list = getInvestors();
  list.push(investor);
  saveInvestors(list);
}

export function updateInvestor(id: string, patch: Partial<Investor>): void {
  const list = getInvestors().map((inv) =>
    inv.id === id ? { ...inv, ...patch } : inv
  );
  saveInvestors(list);
}

export function deleteInvestor(id: string): void {
  saveInvestors(getInvestors().filter((inv) => inv.id !== id));
}

export function searchInvestors(criteria: InvestorSearchCriteria): Investor[] {
  const {
    investorId,
    investorName,
    status,
    accountId,
    dobFrom,
    dobTo,
    email,
    postcode,
    hasActiveAccountOnly,
  } = criteria;

  return getInvestors().filter((inv) => {
    if (investorId && inv.id.toLowerCase() !== investorId.trim().toLowerCase()) {
      return false;
    }
    if (
      investorName &&
      !inv.name.toLowerCase().includes(investorName.toLowerCase())
    ) {
      return false;
    }
    if (status && status !== "All" && inv.status !== status) {
      return false;
    }
    // Account Id: khớp chính xác với BẤT KỲ account nào của investor.
    if (
      accountId &&
      !inv.accounts.some(
        (a) => a.id.toLowerCase() === accountId.trim().toLowerCase()
      )
    ) {
      return false;
    }
    if (dobFrom && inv.dateOfBirth < dobFrom) return false;
    if (dobTo && inv.dateOfBirth > dobTo) return false;
    if (email && !inv.email.toLowerCase().includes(email.toLowerCase())) {
      return false;
    }
    if (postcode && !inv.postcode.toLowerCase().includes(postcode.toLowerCase())) {
      return false;
    }
    if (hasActiveAccountOnly && activeAccountCount(inv) <= 0) return false;
    return true;
  });
}

export function exportInvestorsToCsv(list: Investor[]): void {
  const headers = [
    "Investor Id",
    "Investor Name",
    "Party Type",
    "Status",
    "Date of Birth",
    "Postcode",
    "Active Accounts",
    "Email",
  ];

  const escape = (value: string | number) => {
    const text = String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  const rows = list.map((inv) =>
    [
      inv.id,
      inv.name,
      inv.partyType,
      inv.status,
      inv.dateOfBirth,
      inv.postcode,
      activeAccountCount(inv),
      inv.email,
    ]
      .map(escape)
      .join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "investors.csv";
  link.click();
  URL.revokeObjectURL(url);
}
