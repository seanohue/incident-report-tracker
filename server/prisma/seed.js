import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create test users
  const player1 = await prisma.user.upsert({
    where: { email: 'alice.player@test.com' },
    update: {},
    create: {
      email: 'alice.player@test.com',
      name: 'Alice Player',
      role: 'Player',
      banned: false,
    },
  });

  const player2 = await prisma.user.upsert({
    where: { email: 'dave.player@test.com' },
    update: {},
    create: {
      email: 'dave.player@test.com',
      name: 'Dave Player',
      role: 'Player',
      banned: false,
    },
  });

  const moderator = await prisma.user.upsert({
    where: { email: 'bob.moderator@test.com' },
    update: {},
    create: {
      email: 'bob.moderator@test.com',
      name: 'Bob Moderator',
      role: 'Moderator',
      banned: false,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'charlie.admin@test.com' },
    update: {},
    create: {
      email: 'charlie.admin@test.com',
      name: 'Charlie Admin',
      role: 'Admin',
      banned: false,
    },
  });

  // Create some default report reasons
  const reasons = [
    'Inappropriate Communications',
    'Griefing',
    'Cheating',
    'Other',
  ];

  for (const textKey of reasons) {
    await prisma.reportReason.upsert({
      where: { textKey },
      update: {},
      create: { textKey },
    });
  }

  console.log('Created users:', { player1, player2, moderator, admin });
  console.log('Created report reasons:', reasons);
  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

