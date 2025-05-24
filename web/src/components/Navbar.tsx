"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Sparkles } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
function Navbar() {
    const session = useSession();
    return (
        <nav className="border-b border-white/10 backdrop-blur-xl bg-black/10">
            <div className="max-w-7xl mx-auto px-3 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-violet-500 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold">Scheduly</span>
                    </div>

                    <div className="flex items-center space-x-4">
                        {session?.data?.user ? (
                            <div className="flex items-center gap-4">
                                <Button
                                    className=" hover:text-white"
                                    variant={"outline"} onClick={() => signOut()}>
                                    <LogOut />
                                </Button>
                                <Button className="text-gray-300 hover:text-white">
                                    Dashboard{" "}
                                </Button>
                            </div>
                        ) : (
                            <Button
                                className="text-gray-300 hover:text-white"
                                onClick={() => signIn()}>
                                Get Started{" "}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
