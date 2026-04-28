require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { fakerFR: faker } = require('@faker-js/faker');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const CATEGORIES = ["ÉLECTRICITÉ", "MÉNAGE", "ARCHITECTURE", "TECH", "BIEN-ÊTRE", "PLOMBERIE"];

const CATEGORY_IMAGES = {
  "ÉLECTRICITÉ": ["1621905230536-3e974249a002", "1581092921461-7d13c1f0163a"],
  "MÉNAGE": ["1584622650111-993a426fbf0a", "1527515637462-cff94eecc1ac"],
  "ARCHITECTURE": ["1486406146926-c627a92ad1ab", "1492321936769-b49830bc1d1e"],
  "TECH": ["1498050108023-c5249f4df085", "1517694712202-14dd9538aa97"],
  "BIEN-ÊTRE": ["1540555700478-4be289fbecef", "1512290923902-8a9f81dc2069"],
  "PLOMBERIE": ["1504148455328-497c77fd0525", "1607472586893-edb57bdc0e57"]
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  const client = await pool.connect();
  console.log('Connexion PostgreSQL OK. DATABASE_URL:', process.env.DATABASE_URL ? 'definie' : 'MANQUANTE');

  try {
    const passwordHash = await bcrypt.hash('password123', 10);

    // 1. ADMIN
    await client.query(`
      INSERT INTO "User" (id, email, password, "fullName", phone, role, city, "isVerified", "isActive", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), $1, $2, $3, $4, 'ADMIN'::"Role", 'Goma', true, true, NOW(), NOW())
      ON CONFLICT (email) DO NOTHING
    `, ['kaskade@gmail.com', passwordHash, 'Julian Thorne (Admin)', '+243990000000']);
    console.log('Admin: kaskade@gmail.com');

    // 2. PROVIDER
    await client.query(`
      INSERT INTO "User" (id, email, password, "fullName", phone, role, city, "isVerified", "isActive", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), $1, $2, $3, $4, 'PROVIDER'::"Role", 'Goma', true, true, NOW(), NOW())
      ON CONFLICT (email) DO NOTHING
    `, ['provider@kaskade.com', passwordHash, 'Jean Dupont (Prestataire)', '+243991111111']);
    console.log('Provider: provider@kaskade.com');

    // 3. CLIENT
    await client.query(`
      INSERT INTO "User" (id, email, password, "fullName", phone, role, city, "isVerified", "isActive", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), $1, $2, $3, $4, 'CLIENT'::"Role", 'Goma', true, true, NOW(), NOW())
      ON CONFLICT (email) DO NOTHING
    `, ['client@kaskade.com', passwordHash, 'Alice Morelle (Client)', '+243992222222']);
    console.log('Client: client@kaskade.com');

    // Recuperer l'ID du provider
    const providerResult = await client.query(`SELECT id FROM "User" WHERE email = $1`, ['provider@kaskade.com']);
    const providerId = providerResult.rows[0].id;

    // 4. Supprimer les services existants
    await client.query(`DELETE FROM "Service"`);
    console.log('Services existants supprimes');

    // 5. Creer 12 services
    for (let i = 0; i < 12; i++) {
      const category = pick(CATEGORIES);
      const images = CATEGORY_IMAGES[category];
      const imageId = pick(images);
      const title = faker.person.jobTitle() + ' ' + faker.company.catchPhraseAdjective();
      const description = faker.lorem.sentence(12);
      const price = Math.floor(Math.random() * 140) + 10;
      const image = `https://images.unsplash.com/photo-${imageId}?auto=format&fit=crop&w=800&q=80`;

      await client.query(`
        INSERT INTO "Service" (id, title, description, category, price, image, "providerId", "isActive", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, true, NOW(), NOW())
      `, [title, description, category, price, image, providerId]);
    }

    console.log('12 services crees!');
    const count = await client.query(`SELECT COUNT(*) FROM "Service"`);
    console.log('Total services en DB:', count.rows[0].count);

    console.log('');
    console.log('=== Comptes de test ===');
    console.log('Admin:    kaskade@gmail.com    | password123');
    console.log('Provider: provider@kaskade.com | password123');
    console.log('Client:   client@kaskade.com   | password123');

  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => {
  console.error('Erreur seed:', e.message);
  process.exit(1);
});
