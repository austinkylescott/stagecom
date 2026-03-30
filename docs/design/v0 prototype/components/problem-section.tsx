import { MessageSquare, Mail, Sheet, Smartphone, Hash, AlertCircle } from "lucide-react"

const problems = [
  {
    icon: Sheet,
    tool: "Spreadsheets",
    problem: "Lineup changes get lost in version chaos",
    detail: "Who updated it last? Is this the right one?",
  },
  {
    icon: Mail,
    tool: "Email threads",
    problem: "Critical show info buried in reply-alls",
    detail: "Scroll through 47 messages to find the call time",
  },
  {
    icon: Smartphone,
    tool: "Group texts",
    problem: "Performers miss key updates in the noise",
    detail: "Important details lost between memes",
  },
  {
    icon: Hash,
    tool: "Discord servers",
    problem: "Producers repeat themselves across channels",
    detail: "Did I post this in #shows or #announcements?",
  },
  {
    icon: MessageSquare,
    tool: "Social media DMs",
    problem: "Casting happens through personal contacts",
    detail: "Hope they check their messages this time",
  },
  {
    icon: AlertCircle,
    tool: "No single source",
    problem: "Theater managers have zero visibility",
    detail: "What shows are even happening this month?",
  },
]

export function ProblemSection() {
  return (
    <section className="bg-stagecom-black py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Section Header */}
        <div className="mb-16 max-w-3xl">
          <span className="mb-4 inline-block border-2 border-stagecom-gold bg-stagecom-gold px-3 py-1 text-sm font-bold uppercase text-stagecom-black">
            The Problem
          </span>
          <h2 className="font-[var(--font-display)] text-4xl font-black leading-tight text-stagecom-cream md:text-5xl text-balance">
            Running a show shouldn&apos;t require six different tools
          </h2>
          <p className="mt-4 text-lg text-stagecom-cream/70 leading-relaxed">
            Improv communities have been patching together solutions forever. 
            The result? Missed lineups, confused performers, and producers drowning in coordination.
          </p>
        </div>

        {/* Problem Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {problems.map((item, index) => (
            <div
              key={index}
              className="group border-2 border-stagecom-cream/20 bg-stagecom-black p-6 transition-all hover:border-stagecom-coral hover:bg-stagecom-cream/5"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border-2 border-stagecom-cream/30 text-stagecom-cream/60 group-hover:border-stagecom-coral group-hover:text-stagecom-coral transition-colors">
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold text-stagecom-cream/60 line-through decoration-stagecom-coral">
                  {item.tool}
                </span>
              </div>
              <h3 className="mb-2 font-bold text-stagecom-cream">
                {item.problem}
              </h3>
              <p className="text-sm text-stagecom-cream/50 italic">
                &ldquo;{item.detail}&rdquo;
              </p>
            </div>
          ))}
        </div>

        {/* Bottom Statement */}
        <div className="mt-16 border-t-2 border-stagecom-cream/20 pt-8">
          <p className="text-center text-xl font-semibold text-stagecom-cream md:text-2xl">
            There&apos;s no single, purpose-built tool that reflects how improv communities 
            <span className="text-stagecom-gold"> actually operate</span>.
          </p>
        </div>
      </div>
    </section>
  )
}
