
import { Header } from "@/components/layout/Header";
import { ResultsView } from "@/components/optimize/ResultsView";
import Head from "next/head";

export default function ResultsPage() {
  return (
    <>
      <Head>
        <title>Optimization Results - TailorMyResume AI</title>
        <meta name="description" content="View your AI-optimized resume with improvements and ATS compatibility score." />
      </Head>
      
      <div className="min-h-screen">
        <Header />
        <main className="container max-w-7xl py-16">
          <ResultsView />
        </main>
      </div>
    </>
  );
}
