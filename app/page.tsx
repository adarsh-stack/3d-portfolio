// import {getPortfolioData}
import { getPortfolioData } from '../app/actions/portfolio.js';
import PortfolioClient from '../app/PortfolioClient';

export default async function MainPortfolioPage() {
  // Fetch all data from MongoDB via your updated server action
  const initialData = await getPortfolioData();

  return (
    <main className="bg-[#151b23] min-h-screen text-slate-200 font-sans overflow-hidden">
      <PortfolioClient initialData={initialData} />
    </main>
  );
}