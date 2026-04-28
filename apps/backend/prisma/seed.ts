import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { fakerFR as faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const CATEGORIES = ["ÉLECTRICITÉ", "MÉNAGE", "ARCHITECTURE", "TECH", "BIEN-ÊTRE", "PLOMBERIE"];

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
      city: 'Goma',
      isVerified: true,
      isActive: true,
    },
  });
  console.log(` Admin: ${admin.email}`);

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
      city: 'Goma',
      isVerified: true,
      isActive: true,
    },
  });
  console.log(` Provider: ${provider.email}`);

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
      city: 'Goma',
      isVerified: true,
      isActive: true,
    },
  });
  console.log(`✅ Client: ${client.email}`);

  // 4. SERVICES
  console.log('📦 Création des services...');
  
  // Supprimer les services existants pour faire un seed propre
  await prisma.service.deleteMany({});

  for (let i = 0; i < 12; i++) {
    const category = faker.helpers.arrayElement(CATEGORIES);
    const imageId = faker.helpers.arrayElement(CATEGORY_IMAGES[category]);
    
    await prisma.service.create({
      data: {
        title: faker.person.jobTitle() + " " + faker.company.catchPhraseAdjective(),
        description: faker.lorem.sentence(12),
        category: category,
        price: faker.number.int({ min: 10, max: 150 }),
        // @ts-ignore
        image: `https://images.unsplash.com/photo-${imageId}?auto=format&fit=crop&w=800&q=80`,
        providerId: provider.id,
        isActive: true,
      }
    });
  }

  console.log(' Seed terminé avec succès !');
}

main()
  .catch((e) => {
    console.error(' Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
