import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();

async function main() { return; }

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit();
    });