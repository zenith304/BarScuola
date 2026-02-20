
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  log: ['warn', 'error'],
});

async function main() {
  // 1. Create Admin
  const adminEmail = 'admin@schoolbar.local';
  const password = 'Admin123!';
  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
    },
  });
  console.log('Admin created:', admin.email);

  // 2. Create Settings
  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      orderStartTime: '00:00',
      orderEndTime: '10:00',
      pickupStartTime: '12:00',
      pickupEndTime: '14:00',
      orderingEnabled: true,
    },
  });
  console.log('Settings initialized');

  // 3. Create Products
  const products = [
    { name: 'Panino al Prosciutto', category: 'Panini Semplici', priceCents: 150, description: 'Pane fresco con prosciutto cotto alta qualità', allergens: 'Glutine' },
    { name: 'Panino al Salame', category: 'Panini Semplici', priceCents: 150, description: 'Pane fresco con salame milano', allergens: 'Glutine' },
    { name: 'Panino alla Mortadella', category: 'Panini Semplici', priceCents: 150, description: 'Pane fresco con mortadella', allergens: 'Glutine' },
    { name: 'Panino al Formaggio', category: 'Panini Semplici', priceCents: 150, description: 'Pane fresco con formaggio', allergens: 'Glutine, Lattosio' },
    { name: 'Panino alla Bresaola', category: 'Panini Semplici', priceCents: 150, description: 'Pane fresco con bresaola', allergens: 'Glutine' },
    { name: 'Panino alla Pancetta', category: 'Panini Semplici', priceCents: 150, description: 'Pane fresco con pancetta', allergens: 'Glutine' },
    { name: 'Menu Cotoletta', category: 'Menu', priceCents: 300, description: 'Panino con la cotoletta', allergens: 'Glutine, Lattosio' },
    { name: 'Menu Pranzo', category: 'Menu', priceCents: 450, description: 'Scelta tra Barchetta/Panzerotti + bibita', allergens: 'Glutine' },
    { name: 'Hot-Dog', category: 'Altro', priceCents: 200, description: 'Hot-Dog', allergens: '' },
  ];

  for (const p of products) {
    await prisma.product.create({
      data: p,
    });
  }
  console.log(`Seeded ${products.length} products`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
