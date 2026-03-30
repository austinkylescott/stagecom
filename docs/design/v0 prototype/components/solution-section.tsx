import { 
  Users, 
  CalendarDays, 
  UserCheck, 
  Mail, 
  ListOrdered, 
  Shield, 
  Bell, 
  UserCircle, 
  Eye,
  Layers
} from "lucide-react"

const features = [
  {
    icon: Users,
    title: "Theater Membership",
    description: "Organize your community with clear roles and relationships",
    color: "stagecom-teal",
  },
  {
    icon: CalendarDays,
    title: "Show & Event Creation",
    description: "Schedule shows, practices, workshops, meetings, and auditions",
    color: "stagecom-gold",
  },
  {
    icon: UserCheck,
    title: "Explicit Cast Management",
    description: "People are only in a lineup when they are actually added",
    color: "stagecom-coral",
  },
  {
    icon: Mail,
    title: "Invitations & Responses",
    description: "Clear accept/decline flows with automatic tracking",
    color: "stagecom-teal",
  },
  {
    icon: ListOrdered,
    title: "Lineup & Rundown",
    description: "Program order that everyone can see and trust",
    color: "stagecom-gold",
  },
  {
    icon: Shield,
    title: "Review & Approval",
    description: "Theater oversight without micromanagement",
    color: "stagecom-coral",
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "In-app and email updates that actually matter",
    color: "stagecom-teal",
  },
  {
    icon: UserCircle,
    title: "Profiles",
    description: "Community participation and visibility for performers",
    color: "stagecom-gold",
  },
  {
    icon: Eye,
    title: "Casting Visibility",
    description: "Control who sees what with invite-only, theater, or public modes",
    color: "stagecom-coral",
  },
  {
    icon: Layers,
    title: "Contextual Roles",
    description: "Be a producer for one show and a performer in another",
    color: "stagecom-teal",
  },
]

export function SolutionSection() {
  return (
    <section id="features" className="bg-stagecom-cream py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block border-2 border-stagecom-black bg-stagecom-teal px-3 py-1 text-sm font-bold uppercase text-stagecom-black">
            The Solution
          </span>
          <h2 className="font-[var(--font-display)] text-4xl font-black leading-tight text-stagecom-black md:text-5xl text-balance mx-auto max-w-3xl">
            One platform for your entire improv community
          </h2>
          <p className="mt-4 mx-auto max-w-2xl text-lg text-stagecom-black/70 leading-relaxed">
            Stagecom centralizes everything your theater needs. From casting to show day, 
            keep your people connected.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>

        {/* Visual Separator */}
        <div className="mt-20 flex items-center justify-center gap-4">
          <div className="h-1 w-16 bg-stagecom-black" />
          <div className="h-3 w-3 rotate-45 border-2 border-stagecom-black bg-stagecom-gold" />
          <div className="h-1 w-16 bg-stagecom-black" />
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ feature, index }: { feature: typeof features[number]; index: number }) {
  const bgColors = {
    "stagecom-teal": "group-hover:bg-stagecom-teal",
    "stagecom-gold": "group-hover:bg-stagecom-gold",
    "stagecom-coral": "group-hover:bg-stagecom-coral",
  }
  
  const iconBgColors = {
    "stagecom-teal": "bg-stagecom-teal",
    "stagecom-gold": "bg-stagecom-gold",
    "stagecom-coral": "bg-stagecom-coral",
  }

  // Make first two cards larger
  const isLarge = index < 2

  return (
    <div
      className={`group border-4 border-stagecom-black bg-stagecom-warm-gray p-6 transition-all hover:shadow-[8px_8px_0px_0px_#2B2926] ${bgColors[feature.color as keyof typeof bgColors]} ${
        isLarge ? "sm:col-span-2 lg:col-span-2" : "lg:col-span-1"
      } ${index >= 2 && index < 5 ? "lg:col-span-1" : ""}`}
    >
      <div className={`mb-4 flex h-12 w-12 items-center justify-center border-2 border-stagecom-black ${iconBgColors[feature.color as keyof typeof iconBgColors]}`}>
        <feature.icon className="h-6 w-6 text-stagecom-black" />
      </div>
      <h3 className="mb-2 font-bold text-lg text-stagecom-black">
        {feature.title}
      </h3>
      <p className="text-sm text-stagecom-black/70 group-hover:text-stagecom-black/90">
        {feature.description}
      </p>
    </div>
  )
}
