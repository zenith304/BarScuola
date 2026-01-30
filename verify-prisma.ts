import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Checking ShopOrder model...');
        // We don't need to actually query, just check if the property exists
        if ('shopOrder' in prisma) {
            console.log('SUCCESS: shopOrder property exists on prisma client.');
        } else {
            console.log('FAILURE: shopOrder property NOT found on prisma client.');
            console.log('Available models:', Object.keys(prisma).filter(k => !k.startsWith('$')));
        }
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
