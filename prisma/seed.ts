import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();

async function main() {
    const testPasswordA = "passwordA";
    const testPasswordB = "passwordB";
    const testPasswordC = "passwordC";

    const hashedPasswordA = await bcrypt.hash(testPasswordA, 10);
    const hashedPasswordB = await bcrypt.hash(testPasswordB, 10);
    const hashedPasswordC = await bcrypt.hash(testPasswordC, 10);

    const testUserA = {
        username: 'testUserA',
        pwHash: hashedPasswordA,
        avatarUrl: 'https://thisisrnb.com/wp-content/uploads/2016/08/Frank-Ocean-green-hair.png'
    };

    const testUserB = {
        username: 'testUserB',
        pwHash: hashedPasswordB,
        avatarUrl: 'https://github.com/bbenip.png'
    };

    const testUserC = {
        username: 'Megan Thee Stallion',
        pwHash: hashedPasswordC,
        avatarUrl: 'https://i.imgur.com/AyJvxZ4.png'
    }

    const testGroupA = await prisma.group.upsert({
        where: { id: 0 },
        update: {},
        create: {
            name: 'Trade',
            iconUrl: 'https://github.com/bbenip.png',
            members: {
                create: [
                    {username: testUserA.username, pwHash: testUserA.pwHash, avatarUrl: testUserA.avatarUrl},
                    {username: testUserB.username, pwHash: testUserB.pwHash, avatarUrl: testUserB.avatarUrl},
                    {username: testUserC.username, pwHash: testUserC.pwHash, avatarUrl: testUserC.avatarUrl},
                ]
            }
        }
    });
    console.log(testGroupA);

    const testGroupB = await prisma.group.upsert({
        where: { id: 0 },
        update: {},
        create: {
            name: 'Baddies Inc.',
            iconUrl: 'https://i.imgur.com/AyJvxZ4.png',
            members: {
                connect: [
                    {username: testUserA.username},
                    {username: testUserC.username},
                ]
            }
        }
    });

    const outputTestUserA = await prisma.user.findUnique({
        where: {username: testUserA.username}
    });
    console.log(outputTestUserA);

    if (!outputTestUserA) { throw("Test User A not found"); }
    const testMessageA = await prisma.message.upsert({
        where: { messageId_groupId: {messageId: 0, groupId: 0} },
        update: {},
        create: {
            groupId: testGroupA.id,
            userId: outputTestUserA.id,
            senderName: outputTestUserA.username,
            message: "Let me in!"
        }
    });
    console.log(testMessageA);

    const outputTestUserB = await prisma.user.findUnique({
        where: {username: testUserB.username}
    });
    console.log(outputTestUserB);

    if (!outputTestUserB) { throw("Test User B not found"); }
    const testMessageB = await prisma.message.upsert({
        where: { messageId_groupId: {messageId: 0, groupId: 0} },
        update: {},
        create: {
            groupId: testGroupA.id,
            userId: outputTestUserB.id,
            senderName: outputTestUserB.username,
            message: "Let me out!"
        }
    })
    console.log(testMessageB);

    const outputTestUserC = await prisma.user.findUnique({
        where: {username: testUserC.username}
    });
    console.log(outputTestUserC);

    if (!outputTestUserC) { throw("Test User C not found"); }
    const testMessageC = await prisma.message.upsert({
        where: { messageId_groupId: {messageId: 0, groupId: 0} },
        update: {},
        create: {
            groupId: testGroupB.id,
            userId: outputTestUserC.id,
            senderName: outputTestUserC.username,
            message: "Ah"
        }
    })
    console.log(testMessageC);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit();
    });