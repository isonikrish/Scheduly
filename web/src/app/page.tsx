import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mic, Sparkles } from "lucide-react";
import Link from "next/link";


export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F0F0F] via-[#1A1A1A] to-[#0F0F0F]">
      <Navbar />
        <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center space-y-8">
            <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 px-4 py-2 rounded-full hover:bg-violet-500/40 cursor-pointer" >
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Scheduling
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent leading-tight">
              Schedule with
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                Your Voice
              </span>
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              The future of appointment scheduling is here. Simply speak to our AI assistant and watch as your calendar
              organizes itself intelligently.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white border-0 px-8 py-6 text-lg"
                >
                  Start Scheduling
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        </div>
      </section>
    </div>
  );
}
