import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section id="waitlist" className="relative bg-stagecom-black py-20 md:py-32 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 20px,
            #FDFCFB 20px,
            #FDFCFB 21px
          )`
        }} />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 text-center md:px-6">
        {/* Decorative Frame */}
        <div className="relative">
          <div className="absolute -inset-4 border-4 border-stagecom-gold md:-inset-8" />
          <div className="absolute -inset-2 border-4 border-stagecom-cream/20 md:-inset-6" />
          
          <div className="relative bg-stagecom-black p-8 md:p-12">
            {/* Status */}
            <div className="mb-6 inline-flex items-center gap-2 border-2 border-stagecom-cream/30 px-4 py-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-stagecom-teal opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-stagecom-teal"></span>
              </span>
              <span className="text-sm font-semibold text-stagecom-cream">
                Actively building with early partners
              </span>
            </div>

            {/* Headline */}
            <h2 className="font-[var(--font-display)] text-4xl font-black leading-tight text-stagecom-cream md:text-5xl lg:text-6xl text-balance">
              Ready to simplify your theater operations?
            </h2>
            
            <p className="mx-auto mt-6 max-w-xl text-lg text-stagecom-cream/70 leading-relaxed">
              Join the waitlist for early access. We&apos;re building Stagecom with 
              real theaters and communities, and we&apos;d love your input.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button 
                size="lg" 
                className="border-4 border-stagecom-cream bg-stagecom-gold text-stagecom-black hover:bg-stagecom-coral hover:text-stagecom-cream font-bold text-lg px-10 py-6"
              >
                Join the Waitlist
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-4 border-stagecom-cream bg-transparent text-stagecom-cream hover:bg-stagecom-cream hover:text-stagecom-black font-bold text-lg px-10 py-6"
              >
                Contact Us
              </Button>
            </div>

            {/* Trust Line */}
            <p className="mt-8 text-sm text-stagecom-cream/50">
              No spam. Just updates on what we&apos;re building for improv communities.
            </p>
          </div>
        </div>

        {/* Additional Links */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm">
          <a href="#" className="font-semibold text-stagecom-cream/70 hover:text-stagecom-gold transition-colors">
            For Theaters
          </a>
          <span className="text-stagecom-cream/30">|</span>
          <a href="#" className="font-semibold text-stagecom-cream/70 hover:text-stagecom-gold transition-colors">
            For Producers
          </a>
          <span className="text-stagecom-cream/30">|</span>
          <a href="#" className="font-semibold text-stagecom-cream/70 hover:text-stagecom-gold transition-colors">
            For Performers
          </a>
        </div>
      </div>
    </section>
  )
}
