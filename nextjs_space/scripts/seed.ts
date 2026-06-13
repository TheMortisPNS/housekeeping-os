import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Seed admin user
  const hashedPassword = await bcrypt.hash('malakia1', 10);
  await prisma.user.upsert({
    where: { email: 'panosbhtip1@gmail.com' },
    update: {password: hashedPassword },
    create: {
      email: 'panosbhtip1@gmail.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('Seed completed successfully');
}

main()
  .catch((e: any) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
