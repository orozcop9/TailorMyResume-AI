
import { Header } from "@/components/layout/Header";
import { PricingPlans } from "@/components/pricing/PricingPlans";
import Head from "next/head";

export default function PricingPage() {
  return (
    <>
      <Head>
        <title>Pricing - TailorMyResume AI</title>
        <meta name="description" content="Choose the perfect plan to optimize your resume with AI and increase your chances of landing your dream job." />
      </Head>
      
      <div className="min-h-screen">
        <Header />
        <main>
          <PricingPlans />
        </main>
      </div>
    </>
  );
}
