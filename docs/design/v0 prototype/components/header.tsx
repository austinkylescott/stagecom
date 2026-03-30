"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b-4 border-stagecom-black bg-stagecom-cream">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex items-center">
            <span className="font-[var(--font-display)] text-2xl font-black tracking-tight text-stagecom-black uppercase">
              Stagecom
            </span>
            <span className="ml-2 border-2 border-stagecom-black bg-stagecom-gold px-2 py-0.5 text-xs font-bold uppercase text-stagecom-black">
              Beta
            </span>
          </div>
        </Link>
        
        <nav className="hidden items-center gap-6 md:flex">
          <Link 
            href="#features" 
            className="text-sm font-semibold text-stagecom-black hover:text-stagecom-coral transition-colors"
          >
            Features
          </Link>
          <Link 
            href="#roles" 
            className="text-sm font-semibold text-stagecom-black hover:text-stagecom-coral transition-colors"
          >
            For Your Role
          </Link>
          <Link 
            href="#product" 
            className="text-sm font-semibold text-stagecom-black hover:text-stagecom-coral transition-colors"
          >
            Product
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="hidden border-2 border-stagecom-black bg-transparent text-stagecom-black hover:bg-stagecom-black hover:text-stagecom-cream font-semibold sm:inline-flex"
          >
            Sign In
          </Button>
          <Button className="border-2 border-stagecom-black bg-stagecom-gold text-stagecom-black hover:bg-stagecom-coral hover:border-stagecom-coral hover:text-stagecom-cream font-bold">
            Join Waitlist
          </Button>
        </div>
      </div>
    </header>
  )
}
