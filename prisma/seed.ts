
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
    { name: 'Panino al Prosciutto', category: 'Panini', priceCents: 350, description: 'Pane fresco con prosciutto cotto alta qualità', allergens: 'Glutine' },
    { name: 'Panino al Salame', category: 'Panini', priceCents: 350, description: 'Pane fresco con salame milano', allergens: 'Glutine' },
    { name: 'Focaccia Ligure', category: 'Panini', priceCents: 250, description: 'Focaccia classica all\'olio', allergens: 'Glutine' },
    { name: 'Menu Pizza', category: 'Menu', priceCents: 600, description: 'Trancio di pizza + bibita', allergens: 'Glutine, Lattosio' },
    { name: 'Menu Panino', category: 'Menu', priceCents: 550, description: 'Panino a scelta + bibita', allergens: 'Glutine' },
    { name: 'Coca Cola', category: 'Bevande', priceCents: 200, description: 'Lattina 33cl', allergens: '' },
    { name: 'Acqua Naturale', category: 'Bevande', priceCents: 100, description: 'Bottiglietta 50cl', allergens: '' },
    { name: 'Acqua Frizzante', category: 'Bevande', priceCents: 100, description: 'Bottiglietta 50cl', allergens: '' },
    { name: 'Kinder Bueno', category: 'Extra', priceCents: 150, description: 'Snack dolce', allergens: 'Lattosio, Nocciole, Glutine' },
    { name: 'Patatine', category: 'Extra', priceCents: 120, description: 'Sacchetto classico', allergens: '' },
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
