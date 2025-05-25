"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Mic, MicOff, Send, User } from "lucide-react";
import { useApp } from "@/stores/useApp";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }

  interface SpeechRecognition extends EventTarget {
    lang: string;
    interimResults: boolean;
    continuous: boolean;
    start(): void;
    stop(): void;
    onresult: ((event: any) => void) | null;
    onerror: ((event: any) => void) | null;
    onend: (() => void) | null;
  }
}

const RecordUser = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [waveform, setWaveform] = useState<number[]>(new Array(20).fill(20));
  const [isLoading, setIsLoading] = useState(false);
  const { scheduleAppointment, fetchUser } = useApp()
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          setTranscript((prev) => prev + result[0].transcript + " ");
        } else {
          interimTranscript += result[0].transcript;
        }
      }
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
  }, []);

  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setWaveform(waveform.map(() => Math.floor(Math.random() * 100)));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isRecording]);

  const handleVoiceCommand = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setTranscript("");
      setIsEditing(false);
    }
    setIsRecording(!isRecording);
  };
  const handleSubmit = async () => {
    setIsLoading(true)
    await scheduleAppointment(transcript);
    await fetchUser();
    setIsLoading(false);
  }
  return (
    <Card className="w-full bg-black/40 border-white/10 backdrop-blur-xl p-6 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        {/* Mic Button */}
        <button
          onClick={handleVoiceCommand}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording
            ? "bg-gradient-to-r from-red-500 to-pink-500 shadow-lg shadow-red-500/25 scale-110"
            : "bg-gradient-to-r from-blue-500 to-violet-500 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105"
            }`}
        >
          {isRecording ? (
            <MicOff className="w-10 h-10 text-white animate-pulse" />
          ) : (
            <Mic className="w-10 h-10 text-white" />
          )}
        </button>

        {/* Waveform */}
        <div className="flex items-center justify-center space-x-1 h-16">
          {waveform.map((height, i) => (
            <div
              key={i}
              className={`w-1 bg-gradient-to-t from-blue-500 to-violet-500 rounded-full transition-all duration-150 ${isRecording ? "" : "opacity-30"
                }`}
              style={{ height: `${isRecording ? height : 20}%` }}
            />
          ))}
        </div>

        {/* Recording Status Text */}
        <div className="text-center">
          <p className="text-lg font-medium mb-2">
            {isRecording ? "Listening..." : "Ready to schedule"}
          </p>
          <p className="text-sm text-gray-400">
            {isRecording
              ? "Speak naturally about your appointment"
              : "Click the microphone and describe your meeting"}
          </p>
        </div>

        {/* Transcript Display */}
        {transcript && (
          <Card className="w-full bg-white/5 border-white/10 p-4">
            <div className="flex items-start space-x-3">
              <User className="w-5 h-5 text-blue-400 mt-0.5" />
              <div className="flex-1">
                {isEditing ? (
                  <textarea
                    className="w-full bg-transparent border border-white/20 rounded p-2 text-sm text-white"
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-gray-300">{transcript}</p>
                )}

                <div className="flex items-center space-x-2 mt-3">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-500 to-violet-500 text-white"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    title="Submit your appointment request"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin w-4 h-4 mr-2 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit
                      </>
                    )}

                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? "Done" : "Edit"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Suggested Commands */}
      <div className="pt-6">
        <p className="text-sm text-gray-400 mb-3">Try saying:</p>
        <div className="space-y-2">
          {[
            '"schedule an appointment with a John Doe tomorrow at 3:00 pm the agenda will be for product meeting"',
            '"Schedule a meeting with John tomorrow at 2 PM"',
            '"Book a 30-minute call with the team next Friday"',
            '"Set up a client presentation for next week"',
          ].map((command, index) => (
            <button
              key={index}
              className="block w-full text-left text-sm text-gray-300 hover:text-white p-2 rounded hover:bg-white/5 transition-colors"
            >
              {command}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default RecordUser;
