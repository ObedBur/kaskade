import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed...');

  const passwordHash = await bcrypt.hash('admin123', 10);

  // Vérifier si kaskade@gmail.com existe déjà
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'kaskade@gmail.com' },
  });

  if (!existingAdmin) {
    const admin = await prisma.user.create({
      data: {
        email: 'kaskade@gmail.com',
        password: passwordHash,
        fullName: 'Julian Thorne (Admin)',
        phone: '+243990000000', // Un numéro factice pour satisfaire la contrainte @unique
        role: Role.ADMIN,
        city: 'Goma',
        isVerified: true,
        isActive: true,
      },
    });
    console.log(`✅ Compte admin créé avec succès : ${admin.email}`);
  } else {
    // S'il existe mais qu'il n'a pas le rôle Admin, on le met à jour
    if (existingAdmin.role !== Role.ADMIN) {
      await prisma.user.update({
        where: { email: 'kaskade@gmail.com' },
        data: { role: Role.ADMIN },
      });
      console.log(`✅ Compte ${existingAdmin.email} mis à jour avec le rôle ADMIN.`);
    } else {
      console.log(`ℹ️ Le compte ${existingAdmin.email} est déjà un ADMIN.`);
    }
  }

  console.log('✅ Seed terminé !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
