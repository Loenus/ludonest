import { FeatureSection } from "@/components/landing/feature-section";
import { GameMarquee } from "@/components/landing/game-marquee";
import { Hero } from "@/components/landing/hero";
import { PartnerCta } from "@/components/landing/partner-cta";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { getSession } from "@/lib/auth";

export default async function LandingPage() {
  const session = await getSession();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader session={session} />
      <main className="flex-1">
        <Hero session={session} />
        <GameMarquee />
        <FeatureSection />
        <PartnerCta />
      </main>
      <SiteFooter />
    </div>
  );
}
