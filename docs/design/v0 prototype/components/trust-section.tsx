import { Lock, Users, UserCheck, Building2, MessageSquareOff, Layers } from "lucide-react"

const principles = [
  {
    icon: Lock,
    title: "Privacy by Default",
    description: "Not everything should be public. Internal coordination happens safely within your theater.",
  },
  {
    icon: Layers,
    title: "Contextual Roles",
    description: "Be a producer for one show and a performer in another. Roles match reality, not rigid hierarchies.",
  },
  {
    icon: UserCheck,
    title: "Explicit Cast Membership",
    description: "People are only in a lineup when they are actually added. No ambiguity, no assumptions.",
  },
  {
    icon: Building2,
    title: "Theater Oversight",
    description: "Managers can see what&apos;s happening and approve shows without micromanaging every detail.",
  },
  {
    icon: MessageSquareOff,
    title: "Reduced Off-Platform Chaos",
    description: "Fewer side conversations, fewer missed updates, fewer unclear lineups. Everything in one place.",
  },
  {
    icon: Users,
    title: "Community-Centered",
    description: "Built for theaters, producers, and performers. Everyone in your community has a reason to be here.",
  },
]

export function TrustSection() {
  return (
    <section className="bg-stagecom-cream py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block border-2 border-stagecom-black bg-stagecom-black px-3 py-1 text-sm font-bold uppercase text-stagecom-cream">
            Our Principles
          </span>
          <h2 className="font-[var(--font-display)] text-4xl font-black leading-tight text-stagecom-black md:text-5xl text-balance mx-auto max-w-3xl">
            Built on how improv actually works
          </h2>
          <p className="mt-4 mx-auto max-w-2xl text-lg text-stagecom-black/70 leading-relaxed">
            These aren&apos;t just features. They&apos;re the beliefs that shape 
            every decision we make building Stagecom.
          </p>
        </div>

        {/* Principles Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {principles.map((principle, index) => (
            <div
              key={index}
              className="group border-4 border-stagecom-black bg-stagecom-warm-gray p-6 transition-all hover:bg-stagecom-black hover:shadow-[8px_8px_0px_0px_#EAA542]"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center border-2 border-stagecom-black bg-stagecom-cream group-hover:bg-stagecom-gold transition-colors">
                <principle.icon className="h-6 w-6 text-stagecom-black" />
              </div>
              <h3 className="mb-2 font-bold text-lg text-stagecom-black group-hover:text-stagecom-cream transition-colors">
                {principle.title}
              </h3>
              <p 
                className="text-sm text-stagecom-black/70 group-hover:text-stagecom-cream/70 transition-colors"
                dangerouslySetInnerHTML={{ __html: principle.description }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
