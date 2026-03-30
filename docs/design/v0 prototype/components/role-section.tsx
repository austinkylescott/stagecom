"use client"

import { useState } from "react"
import { Building2, Megaphone, Theater, Check } from "lucide-react"

const roles = [
  {
    id: "managers",
    icon: Building2,
    title: "Theater Managers",
    subtitle: "Oversight without micromanagement",
    color: "stagecom-teal",
    benefits: [
      "See all upcoming shows and events at a glance",
      "Approve shows before they go public",
      "Assign staff and delegate responsibilities",
      "Maintain theater-level permissions and trust",
      "Track what&apos;s happening without chasing updates",
    ],
    quote: "Finally, I can see what&apos;s actually happening at my theater without asking five people.",
  },
  {
    id: "producers",
    icon: Megaphone,
    title: "Producers",
    subtitle: "Operational clarity, not chaos",
    color: "stagecom-gold",
    benefits: [
      "Create shows with clear ownership",
      "Build lineups with explicit cast management",
      "Send invitations and track responses",
      "Communicate show-day updates in one place",
      "Manage changes without endless follow-up",
    ],
    quote: "I used to spend hours coordinating across text, email, and DMs. Now it&apos;s all in one place.",
  },
  {
    id: "performers",
    icon: Theater,
    title: "Performers",
    subtitle: "Know when and where you perform",
    color: "stagecom-coral",
    benefits: [
      "See your upcoming shows and practices",
      "Accept or decline invitations clearly",
      "Find casting opportunities in your community",
      "Get show-day info when you need it",
      "Stay connected to your local scene",
    ],
    quote: "I actually know what shows I&apos;m in now. No more guessing or asking around.",
  },
]

export function RoleSection() {
  const [activeRole, setActiveRole] = useState("producers")

  const activeRoleData = roles.find((r) => r.id === activeRole)!

  return (
    <section id="roles" className="bg-stagecom-warm-gray py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <span className="mb-4 inline-block border-2 border-stagecom-black bg-stagecom-coral px-3 py-1 text-sm font-bold uppercase text-stagecom-black">
            For Your Role
          </span>
          <h2 className="font-[var(--font-display)] text-4xl font-black leading-tight text-stagecom-black md:text-5xl text-balance mx-auto max-w-3xl">
            Built for everyone in your community
          </h2>
          <p className="mt-4 mx-auto max-w-2xl text-lg text-stagecom-black/70 leading-relaxed">
            Different roles, different needs. Stagecom gives each person in your theater 
            exactly what they need to stay connected and effective.
          </p>
        </div>

        {/* Role Tabs */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {roles.map((role) => {
            const colorClasses = {
              "stagecom-teal": "bg-stagecom-teal",
              "stagecom-gold": "bg-stagecom-gold",
              "stagecom-coral": "bg-stagecom-coral",
            }
            
            return (
              <button
                key={role.id}
                onClick={() => setActiveRole(role.id)}
                className={`flex items-center gap-2 border-4 border-stagecom-black px-6 py-3 font-bold transition-all ${
                  activeRole === role.id
                    ? `${colorClasses[role.color as keyof typeof colorClasses]} shadow-[4px_4px_0px_0px_#2B2926] text-stagecom-black`
                    : "bg-stagecom-cream text-stagecom-black hover:bg-stagecom-black hover:text-stagecom-cream"
                }`}
              >
                <role.icon className="h-5 w-5" />
                <span className="hidden sm:inline">{role.title}</span>
                <span className="sm:hidden">{role.title.split(" ")[0]}</span>
              </button>
            )
          })}
        </div>

        {/* Active Role Content */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Benefits List */}
          <div className="border-4 border-stagecom-black bg-stagecom-cream p-8">
            <div className="mb-6">
              <h3 className="font-[var(--font-display)] text-2xl font-black text-stagecom-black md:text-3xl">
                {activeRoleData.title}
              </h3>
              <p className="text-stagecom-black/70">{activeRoleData.subtitle}</p>
            </div>

            <ul className="space-y-4">
              {activeRoleData.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border-2 border-stagecom-black ${
                    activeRoleData.color === "stagecom-teal" ? "bg-stagecom-teal" :
                    activeRoleData.color === "stagecom-gold" ? "bg-stagecom-gold" :
                    "bg-stagecom-coral"
                  }`}>
                    <Check className="h-4 w-4 text-stagecom-black" />
                  </div>
                  <span 
                    className="text-stagecom-black"
                    dangerouslySetInnerHTML={{ __html: benefit }}
                  />
                </li>
              ))}
            </ul>
          </div>

          {/* Quote Card */}
          <div className="relative">
            <div className={`absolute -right-2 -top-2 h-full w-full border-4 border-stagecom-black ${
              activeRoleData.color === "stagecom-teal" ? "bg-stagecom-teal" :
              activeRoleData.color === "stagecom-gold" ? "bg-stagecom-gold" :
              "bg-stagecom-coral"
            }`} />
            <div className="relative flex h-full flex-col justify-between border-4 border-stagecom-black bg-stagecom-black p-8">
              <div>
                <div className="mb-6 text-6xl font-black text-stagecom-cream/20">&ldquo;</div>
                <blockquote 
                  className="text-xl font-medium leading-relaxed text-stagecom-cream md:text-2xl"
                  dangerouslySetInnerHTML={{ __html: activeRoleData.quote }}
                />
              </div>
              <div className="mt-8 flex items-center gap-3">
                <div className={`h-12 w-12 border-2 border-stagecom-cream/30 ${
                  activeRoleData.color === "stagecom-teal" ? "bg-stagecom-teal" :
                  activeRoleData.color === "stagecom-gold" ? "bg-stagecom-gold" :
                  "bg-stagecom-coral"
                }`} />
                <div>
                  <div className="font-bold text-stagecom-cream">
                    {activeRoleData.title.replace("s", "")}
                  </div>
                  <div className="text-sm text-stagecom-cream/60">
                    Local Improv Theater
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contextual Roles Note */}
        <div className="mt-12 border-4 border-stagecom-black bg-stagecom-cream p-6 text-center">
          <p className="text-stagecom-black">
            <strong>Roles are contextual, not permanent.</strong> You can be a producer for one show 
            and a performer in another. Stagecom understands how improv communities actually work.
          </p>
        </div>
      </div>
    </section>
  )
}
