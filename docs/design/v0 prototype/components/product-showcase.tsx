import { Check, X, Clock, MoreHorizontal, Bell, ChevronRight } from "lucide-react"

export function ProductShowcase() {
  return (
    <section id="product" className="bg-stagecom-black py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block border-2 border-stagecom-gold bg-stagecom-gold px-3 py-1 text-sm font-bold uppercase text-stagecom-black">
            The Product
          </span>
          <h2 className="font-[var(--font-display)] text-4xl font-black leading-tight text-stagecom-cream md:text-5xl text-balance mx-auto max-w-3xl">
            See what Stagecom looks like in action
          </h2>
          <p className="mt-4 mx-auto max-w-2xl text-lg text-stagecom-cream/70 leading-relaxed">
            Clean, clear, and built for the real workflows of improv communities. 
            No learning curve, no intimidation.
          </p>
        </div>

        {/* Product UI Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Show Setup Screen */}
          <MockUICard
            title="Show Setup"
            subtitle="Clear ownership and casting controls"
            color="stagecom-teal"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-stagecom-black/10 pb-3">
                <div>
                  <div className="font-bold text-stagecom-black">Friday Night Showcase</div>
                  <div className="text-sm text-stagecom-black/60">Jan 24, 2026 at 8:00 PM</div>
                </div>
                <span className="border-2 border-stagecom-black bg-stagecom-teal px-2 py-1 text-xs font-bold text-stagecom-black">
                  Draft
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="border-2 border-stagecom-black/20 p-3">
                  <div className="text-xs font-semibold text-stagecom-black/60 uppercase">Producer</div>
                  <div className="font-medium text-stagecom-black">Alex Rivera</div>
                </div>
                <div className="border-2 border-stagecom-black/20 p-3">
                  <div className="text-xs font-semibold text-stagecom-black/60 uppercase">Casting</div>
                  <div className="font-medium text-stagecom-black">Theater Members</div>
                </div>
              </div>

              <div className="border-2 border-stagecom-black/20 p-3">
                <div className="text-xs font-semibold text-stagecom-black/60 uppercase mb-2">Cast Size</div>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 bg-stagecom-black/10">
                    <div className="h-full w-2/3 bg-stagecom-teal" />
                  </div>
                  <span className="text-sm font-bold text-stagecom-black">4-6 performers</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 border-2 border-stagecom-black bg-stagecom-gold py-2 text-sm font-bold text-stagecom-black">
                  Invite Cast
                </button>
                <button className="flex-1 border-2 border-stagecom-black bg-stagecom-cream py-2 text-sm font-bold text-stagecom-black">
                  Save Draft
                </button>
              </div>
            </div>
          </MockUICard>

          {/* Cast Invitation Flow */}
          <MockUICard
            title="Cast Invitations"
            subtitle="Track responses in real-time"
            color="stagecom-gold"
          >
            <div className="space-y-3">
              <InviteRow name="Jordan Lee" status="accepted" />
              <InviteRow name="Sam Chen" status="accepted" />
              <InviteRow name="Taylor Wright" status="pending" />
              <InviteRow name="Casey Morgan" status="declined" />
              <InviteRow name="Riley Park" status="pending" />
              
              <div className="mt-4 flex items-center justify-between border-t-2 border-stagecom-black/10 pt-3">
                <div className="text-sm text-stagecom-black/60">
                  <span className="font-bold text-stagecom-black">2</span> confirmed, <span className="font-bold text-stagecom-black">2</span> pending
                </div>
                <button className="border-2 border-stagecom-black bg-stagecom-cream px-3 py-1 text-xs font-bold text-stagecom-black">
                  Send Reminder
                </button>
              </div>
            </div>
          </MockUICard>

          {/* Lineup / Rundown */}
          <MockUICard
            title="Lineup Order"
            subtitle="Program everyone can trust"
            color="stagecom-coral"
          >
            <div className="space-y-2">
              <RundownRow position={1} name="Opening Harold" performers="Team A" time="8:00" />
              <RundownRow position={2} name="Musical Improv" performers="The Singers" time="8:25" />
              <RundownRow position={3} name="Scene Night" performers="Veterans" time="8:50" />
              <RundownRow position={4} name="Closing Set" performers="House Team" time="9:15" />
              
              <div className="mt-4 flex items-center gap-2 text-sm text-stagecom-black/60">
                <Clock className="h-4 w-4" />
                <span>Estimated runtime: 1h 30m</span>
              </div>
            </div>
          </MockUICard>

          {/* Review Queue */}
          <MockUICard
            title="Review Queue"
            subtitle="Theater approval workflow"
            color="stagecom-teal"
          >
            <div className="space-y-3">
              <ReviewItem 
                title="Saturday Night Special" 
                submitter="Pat Davis"
                status="needs-review"
              />
              <ReviewItem 
                title="Workshop: Scene Work 101" 
                submitter="Alex Rivera"
                status="approved"
              />
              <ReviewItem 
                title="Late Night Jam" 
                submitter="Jordan Lee"
                status="needs-review"
              />
              
              <div className="mt-4 border-t-2 border-stagecom-black/10 pt-3 text-center">
                <span className="text-sm text-stagecom-black/60">
                  <span className="font-bold text-stagecom-coral">2</span> items need review
                </span>
              </div>
            </div>
          </MockUICard>
        </div>

        {/* Notification Preview */}
        <div className="mt-8 border-4 border-stagecom-cream/20 bg-stagecom-black p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center border-2 border-stagecom-cream/30">
              <Bell className="h-5 w-5 text-stagecom-cream" />
            </div>
            <div>
              <div className="font-bold text-stagecom-cream">Real-time Notifications</div>
              <div className="text-sm text-stagecom-cream/60">In-app and email updates</div>
            </div>
          </div>
          
          <div className="grid gap-3 md:grid-cols-3">
            <NotificationBadge text="Jordan accepted your invite" type="success" />
            <NotificationBadge text="New show needs approval" type="action" />
            <NotificationBadge text="Reminder: Show in 2 hours" type="info" />
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-stagecom-cream/70 mb-4">
            Product screens are concept mockups. The real thing is being built right now.
          </p>
          <a 
            href="#waitlist" 
            className="inline-flex items-center gap-2 text-stagecom-gold font-bold hover:text-stagecom-coral transition-colors"
          >
            Follow the build
            <ChevronRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  )
}

