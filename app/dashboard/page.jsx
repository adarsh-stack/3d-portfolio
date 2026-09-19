import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getPortfolioData } from "../actions/portfolio";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  if (!session || session.value !== "authenticated") {
    redirect("/admin");
  }

  const portfolioData = await getPortfolioData();

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <DashboardClient initialData={portfolioData} />
    </div>
  );
}
