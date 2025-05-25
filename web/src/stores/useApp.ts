import {create } from "zustand"
import axios from 'axios'
import { toast } from "sonner";
import { UseAppType } from "@/lib/types";
export const useApp = create<UseAppType>((set) => ({
    user: null,
    addAvailability: async (data) =>{
        try {
            const res = await axios.post("/api/availability", data);
            if(res.status === 200){
                toast.success(res.data.msg);
            }

        } catch {
            toast.error("Failed to add availability");
        }
    },
    fetchUser: async () => {
        try {
            const res = await axios.get("/api/user");
            if(res.status === 200){
                set({user: res.data});
            } else {
                set({user: null});
            }
        } catch (error) {
            set({user: null});
        }
    }
}))