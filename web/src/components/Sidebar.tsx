"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Home,
  Plus,
  Timer
} from "lucide-react"
import Image from "next/image"
import { useSession } from "next-auth/react"

const sidebarItems = [
  { title: "Dashboard", icon: Home, url: "/dashboard" },
  { title: "Schedule", icon: Plus, url: "/dashboard/schedule" },
  { title: "Availability", icon: Timer, url: "/dashboard/availability" },
]

export default function SidebarComponent() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user

  return (
    <nav className="flex-1 p-4 py-10 space-y-2 w-64 h-screen bg-[#060606] border-r border-white/10 text-white flex flex-col z-40 justify-between">
      <div className="space-y-2">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.url
          return (
            <Link
              key={item.title}
              href={item.url}
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold"
                  : "hover:bg-white/10 text-white/80"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.title}</span>
            </Link>
          )
        })}
      </div>

      {user && (
        <div className="p-4 border-t border-white/10 flex items-center space-x-3">
          <Image
            src={user.image || ""}
            alt="User"
            height={40}
            width={40}
            className="rounded-full object-cover"
          />
          <div>
            <div className="font-medium text-white">{user.name}</div>
            <div className="text-sm text-gray-400 truncate max-w-[160px]">{user.email}</div>
          </div>
        </div>
      )}
    </nav>
  )
}
