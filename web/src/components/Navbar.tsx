"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { LogOut, Sparkles } from "lucide-react"
import { signIn, signOut, useSession } from "next-auth/react"
import Link from "next/link"

function Navbar() {
  const session = useSession()

  return (
   <nav className="w-full h-16 fixed top-0 left-0 z-50 border-b border-white/10 backdrop-blur-xl bg-black/10 text-white">

      <div className="max-w-screen-xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-violet-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">Scheduly</span>
          </Link>

          <div className="flex items-center space-x-4">
            {session?.data?.user ? (
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  className="hover:text-white text-gray-300"
                  onClick={() => signOut()}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
                <Link href="/dashboard">
                  <Button className="text-gray-300 hover:text-white">
                    Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <Button
                className="text-gray-300 hover:text-white"
                onClick={() => signIn()}
              >
                Get Started
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
