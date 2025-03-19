
import { Header } from "@/components/layout/Header";
import { ResultsView } from "@/components/optimize/ResultsView";
import Head from "next/head";
import { useRouter } from "next/router";

export default function ResultsPage() {
  const router = useRouter();
  const { originalContent, optimizedContent, improvements, keyChanges } = router.query;

  const decodedData = {
    originalContent: originalContent ? decodeURIComponent(originalContent as string) : "",
    optimizedContent: optimizedContent ? decodeURIComponent(optimizedContent as string) : "",
    improvements: improvements ? JSON.parse(decodeURIComponent(improvements as string)) : {},
    keyChanges: keyChanges ? JSON.parse(decodeURIComponent(keyChanges as string)) : []
  };

  return (
    <>
      <Head>
        <title>Optimization Results - TailorMyResume AI</title>
        <meta name="description" content="View your optimized resume results" />
      </Head>
      
      <div className="min-h-screen">
        <Header />
        <main className="container py-16">
          <ResultsView {...decodedData} />
        </main>
      </div>
    </>
  );
}
