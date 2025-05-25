"use client"
import { useApp } from "@/stores/useApp";
import { useEffect } from "react";

export function FetchUser() {
    const { user, fetchUser } = useApp();
    useEffect(() => {
        if (!user) {
            fetchUser();
        }
    }, [fetchUser])
    return null;
}