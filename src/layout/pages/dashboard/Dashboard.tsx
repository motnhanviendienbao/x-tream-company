import NavBar from "../../../components/ui/NavBar";

const Dashboard = () => {
  return (
    <div className="flex h-screen w-full bg-[#EDEDED]">
      <NavBar />
      <main className="flex flex-1 items-center">
        <h1 className="px-20 text-2xl font-bold text-slate-900">
          Welcome to Xtreme Wealth
        </h1>
      </main>
    </div>
  );
};

export default Dashboard;