function MockUICard({ 
  title, 
  subtitle, 
  color,
  children 
}: { 
  title: string
  subtitle: string
  color: "stagecom-teal" | "stagecom-gold" | "stagecom-coral"
  children: React.ReactNode
}) {
  const colorClasses = {
    "stagecom-teal": "bg-stagecom-teal",
    "stagecom-gold": "bg-stagecom-gold",
    "stagecom-coral": "bg-stagecom-coral",
  }

  return (
    <div className="border-4 border-stagecom-cream/20 bg-stagecom-cream">
      <div className={`${colorClasses[color]} border-b-4 border-stagecom-black px-4 py-3`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-stagecom-black">{title}</h3>
            <p className="text-sm text-stagecom-black/70">{subtitle}</p>
          </div>
          <MoreHorizontal className="h-5 w-5 text-stagecom-black/50" />
        </div>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  )
}

function InviteRow({ name, status }: { name: string; status: "accepted" | "pending" | "declined" }) {
  const statusConfig = {
    accepted: { icon: Check, bg: "bg-stagecom-teal", text: "Accepted" },
    pending: { icon: Clock, bg: "bg-stagecom-warm-gray", text: "Pending" },
    declined: { icon: X, bg: "bg-stagecom-coral", text: "Declined" },
  }

  const config = statusConfig[status]

  return (
    <div className="flex items-center justify-between border-2 border-stagecom-black/10 p-2">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 border-2 border-stagecom-black/20 bg-stagecom-warm-gray" />
        <span className="font-medium text-stagecom-black text-sm">{name}</span>
      </div>
      <div className={`flex items-center gap-1 ${config.bg} border-2 border-stagecom-black px-2 py-0.5`}>
        <config.icon className="h-3 w-3 text-stagecom-black" />
        <span className="text-xs font-bold text-stagecom-black">{config.text}</span>
      </div>
    </div>
  )
}

function RundownRow({ position, name, performers, time }: { position: number; name: string; performers: string; time: string }) {
  return (
    <div className="flex items-center gap-3 border-2 border-stagecom-black/10 p-2">
      <div className="flex h-8 w-8 items-center justify-center border-2 border-stagecom-black bg-stagecom-black text-sm font-bold text-stagecom-cream">
        {position}
      </div>
      <div className="flex-1">
        <div className="font-medium text-stagecom-black text-sm">{name}</div>
        <div className="text-xs text-stagecom-black/60">{performers}</div>
      </div>
      <div className="text-sm font-medium text-stagecom-black/70">{time}</div>
    </div>
  )
}

function ReviewItem({ title, submitter, status }: { title: string; submitter: string; status: "needs-review" | "approved" }) {
  return (
    <div className="flex items-center justify-between border-2 border-stagecom-black/10 p-3">
      <div>
        <div className="font-medium text-stagecom-black text-sm">{title}</div>
        <div className="text-xs text-stagecom-black/60">by {submitter}</div>
      </div>
      {status === "needs-review" ? (
        <div className="flex gap-1">
          <button className="border-2 border-stagecom-black bg-stagecom-teal px-2 py-1 text-xs font-bold text-stagecom-black">
            Approve
          </button>
          <button className="border-2 border-stagecom-black bg-stagecom-cream px-2 py-1 text-xs font-bold text-stagecom-black">
            Review
          </button>
        </div>
      ) : (
        <span className="border-2 border-stagecom-black bg-stagecom-teal px-2 py-1 text-xs font-bold text-stagecom-black">
          Approved
        </span>
      )}
    </div>
  )
}

function NotificationBadge({ text, type }: { text: string; type: "success" | "action" | "info" }) {
  const colors = {
    success: "border-stagecom-teal bg-stagecom-teal/10",
    action: "border-stagecom-coral bg-stagecom-coral/10",
    info: "border-stagecom-gold bg-stagecom-gold/10",
  }

  return (
    <div className={`border-2 ${colors[type]} px-3 py-2 text-sm text-stagecom-cream`}>
      {text}
    </div>
  )
}
