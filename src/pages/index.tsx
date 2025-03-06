
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>TailorMyResume AI - Optimize Your Resume with AI</title>
        <meta name="description" content="AI-powered resume optimization tool that helps you tailor your resume to match job descriptions and pass ATS systems." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen">
        <Header />
        <main>
          <Hero />
          <Features />
        </main>
      </div>
    </>
  );
}
