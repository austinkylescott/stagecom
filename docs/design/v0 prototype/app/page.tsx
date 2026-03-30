import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { ProblemSection } from "@/components/problem-section"
import { SolutionSection } from "@/components/solution-section"
import { RoleSection } from "@/components/role-section"
import { ProductShowcase } from "@/components/product-showcase"
import { TrustSection } from "@/components/trust-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <RoleSection />
      <ProductShowcase />
      <TrustSection />
      <CTASection />
      <Footer />
    </main>
  )
}
