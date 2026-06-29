import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import NavBar from "../../../components/ui/NavBar";
import AppRoutes from "../../../constants/AppRoutes";

type MenuItem = {
  label: string;
  route?: string;
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

const MENU_SECTIONS: MenuSection[] = [
  {
    title: "Party Maintenance",
    items: [
      { label: "Investors", route: AppRoutes.INVESTORS },
      { label: "Work Items", route: AppRoutes.WORK_ITEMS },
      { label: "Menu Item" },
      { label: "Menu Item" },
      { label: "Menu Item" },
      { label: "Menu Item" },
      { label: "Menu Item" },
      { label: "Menu Item" },
    ],
  },
];

const Menu = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filteredSections = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return MENU_SECTIONS;
    return MENU_SECTIONS.map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        item.label.toLowerCase().includes(keyword)
      ),
    })).filter((section) => section.items.length > 0);
  }, [search]);

  const handleItemClick = (item: MenuItem) => {
    if (item.route) navigate(item.route);
  };

  return (
    <div className="flex h-screen w-full bg-[#EDEDED]">
      <NavBar />

      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#D9D9D9] px-10 py-5">
          <h1 className="text-2xl font-bold text-slate-900">Menu</h1>
          <button
            type="button"
            onClick={() => navigate(AppRoutes.DASHBOARD)}
            className="text-slate-500 transition-colors hover:text-slate-900"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-[#D9D9D9] px-10 py-4">
          <div className="relative w-[300px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search menu items"
              className="h-9 w-full rounded-md border border-[#D9D9D9] bg-white pl-3 pr-9 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-800"
            />
            <Search
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>

        {/* Sections */}
        <div className="px-10 py-6">
          {filteredSections.length === 0 ? (
            <p className="text-sm text-slate-500">No menu items found.</p>
          ) : (
            filteredSections.map((section) => (
              <div
                key={section.title}
                className="rounded-md border border-[#E5E7EB] bg-white p-6 shadow-sm"
              >
                <h2 className="text-[15px] font-bold text-slate-900">
                  {section.title}
                </h2>
                <div className="mt-5 grid grid-cols-4 gap-x-6 gap-y-5">
                  {section.items.map((item, index) => (
                    <button
                      key={`${item.label}-${index}`}
                      type="button"
                      onClick={() => handleItemClick(item)}
                      className="w-fit text-left text-[13px] font-medium text-slate-700 transition-colors hover:text-slate-900 hover:underline"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Menu;
