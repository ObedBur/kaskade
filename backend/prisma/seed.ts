import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import { fakerFR as faker } from '@faker-js/faker';

// Récupérez l'URL et créez l'adaptateur
const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });

// Passez l'adaptateur au constructeur (obligatoire en v7)
const prisma = new PrismaClient({ adapter });


const CATEGORY_IMAGES: Record<string, string[]> = {
  "ÉLECTRICITÉ": ["1621905230536-3e974249a002", "1581092921461-7d13c1f0163a"],
  "MÉNAGE": ["1584622650111-993a426fbf0a", "1527515637462-cff94eecc1ac"],
  "ARCHITECTURE": ["1486406146926-c627a92ad1ab", "1492321936769-b49830bc1d1e"],
  "TECH": ["1498050108023-c5249f4df085", "1517694712202-14dd9538aa97"],
  "BIEN-ÊTRE": ["1540555700478-4be289fbecef", "1512290923902-8a9f81dc2069"],
  "PLOMBERIE": ["1504148455328-497c77fd0525", "1607472586893-edb57bdc0e57"]
};

async function main() {
  console.log(' Début du seed complet...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. ADMIN
  const admin = await prisma.user.upsert({
    where: { email: 'kaskade@gmail.com' },
    update: {},
    create: {
      email: 'kaskade@gmail.com',
      password: passwordHash,
      fullName: 'Julian Thorne (Admin)',
      phone: '+243990000000',
      role: Role.ADMIN,
      quartier: 'Goma',
      isVerified: true,
      isActive: true,
    },
  });
  console.log(`✅ Admin: ${admin.email}`);

  // 2. PROVIDER
  const provider = await prisma.user.upsert({
    where: { email: 'provider@gmail.com' },
    update: {},
    create: {
      email: 'provider@gmail.com',
      password: passwordHash,
      fullName: 'Provider (Prestataire)',
      phone: '+243991111111',
      role: Role.PROVIDER,
      quartier: 'Goma',
      isVerified: true,
      isActive: true,
    },
  });
  console.log(`✅ Provider: ${provider.email}`);

  // 3. CLIENT
  const client = await prisma.user.upsert({
    where: { email: 'client@gmail.com' },
    update: {},
    create: {
      email: 'client@gmail.com',
      password: passwordHash,
      fullName: 'Client (Client)',
      phone: '+243992222222',
      role: Role.CLIENT,
      quartier: 'Goma',
      isVerified: true,
      isActive: true,
    },
  });
  console.log(`✅ Client: ${client.email}`);

  console.log('✅ Seed des utilisateurs terminé avec succès!');
}

main()
  .catch((e) => {
    console.error(' Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
