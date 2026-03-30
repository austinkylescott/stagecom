import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, Users, Sparkles } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-stagecom-cream">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 40px,
            #2B2926 40px,
            #2B2926 41px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 40px,
            #2B2926 40px,
            #2B2926 41px
          )`
        }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="flex flex-col gap-8">
            {/* Status Badge */}
            <div className="inline-flex w-fit items-center gap-2 border-2 border-stagecom-black bg-stagecom-warm-gray px-4 py-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-stagecom-teal opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-stagecom-teal"></span>
              </span>
              <span className="text-sm font-semibold text-stagecom-black">
                Building with the community
              </span>
            </div>

            {/* Main Headline */}
            <div className="flex flex-col gap-4">
              <h1 className="font-[var(--font-display)] text-5xl font-black leading-[1.1] tracking-tight text-stagecom-black md:text-6xl lg:text-7xl text-balance">
                A home for your improv community
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-stagecom-black/80 md:text-xl">
                The backstage system for your local scene. Run your theater together, 
                not across six different tools.
              </p>
            </div>

            {/* Problem Statement */}
            <div className="flex flex-wrap gap-2">
              {["Spreadsheets", "Email threads", "Group texts", "Discord", "Social media"].map((tool) => (
                <span 
                  key={tool}
                  className="border-2 border-stagecom-black/30 bg-transparent px-3 py-1 text-sm font-medium text-stagecom-black/60 line-through decoration-stagecom-coral decoration-2"
                >
                  {tool}
                </span>
              ))}
              <span className="border-2 border-stagecom-black bg-stagecom-teal px-3 py-1 text-sm font-bold text-stagecom-black">
                Stagecom
              </span>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button 
                size="lg" 
                className="border-4 border-stagecom-black bg-stagecom-gold text-stagecom-black hover:bg-stagecom-coral hover:text-stagecom-cream font-bold text-lg px-8 py-6"
              >
                Join the Waitlist
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-4 border-stagecom-black bg-transparent text-stagecom-black hover:bg-stagecom-black hover:text-stagecom-cream font-bold text-lg px-8 py-6"
              >
                Explore Features
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-stagecom-coral" />
                <span className="text-sm font-semibold text-stagecom-black">For performers</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-stagecom-teal" />
                <span className="text-sm font-semibold text-stagecom-black">For producers</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-stagecom-gold" />
                <span className="text-sm font-semibold text-stagecom-black">For theaters</span>
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative">
            {/* Main Card Stack */}
            <div className="relative">
              {/* Background decorative cards */}
              <div className="absolute -right-4 -top-4 h-full w-full border-4 border-stagecom-black bg-stagecom-coral" />
              <div className="absolute -right-2 -top-2 h-full w-full border-4 border-stagecom-black bg-stagecom-teal" />
              
              {/* Main Card */}
              <div className="relative border-4 border-stagecom-black bg-stagecom-cream p-6 md:p-8">
                {/* Mock UI Header */}
                <div className="mb-6 flex items-center justify-between border-b-2 border-stagecom-black pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 border-2 border-stagecom-black bg-stagecom-gold" />
                    <div>
                      <div className="font-bold text-stagecom-black">The Improv Theater</div>
                      <div className="text-sm text-stagecom-black/60">Tonight&apos;s Shows</div>
                    </div>
                  </div>
                  <span className="border-2 border-stagecom-black bg-stagecom-teal px-2 py-1 text-xs font-bold text-stagecom-black">
                    LIVE
                  </span>
                </div>

                {/* Mock Show Cards */}
                <div className="flex flex-col gap-4">
                  <ShowCard 
                    title="Friday Night Showcase"
                    time="8:00 PM"
                    cast={4}
                    status="confirmed"
                  />
                  <ShowCard 
                    title="Late Night Jam"
                    time="10:30 PM"
                    cast={6}
                    status="casting"
                  />
                  <ShowCard 
                    title="Weekend Workshop"
                    time="2:00 PM Sat"
                    cast={12}
                    status="pending"
                  />
                </div>

                {/* Mock Action Bar */}
                <div className="mt-6 flex gap-2">
                  <div className="flex-1 border-2 border-stagecom-black bg-stagecom-gold px-4 py-2 text-center text-sm font-bold text-stagecom-black">
                    Add Show
                  </div>
                  <div className="flex-1 border-2 border-stagecom-black bg-stagecom-warm-gray px-4 py-2 text-center text-sm font-bold text-stagecom-black">
                    View All
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -left-6 top-1/4 border-2 border-stagecom-black bg-stagecom-cream p-3 shadow-[4px_4px_0px_0px_#2B2926]">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-xs font-bold text-stagecom-black">Cast Confirmed</span>
              </div>
            </div>

            <div className="absolute -right-4 bottom-1/4 border-2 border-stagecom-black bg-stagecom-cream p-3 shadow-[4px_4px_0px_0px_#2B2926]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stagecom-black">+3 invites sent</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Border */}
      <div className="h-4 w-full bg-stagecom-black" />
    </section>
  )
}

function ShowCard({ 
  title, 
  time, 
  cast, 
  status 
}: { 
  title: string
  time: string
  cast: number
  status: "confirmed" | "casting" | "pending"
}) {
  const statusConfig = {
    confirmed: { bg: "bg-stagecom-teal", text: "Confirmed" },
    casting: { bg: "bg-stagecom-gold", text: "Casting" },
    pending: { bg: "bg-stagecom-warm-gray", text: "Pending" },
  }

  return (
    <div className="flex items-center justify-between border-2 border-stagecom-black p-3 hover:bg-stagecom-warm-gray transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center border-2 border-stagecom-black bg-stagecom-black text-xs font-bold text-stagecom-cream">
          {cast}
        </div>
        <div>
          <div className="font-semibold text-stagecom-black text-sm">{title}</div>
          <div className="text-xs text-stagecom-black/60">{time}</div>
        </div>
      </div>
      <span className={`${statusConfig[status].bg} border-2 border-stagecom-black px-2 py-0.5 text-xs font-bold text-stagecom-black`}>
        {statusConfig[status].text}
      </span>
    </div>
  )
}
