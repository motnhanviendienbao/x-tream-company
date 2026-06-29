import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import NavBar from "../../../components/ui/NavBar";
import Drawer from "../../../components/ui/dialog/Drawer";
import AppRoutes from "../../../constants/AppRoutes";

const PRODUCT_TYPES = [
  { label: "Managed Fund", value: "managed-fund" },
  { label: "Term Deposit", value: "term-deposit" },
  { label: "Shares", value: "shares" },
  { label: "Superannuation", value: "superannuation" },
];

const NewInvestor = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  const [productType, setProductType] = useState("");
  const [showError, setShowError] = useState(false);

  const closeAndBack = () => {
    setOpen(false);
    // Đợi animation đóng rồi mới điều hướng về danh sách.
    setTimeout(() => navigate(AppRoutes.INVESTORS), 250);
  };

  const handleNext = () => {
    if (!productType) {
      setShowError(true);
      return;
    }
    setShowError(false);
    // Bước tiếp theo của wizard sẽ làm khi có UI màn hình kế tiếp.
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
            <span className="text-white">New Investor</span>
          </div>
          <h1 className="mt-3 text-3xl font-bold">New Investor</h1>
        </div>

        {/* Nội dung nền hiển thị phía sau drawer */}
        <div className="flex flex-col gap-6 px-10 py-6">
          <section className="rounded-md border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <h2 className="text-[15px] font-bold text-slate-900">
              Search Criteria
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-[13px] font-medium text-slate-600">
                  Label Name
                </label>
                <div className="relative">
                  <select
                    disabled
                    className="h-10 w-full appearance-none rounded-md border border-[#D1D5DB] bg-white px-3 pr-9 text-sm text-slate-400 outline-none"
                  >
                    <option>Placeholder</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>
              {["Label Name", "Label Name", "Label Name"].map((label, i) => (
                <div key={i}>
                  <label className="mb-1 block text-[13px] font-medium text-slate-600">
                    {label}
                  </label>
                  <input
                    disabled
                    className="h-10 w-full rounded-md border border-[#D1D5DB] bg-white px-3 text-sm outline-none"
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <div className="overflow-hidden rounded-md border border-[#E5E7EB]">
              <div className="flex justify-end border-b border-[#E5E7EB] px-4 py-2">
                <span className="text-sm text-blue-600 underline">
                  Export All to CSV
                </span>
              </div>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-[#F1F5F9] text-slate-600">
                    {["#", "Title", "Title", "Title", "Title"].map((h, i) => (
                      <th key={i} className="px-4 py-3 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-[#E5E7EB] text-slate-700">
                    <td className="px-4 py-3">000000001</td>
                    <td className="px-4 py-3">Cell Text</td>
                    <td className="px-4 py-3">Cell Texts</td>
                    <td className="px-4 py-3">Cell Texts</td>
                    <td className="px-4 py-3">Cell Texts</td>
                  </tr>
                </tbody>
              </table>
              <div className="flex items-center justify-between border-t border-[#E5E7EB] px-4 py-3 text-sm text-slate-500">
                <span>Rows per page: 10</span>
                <span>10 of 20</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Drawer open={open} title="Add New Investor" onClose={closeAndBack}>
        <div>
          {/* Product Type */}
          <label className="mb-1 flex items-center gap-1 text-[13px] font-medium text-slate-700">
            Product Type
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={productType}
              onChange={(e) => {
                setProductType(e.target.value);
                if (e.target.value) setShowError(false);
              }}
              className={`h-10 w-full appearance-none rounded-md border bg-white px-3 pr-9 text-sm outline-none transition-colors focus:border-slate-800 ${
                showError ? "border-[#E11D48]" : "border-[#D1D5DB]"
              } ${productType ? "text-slate-800" : "text-slate-400"}`}
            >
              <option value="" disabled>
                Select
              </option>
              {PRODUCT_TYPES.map((p) => (
                <option key={p.value} value={p.value} className="text-slate-800">
                  {p.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
          {showError && (
            <p className="mt-1 text-[12px] text-[#DC2626]">
              This field is required.
            </p>
          )}

          {/* Investor Type */}
          <div className="mt-5">
            <p className="text-[13px] font-medium text-slate-700">
              Investor Type
            </p>
            <p className="mt-1 text-sm text-slate-600">Individual</p>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={closeAndBack}
              className="h-10 rounded-md border border-[#D1D5DB] bg-white px-5 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="h-10 rounded-md bg-[#16172E] px-5 text-sm font-medium text-white transition-colors hover:bg-[#262844]"
            >
              Next
            </button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default NewInvestor;
