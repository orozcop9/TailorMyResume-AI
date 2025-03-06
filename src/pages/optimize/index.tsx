
import { Header } from "@/components/layout/Header";
import { OptimizeForm } from "@/components/optimize/OptimizeForm";
import Head from "next/head";

export default function OptimizePage() {
  return (
    <>
      <Head>
        <title>Optimize Your Resume - TailorMyResume AI</title>
        <meta name="description" content="Upload your resume and job description to get an AI-optimized version that matches the job requirements." />
      </Head>
      
      <div className="min-h-screen">
        <Header />
        <main className="pt-16">
          <OptimizeForm />
        </main>
      </div>
    </>
  );
}
