import { prisma } from '../lib/prisma';

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.log('Χρήση: npx tsx scripts/make-admin.ts email@example.com');
    process.exit(1);
  }

  const user = await prisma.user.update({
    where: { email },
    data: { role: 'admin' },
  });

  console.log('Ο χρήστης έγινε admin:', user.email);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());