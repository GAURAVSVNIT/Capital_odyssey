import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { STATIONS } from "../src/lib/constants";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  for (const station of STATIONS) {
    await prisma.station.upsert({
      where: { number: station.number },
      update: { name: station.name },
      create: station,
    });
  }

  const adminUsername = process.env.ADMIN_USERNAME ?? "admin";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "changeme123";
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { username: adminUsername },
    update: { passwordHash: adminPasswordHash, role: "ADMIN" },
    create: {
      username: adminUsername,
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  console.log(`Seeded ${STATIONS.length} stations and admin user "${adminUsername}".`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
