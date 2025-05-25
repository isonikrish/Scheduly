"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useApp } from "@/stores/useApp"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { format, parseISO, isValid, startOfWeek, endOfWeek } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Mic,
  Calendar as CalendarIcon
} from "lucide-react"
import { AppointmentType } from "@/lib/types"

export default function Dashboard() {
  const { user } = useApp()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  if (!user) return <div>Loading user data...</div>

  const appointments: AppointmentType[] = [
    ...(user.hostedAppointments ?? []),
    ...(user.attendingAppointments ?? []),
  ]

  const groupedByDate: Record<string, AppointmentType[]> = {}
  appointments.forEach((appt) => {
    if (!appt.date) return
    const date = parseISO(appt.date as string)
    if (!isValid(date)) return
    const key = format(date, "yyyy-MM-dd")
    if (!groupedByDate[key]) groupedByDate[key] = []
    groupedByDate[key].push(appt)
  })

  const today = new Date()
  const selectedKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null
  const appointmentsForSelectedDate = selectedKey
    ? groupedByDate[selectedKey] ?? []
    : appointments

  return (
    <main className="p-6 space-y-8">
      {/* Voice Command Section */}
      <Card className="bg-gradient-to-r from-blue-500/20 to-violet-500/20 border border-blue-500/30 backdrop-blur-xl p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full flex items-center justify-center">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Ready to schedule?</h3>
              <p className="text-sm text-blue-200">
                Try: "Schedule a meeting with John tomorrow at 2 PM"
              </p>
            </div>
          </div>
          <Link href="/dashboard/schedule">
            <Button className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white border-0">
              <Mic className="w-4 h-4 mr-2" />
              Start Voice Command
            </Button>
          </Link>
        </div>
      </Card>





      <Card className="bg-black/40 border-white/10 backdrop-blur-xl p-6 max-w-4xl mx-auto flex gap-10">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          initialFocus
        />
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-3">
            Appointments on{" "}
            {selectedDate ? format(selectedDate, "PPP") : "All Dates"}
          </h3>
          <div className="space-y-4">
            {appointmentsForSelectedDate.map((appt) => {
              const dateObj = appt.date ? parseISO(appt.date as string) : null
              return (
                <Card
                  key={appt.id}
                  className="border border-white/10 rounded-2xl p-4 hover:shadow-lg hover:border-white/20 transition-all"
                >
                  <CardContent className="flex items-start gap-4">
                    {appt?.attendee?.image && (
                      <img
                        src={appt.attendee.image}
                        alt={appt.attendee.name}
                        className="w-16 h-16 rounded-full object-cover border border-white/10"
                      />
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xl font-semibold text-white">{appt.agenda}</h4>
                        {appt.status && (
                          <Badge
                            className={`text-xs px-3 py-1 rounded-full mx-3 ${appt.status === "CONFIRMED"
                                ? "bg-green-600"
                                : appt.status === "CANCELLED"
                                  ? "bg-red-600"
                                  : "bg-yellow-600"
                              } text-white`}
                          >
                            {appt.status}
                          </Badge>
                        )}
                      </div>

                      <div className="text-sm text-gray-300 flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        {dateObj ? format(dateObj, "PPP") : "Unknown date"} ·{" "}
                        {dateObj ? format(dateObj, "p") : "Unknown time"}
                      </div>

                      <div className="text-sm text-gray-400">
                        <span className="font-medium text-white">Host:</span>{" "}
                        {appt?.host?.name}
                      </div>

                      <div className="text-sm text-gray-400">
                        <span className="font-medium text-white">Attendee:</span>{" "}
                        {appt?.attendee?.name}{" "}
                        <span className="text-gray-500">({appt?.attendee?.email})</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>


              )
            })}
          </div>

        </div>
      </Card>
    </main>
  )
}
