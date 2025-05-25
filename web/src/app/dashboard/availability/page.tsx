"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/stores/useApp";
import { AddAvailabilityType } from "@/lib/types";

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const timeOptions = Array.from({ length: 24 }, (_, i) => `${i}`);


function Availability() {
  const { addAvailability, user } = useApp();
  const [data, setData] = useState<AddAvailabilityType>({
    startTime: user?.availability?.startTime || "",
    endTime: user?.availability?.endTime || "",
    days: user?.availability?.days ||  [0, 1, 2, 3, 4, 5, 6],
  });
  const [isLoading, setIsLoading] = useState(false);

  const toggleDay = (index: number) => {
    setData((prev) => ({
      ...prev,
      days: prev.days.includes(index)
        ? prev.days.filter((d) => d !== index)
        : [...prev.days, index],
    }));
  };
  const handleAddAvailability = async () => {
    setIsLoading(true);
    await addAvailability(data);
    setIsLoading(false);
  };
  return (
    <Card className="max-w-xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">
          Set Your Availability
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="startTime">Start Time</Label>
            <Select
              value={data.startTime.toString()}
              onValueChange={(value) => setData({ ...data, startTime: value })}
            >
              <SelectTrigger id="startTime">
                <SelectValue placeholder="Select hour" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}:00
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="endTime">End Time</Label>
            <Select
              value={data.endTime.toString()}
              onValueChange={(value) => setData({ ...data, endTime: value })}
            >
              <SelectTrigger id="endTime">
                <SelectValue placeholder="Select hour" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}:00
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block">Days of the Week</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {daysOfWeek.map((day, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Switch
                    checked={data.days.includes(index)}
                    onCheckedChange={() => toggleDay(index)}
                    id={`day-${index}`}
                  />
                  <Label htmlFor={`day-${index}`}>{day}</Label>
                </div>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            onClick={handleAddAvailability}
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add Availability"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default Availability;
