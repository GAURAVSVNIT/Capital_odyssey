import { prisma } from "@/lib/prisma";

export async function getEventState() {
  return prisma.eventState.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
}

export async function isEventEnded() {
  const state = await getEventState();
  return state.endedAt !== null;
}
