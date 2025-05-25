export type UseAppType = {
    addAvailability: (data: {startTime: string; endTime: string; days: number[]}) => void;
}