import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "antd";
import { Check, ChevronDown, Plus, X } from "lucide-react";
import NavBar from "../../../components/ui/NavBar";
import Dialog from "../../../components/ui/dialog/Dialog";
import PaginationUI from "../../../components/ui/table/Pagination";
import AppRoutes from "../../../constants/AppRoutes";
import { isTooltip } from "../../../utils/helper";
import {
  activeAccountCount,
  exportInvestorsToCsv,
  getInvestors,
  searchInvestors,
  type Investor,
  type InvestorStatus,
} from "../../../services/investorService";

type Criteria = {
  investorId: string;
  investorName: string;
  status: InvestorStatus | "All";
  accountId: string;
  dobFrom: string;
  dobTo: string;
  email: string;
  postcode: string;
  hasActiveAccountOnly: boolean;
};

const EMPTY_CRITERIA: Criteria = {
  investorId: "",
  investorName: "",
  status: "All",
  accountId: "",
  dobFrom: "",
  dobTo: "",
  email: "",
  postcode: "",
  hasActiveAccountOnly: false,
};

const TABLE_HEADERS = [
  "#",
  "Investor Name",
  "Status",
  "Date of Birth",
  "Postcode",
  "Active Accounts",
  "Email",
];

const formatDob = (iso: string) => {
  const [year, month, day] = iso.split("-");
  return year && month && day ? `${day}/${month}/${year}` : iso;
};

const fieldLabelClass = "mb-1 block text-[13px] font-medium text-slate-600";
const fieldInputClass =
  "h-10 w-full rounded-md border border-[#D1D5DB] bg-white px-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-800";

