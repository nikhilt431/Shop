export const realtimeChannels = {
  job: (ticketNumber: string) => `repair-job:${ticketNumber}`,
  dashboard: "dashboard:operations",
  inventory: "inventory:stock"
};

export function createRealtimeEvent(type: string, payload: Record<string, unknown>) {
  return {
    type,
    payload,
    createdAt: new Date().toISOString()
  };
}
