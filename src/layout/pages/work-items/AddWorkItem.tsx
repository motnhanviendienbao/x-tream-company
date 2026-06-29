import { useEffect, useMemo, useRef, useState } from "react";
import { useBlocker, useLocation, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import NavBar from "../../../components/ui/NavBar";
import Dialog from "../../../components/ui/dialog/Dialog";
import AppRoutes from "../../../constants/AppRoutes";
import {
  getInvestors,
  getInvestorByAccountId,
  type Investor,
  type InvestorAccount,
} from "../../../services/investorService";
import {
  addWorkItem,
  nextWorkItemId,
  type WorkItem,
} from "../../../services/workItemService";

const MIN_QUERY = 3;
const NOTES_MAX = 300;
const MIN_AMOUNT = 50;

const labelClass = "mb-1 block text-[13px] font-medium text-slate-700";
const inputClass =
  "h-10 w-full rounded-md border border-[#D1D5DB] bg-white px-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-800";

const AddWorkItem = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const workItemType =
    (location.state as { workItemType?: string } | null)?.workItemType ??
    "Application";

  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(
    null
  );
  const [selectedAccount, setSelectedAccount] =
    useState<InvestorAccount | null>(null);
  const [investorQuery, setInvestorQuery] = useState("");
  const [accountQuery, setAccountQuery] = useState("");
  const [investorOpen, setInvestorOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [amountTouched, setAmountTouched] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showUnsaved, setShowUnsaved] = useState(false);
  // Đang chờ reload (khi người dùng nhấn F5/Ctrl+R) sau khi xác nhận dialog.
  const [pendingReload, setPendingReload] = useState(false);

  // Khi đã lưu thành công thì cho phép rời trang, không chặn nữa.
  const allowLeave = useRef(false);

  // Chặn mọi điều hướng nội bộ + nút Back của trình duyệt để hiện dialog xác nhận.
  const blocker = useBlocker(() => !allowLeave.current);

  useEffect(() => {
    if (blocker.state === "blocked") setShowUnsaved(true);
  }, [blocker.state]);

  // Reload bằng phím tắt (F5 / Ctrl+R / Cmd+R): chặn để hiện dialog custom.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isReloadShortcut =
        e.key === "F5" ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "r");
      if (isReloadShortcut && !allowLeave.current) {
        e.preventDefault();
        setPendingReload(true);
        setShowUnsaved(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Reload bằng nút trình duyệt / đóng tab: chỉ có thể dùng hộp xác nhận gốc.
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (allowLeave.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () =>
      window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const investors = getInvestors();

  const investorMatches = useMemo(() => {
    const q = investorQuery.trim().toLowerCase();
    if (q.length < MIN_QUERY) return [];
    return investors
      .filter(
        (i) =>
          i.name.toLowerCase().includes(q) || i.id.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [investorQuery, investors]);

  // Account gợi ý: nếu đã chọn investor thì hiện các account của investor đó;
  // ngược lại tìm trong toàn bộ account theo account id HOẶC tên investor (>=3 ký tự).
  const accountMatches = useMemo(() => {
    const q = accountQuery.trim().toLowerCase();
    if (selectedInvestor) {
      return selectedInvestor.accounts
        .filter((a) => !q || a.id.toLowerCase().includes(q))
        .map((account) => ({ account, investorName: selectedInvestor.name }));
    }
    if (q.length < MIN_QUERY) return [];
    return investors
      .flatMap((i) =>
        i.accounts.map((account) => ({ account, investorName: i.name }))
      )
      .filter(
        ({ account, investorName }) =>
          account.id.toLowerCase().includes(q) ||
          investorName.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [accountQuery, selectedInvestor, investors]);

  const pickInvestor = (inv: Investor) => {
    setSelectedInvestor(inv);
    setInvestorQuery(`${inv.name} (${inv.id})`);
    if (inv.accounts.length === 1) {
      setSelectedAccount(inv.accounts[0]);
      setAccountQuery(inv.accounts[0].id);
    } else {
      setSelectedAccount(null);
      setAccountQuery("");
    }
    setInvestorOpen(false);
    setAccountOpen(false);
  };

  const pickAccount = (acc: InvestorAccount) => {
    const inv = getInvestorByAccountId(acc.id) ?? selectedInvestor;
    setSelectedInvestor(inv);
    setSelectedAccount(acc);
    setAccountQuery(acc.id);
    if (inv) setInvestorQuery(`${inv.name} (${inv.id})`);
    setAccountOpen(false);
    setInvestorOpen(false);
  };

  const isAccountActive = selectedAccount?.status === "Active";
  const amountNumber = Number(amount);
  const amountInvalid =
    !amount || Number.isNaN(amountNumber) || amountNumber < MIN_AMOUNT;

  const canSave =
    !!selectedInvestor && !!selectedAccount && isAccountActive && !amountInvalid;

  const handleSave = () => {
    setSubmitted(true);
    if (!canSave) return;

    const newItem: WorkItem = {
      id: nextWorkItemId(),
      investorId: selectedInvestor!.id,
      investorName: selectedInvestor!.name,
      investorAccountId: selectedAccount!.id,
      workItemType,
      partyType: selectedInvestor!.partyType,
      status: "Open",
      amount: amountNumber,
      createdDate: new Date().toISOString().slice(0, 10),
      note: notes.trim(),
      hasActiveAccount: selectedAccount!.status === "Active",
    };
    addWorkItem(newItem);
    allowLeave.current = true;
    navigate(AppRoutes.WORK_ITEMS);
  };

  // Yêu cầu rời trang (Cancel / breadcrumb): điều hướng để kích hoạt blocker.
  const requestLeave = () => navigate(AppRoutes.WORK_ITEMS);

  const stayOnPage = () => {
    setShowUnsaved(false);
    setPendingReload(false);
    if (blocker.state === "blocked") blocker.reset();
  };

  const discardAndLeave = () => {
    setShowUnsaved(false);
    if (pendingReload) {
      setPendingReload(false);
      allowLeave.current = true;
      window.location.reload();
      return;
    }
    if (blocker.state === "blocked") {
      blocker.proceed();
    } else {
      navigate(AppRoutes.WORK_ITEMS);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#EDEDED]">
      <NavBar />

      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* Header */}
        <div className="bg-[#16172E] px-10 pt-4 pb-6 text-white">
          <div className="flex items-center gap-1 text-xs text-slate-300">
            <button
              type="button"
              onClick={requestLeave}
              className="text-slate-400 hover:text-white"
            >
              Home
            </button>
            <span className="mx-1">/</span>
            <button
              type="button"
              onClick={requestLeave}
              className="text-slate-400 hover:text-white"
            >
              Work Items
            </button>
            <span className="mx-1">/</span>
            <span className="text-white">Add New Work Items</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Add New Work Items</h1>
            <button
              type="button"
              onClick={requestLeave}
              className="rounded-md bg-white/10 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/20"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-6 px-10 py-6">
          {/* Work Item Types */}
          <section className="rounded-md border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <h2 className="text-[15px] font-bold text-slate-900">
              Work Item Types
            </h2>
            <p className="mt-4 text-[13px] font-medium text-slate-500">Types</p>
            <p className="mt-1 text-sm text-slate-800">{workItemType}</p>
          </section>

          {/* Work Item Details */}
          <section className="rounded-md border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <h2 className="text-[15px] font-bold text-slate-900">
              Work Item Details
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
              {/* Investor */}
              <div>
                <label className={labelClass}>
                  Investor <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className={`${inputClass} pr-9 ${
                      submitted && !selectedInvestor ? "border-[#E11D48]" : ""
                    }`}
                    placeholder="Enter investor id or name"
                    value={investorQuery}
                    onChange={(e) => {
                      setInvestorQuery(e.target.value);
                      setSelectedInvestor(null);
                      setSelectedAccount(null);
                      setAccountQuery("");
                      setInvestorOpen(true);
                    }}
                    onFocus={() => setInvestorOpen(true)}
                    onBlur={() => setTimeout(() => setInvestorOpen(false), 150)}
                  />
                  <Search
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  {investorOpen && investorMatches.length > 0 && (
                    <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-[#E5E7EB] bg-white shadow-lg">
                      {investorMatches.map((inv) => (
                        <li
                          key={inv.id}
                          onMouseDown={() => pickInvestor(inv)}
                          className="cursor-pointer px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                        >
                          {inv.name}{" "}
                          <span className="text-slate-400">({inv.id})</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="mt-2">
                  <p className="text-[13px] font-medium text-slate-700">
                    Account Status
                  </p>
                  {selectedAccount ? (
                    <>
                      <span
                        className={`mt-1 inline-block rounded-full px-3 py-0.5 text-xs font-medium text-white ${
                          isAccountActive ? "bg-[#16A34A]" : "bg-[#DC2626]"
                        }`}
                      >
                        {selectedAccount.status}
                      </span>
                      {!isAccountActive && (
                        <p className="mt-1 text-[12px] font-medium text-[#DC2626]">
                          Only create Work Items for Active Investor Account
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="mt-1 text-sm text-slate-400">-</p>
                  )}
                </div>
              </div>

              {/* Investor Account */}
              <div>
                <label className={labelClass}>
                  Investor Account <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className={`${inputClass} pr-9 ${
                      submitted && !selectedAccount ? "border-[#E11D48]" : ""
                    }`}
                    placeholder={
                      selectedInvestor
                        ? "Select an account of this investor"
                        : "Enter account id or investor name"
                    }
                    value={accountQuery}
                    onChange={(e) => {
                      setAccountQuery(e.target.value);
                      setSelectedAccount(null);
                      setAccountOpen(true);
                    }}
                    onFocus={() => setAccountOpen(true)}
                    onBlur={() => setTimeout(() => setAccountOpen(false), 150)}
                  />
                  <Search
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  {accountOpen && accountMatches.length > 0 && (
                    <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-[#E5E7EB] bg-white shadow-lg">
                      {accountMatches.map(({ account, investorName }) => (
                        <li
                          key={account.id}
                          onMouseDown={() => pickAccount(account)}
                          className="flex items-center justify-between gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 cursor-pointer"
                        >
                          <span>
                            {account.id}{" "}
                            <span className="text-slate-400">
                              ({investorName} · {account.productType})
                            </span>
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-medium text-white ${
                              account.status === "Active"
                                ? "bg-[#16A34A]"
                                : "bg-[#DC2626]"
                            }`}
                          >
                            {account.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Amount */}
                <div className="mt-2">
                  <label className={labelClass}>
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className={`${inputClass} ${
                      (submitted || amountTouched) && amountInvalid
                        ? "border-[#E11D48]"
                        : ""
                    }`}
                    placeholder="Minimum 50 AUD"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    onBlur={() => setAmountTouched(true)}
                  />
                  {(submitted || amountTouched) && amountInvalid && (
                    <p className="mt-1 text-[12px] font-medium text-[#DC2626]">
                      Minimum 50 AUD
                    </p>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className={labelClass}>Notes</label>
                <textarea
                  rows={4}
                  maxLength={NOTES_MAX}
                  className="w-full rounded-md border border-[#D1D5DB] bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-800"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <p className="mt-1 text-right text-[12px] text-slate-400">
                  {notes.length}/{NOTES_MAX}
                </p>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={requestLeave}
              className="h-10 rounded-md border border-[#D1D5DB] bg-white px-5 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="h-10 rounded-md bg-[#16172E] px-5 text-sm font-medium text-white transition-colors hover:bg-[#262844]"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Unsaved changes dialog */}
      {showUnsaved && (
        <Dialog>
          <div className="w-[420px] rounded-lg bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900">Unsaved changes</h2>
            <p className="mt-3 text-sm text-slate-600">
              Any unsaved changes will be lost.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to cancel?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={stayOnPage}
                className="h-10 rounded-md border border-[#D1D5DB] bg-white px-5 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50"
              >
                Stay on Page
              </button>
              <button
                type="button"
                onClick={discardAndLeave}
                className="h-10 rounded-md bg-[#16172E] px-5 text-sm font-medium text-white transition-colors hover:bg-[#262844]"
              >
                Discard changes
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default AddWorkItem;
