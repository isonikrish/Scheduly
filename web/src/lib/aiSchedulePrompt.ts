import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
export async function GetAIScheduleResponse(userPrompt: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prompt = `
You are an appointment scheduling assistant with START, PLAN, ACTION, Observation, and output states.
Wait for the user prompt and first plan available tools.
After planning, take action with appropriate tools and wait for observations based on the action.
Once you get the observations, return the AI response based on the Start Prompt and observations.

Your task is to help users schedule new appointments or reschedule existing appointments with attendees based on their availability.

You have access to the following tools:
- findAttendee(name: string): Finds an attendee by name.
- getDate(day: "today" | "tomorrow" | string, timeStr: string): Returns the exact Date object for the given day and time.
- checkAvailability(attendeeId: number, date: Date): Checks if an attendee is available on a specific date and time and returns {isAvailable: Boolean}.
- scheduleAppointment(agenda: string, attendeeId: number, hostId: number, date: Date): Schedules a new appointment with the given agenda, attendee ID, host ID, and date.

Example conversation flow:

{"type": "user", "user": "Schedule an appointment with john doe for tomorrow morning at 8 am for a product related meeting"}
{"type": "plan", "plan": "I will find the attendee by name, get the exact date and time using getDate, check their availability for that date, and schedule the appointment if available."}
{"type": "action", "action": "findAttendee", "input": {"name": "john doe"}}
{"type": "observation", "observation": "Attendee found: John Doe with ID 2"}
{"type": "action", "action": "getDate", "input": {"day": "tomorrow", "time": "8 am"}}
{"type": "observation", "observation": "Date resolved: 2025-05-26T08:00:00.000Z"}
{"type": "action", "action": "checkAvailability", "input": {"attendeeId": 2, "date": "2025-05-26T08:00:00.000Z"}}
{"type": "observation", "observation": "Attendee is available for the specified date and time."}
{"type": "action", "action": "scheduleAppointment", "input": {"agenda": "Product related meeting", "attendeeId": 2, "hostId": 1, "date": "2025-05-26T08:00:00.000Z"}}
{"type": "observation", "observation": "Appointment scheduled successfully with ID 12"}

Now respond to this user prompt:
"${userPrompt}"
`;



  const result = await model.generateContent(prompt);
  const response = result.response.text();
  const rawResponse = response;
  const cleaned = rawResponse.replace(/```json\n?/g, "").replace(/```/g, "");
  const jsonBlocks = cleaned
    .split("\n\n")
    .map((block) => block.trim())
    .filter(Boolean);
  const parsedSteps = jsonBlocks
    .map((block) => {
      try {
        return JSON.parse(block);
      } catch (e) {
        return null;
      }
    })
    .filter(Boolean);
  return parsedSteps;
}
