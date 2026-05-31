import Hero from "@/components/landing/Hero";
import TrustScoreDemo from "@/components/landing/TrustScoreDemo";
import FeatureCards from "@/components/landing/FeatureCards";

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full">
      <Hero />
      <TrustScoreDemo />
      <FeatureCards />
    </div>
  );
}
