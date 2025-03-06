
import { Header } from "@/components/layout/Header";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import Head from "next/head";

export default function OnboardingPage() {
  return (
    <>
      <Head>
        <title>Get Started - TailorMyResume AI</title>
        <meta name="description" content="Start optimizing your resume with AI-powered tools and increase your chances of landing your dream job." />
      </Head>
      
      <div className="min-h-screen">
        <Header />
        <main className="pt-16">
          <OnboardingForm />
        </main>
      </div>
    </>
  );
}