const Investors = () => {
  const navigate = useNavigate();
  const [criteria, setCriteria] = useState<Criteria>(EMPTY_CRITERIA);
  // Mở rộng để hiện thêm 2 trường Email + Postcode.
  const [expanded, setExpanded] = useState(false);
  // null = chưa bấm Retrieve lần nào.
  const [results, setResults] = useState<Investor[] | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const pagedResults = useMemo(() => {
    if (!results) return [];
    const start = (page - 1) * pageSize;
    return results.slice(start, start + pageSize);
  }, [results, page, pageSize]);

  const updateField = <K extends keyof Criteria>(key: K, value: Criteria[K]) => {
    setCriteria((prev) => ({ ...prev, [key]: value }));
  };

  // "Trống" = không nhập tiêu chí tìm kiếm nào (bỏ qua checkbox).
  const isCriteriaEmpty = (c: Criteria) =>
    !c.investorId.trim() &&
    !c.investorName.trim() &&
    !c.accountId.trim() &&
    !c.email.trim() &&
    !c.postcode.trim() &&
    c.status === "All" &&
    !c.dobFrom &&
    !c.dobTo;

  const performSearch = () => {
    setPage(1);
    setResults(searchInvestors(criteria));
  };

  const handleRetrieve = () => {
    if (isCriteriaEmpty(criteria)) {
      setShowConfirm(true);
      return;
    }
    performSearch();
  };

  const handleConfirmContinue = () => {
    setShowConfirm(false);
    performSearch();
  };

  const handleClear = () => {
    setCriteria(EMPTY_CRITERIA);
    setResults(null);
  };

  const handleExport = () => {
    exportInvestorsToCsv(results && results.length > 0 ? results : getInvestors());
  };

  return (
    <div className="flex h-screen w-full bg-[#EDEDED]">
      <NavBar />

      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* Header */}
        <div className="bg-[#16172E] px-10 pt-4 pb-6 text-white">
          <div className="text-xs text-slate-300">
            <span className="text-slate-400">Home</span>
            <span className="mx-1">/</span>
            <span className="text-white">Investors</span>
          </div>
          <div className="mt-3 flex items-end justify-between">
            <h1 className="text-3xl font-bold">Investors</h1>
            <button
              type="button"
              onClick={() => navigate(AppRoutes.ADD_NEW_INVESTOR)}
              className="flex items-center gap-1.5 rounded-md border border-white/50 px-3.5 py-2 text-sm font-medium transition-colors hover:bg-white/10"
            >
              <Plus size={16} />
              Add New
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-6 px-10 py-6">
          {/* Search Criteria */}
          <section className="rounded-md border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-slate-900">
                Search Criteria
              </h2>
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="text-slate-500 hover:text-slate-900"
                aria-label="Toggle search criteria"
              >
                <ChevronDown
                  size={20}
                  className={expanded ? "rotate-180 transition-transform" : "transition-transform"}
                />
              </button>
            </div>

            <>
                <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
                  <div>
                    <label className={fieldLabelClass}>Investor Id</label>
                    <input
                      type="text"
                      className={fieldInputClass}
                      value={criteria.investorId}
                      onChange={(e) => updateField("investorId", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className={fieldLabelClass}>Investor Name</label>
                    <input
                      type="text"
                      className={fieldInputClass}
                      value={criteria.investorName}
                      onChange={(e) =>
                        updateField("investorName", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className={fieldLabelClass}>Investor Status</label>
                    <div className="relative">
                      <select
                        className={`${fieldInputClass} appearance-none pr-9`}
                        value={criteria.status}
                        onChange={(e) =>
                          updateField(
                            "status",
                            e.target.value as Criteria["status"]
                          )
                        }
                      >
                        <option value="All">All</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                      <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={fieldLabelClass}>Investor Account Id</label>
                    <input
                      type="text"
                      className={fieldInputClass}
                      value={criteria.accountId}
                      onChange={(e) => updateField("accountId", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className={fieldLabelClass}>Date of Birth</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        className={fieldInputClass}
                        value={criteria.dobFrom}
                        onChange={(e) => updateField("dobFrom", e.target.value)}
                      />
                      <span className="text-sm text-slate-500">to</span>
                      <input
                        type="date"
                        className={fieldInputClass}
                        value={criteria.dobTo}
                        onChange={(e) => updateField("dobTo", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-end pb-2.5">
                    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-[#16172E]"
                        checked={criteria.hasActiveAccountOnly}
                        onChange={(e) =>
                          updateField("hasActiveAccountOnly", e.target.checked)
                        }
                      />
                      Has Active Accounts Only
                    </label>
                  </div>
                </div>

                {expanded && (
                  <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-3">
                    <div>
                      <label className={fieldLabelClass}>Email</label>
                      <input
                        type="text"
                        className={fieldInputClass}
                        value={criteria.email}
                        onChange={(e) => updateField("email", e.target.value)}
                      />
                    </div>

                    <div>
                      <label className={fieldLabelClass}>Postcode</label>
                      <input
                        type="text"
                        className={fieldInputClass}
                        value={criteria.postcode}
                        onChange={(e) => updateField("postcode", e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="h-10 rounded-md border border-[#D1D5DB] bg-white px-5 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={handleRetrieve}
                    className="h-10 rounded-md bg-[#16172E] px-5 text-sm font-medium text-white transition-colors hover:bg-[#262844]"
                  >
                    Retrieve
                  </button>
                </div>
              </>
          </section>

          {/* Search Results */}
          <section className="rounded-md border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <h2 className="text-[15px] font-bold text-slate-900">
              Search Results
            </h2>

            <div className="mt-4 overflow-hidden rounded-md border border-[#E5E7EB]">
              <div className="flex justify-end border-b border-[#E5E7EB] px-4 py-2">
                <button
                  type="button"
                  onClick={handleExport}
                  className="text-sm text-blue-600 underline hover:text-blue-700"
                >
                  Export All to CSV
                </button>
              </div>

              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-[#F1F5F9] text-slate-600">
                    {TABLE_HEADERS.map((header) => (
                      <th
                        key={header}
                        className="px-4 py-3 font-semibold whitespace-nowrap"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results === null ? (
                    <tr>
                      <td
                        colSpan={TABLE_HEADERS.length}
                        className="px-4 py-12 text-center text-slate-500"
                      >
                        Click retrieve to get records
                      </td>
                    </tr>
                  ) : results.length === 0 ? (
                    <tr>
                      <td
                        colSpan={TABLE_HEADERS.length}
                        className="px-4 py-12 text-center text-slate-500"
                      >
                        No records found
                      </td>
                    </tr>
                  ) : (
                    pagedResults.map((inv, index) => (
                      <tr
                        key={inv.id}
                        className={`border-t border-[#E5E7EB] text-slate-700 ${
                          index % 2 === 1 ? "bg-[#F8FAFC]" : ""
                        }`}
                      >
                        <td className="px-4 py-3">{inv.id}</td>
                        <td className="px-4 py-3">
                          {isTooltip(inv.name) ? (
                            <Tooltip title={inv.name} placement="bottom">
                              <span className="cursor-default">
                                {inv.name.slice(0, 20)}...
                              </span>
                            </Tooltip>
                          ) : (
                            inv.name
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block rounded-full px-3 py-0.5 text-xs font-medium text-white ${
                              inv.status === "Active"
                                ? "bg-[#16A34A]"
                                : "bg-[#DC2626]"
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">{formatDob(inv.dateOfBirth)}</td>
                        <td className="px-4 py-3">{inv.postcode}</td>
                        <td className="px-4 py-3">
                          {activeAccountCount(inv) > 0 ? (
                            <Check size={18} className="text-green-600" />
                          ) : (
                            <X size={18} className="text-red-600" />
                          )}
                        </td>
                        <td className="px-4 py-3">{inv.email}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {results && results.length > 0 && (
                <div className="flex justify-end border-t border-[#E5E7EB] px-4 py-3">
                  <PaginationUI
                    page={page}
                    pageSize={pageSize}
                    total={results.length}
                    pageChange={(p: number) => setPage(p)}
                    recordChange={(ps: number) => setPageSize(ps)}
                  />
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {showConfirm && (
        <Dialog>
          <div className="w-[440px] rounded-lg bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900">Are you sure?</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {
                "You haven't entered any search criteria. Retrieving all investors may take a while due to the large volume of records."
              }
            </p>
            <p className="mt-3 text-sm text-slate-600">
              Do you want to continue with the search?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="h-10 rounded-md border border-[#D1D5DB] bg-white px-5 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmContinue}
                className="h-10 rounded-md bg-[#16172E] px-5 text-sm font-medium text-white transition-colors hover:bg-[#262844]"
              >
                Continue
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default Investors;
