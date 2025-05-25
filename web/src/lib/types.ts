export type Availability = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
} & AddAvailabilityType
export type AppointmentType = {
  id: number;
  agenda: string;
  date: Date | string; // Use string to handle ISO date strings
  hostId: number;
  host: UserType;
  attendeeId: number;
  attendee: UserType;
  status: "SCHEDULED" | "CANCELLED" | "COMPLETED" | "CONFIRMED" | "RESCHEDULED";
  createdAt: Date;
  updatedAt: Date;
  duration: number;
};
export type AddAvailabilityType = {
  startTime: string;
  endTime: string;
  days: number[];
};

export type UserType = {
  id: number; 
  name: string;
  email: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
  availability: Availability;
  hostedAppointments: AppointmentType[];
  attendingAppointments: AppointmentType[];
};
export type UseAppType = {
  user: UserType | null;
  addAvailability: (data: {
    startTime: string;
    endTime: string;
    days: number[];
  }) => void;
  fetchUser: () => void;
  scheduleAppointment: (data: string) => void;
};
