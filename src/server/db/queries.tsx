import type { Group, Message, User } from "@prisma/client";
import { prisma } from "../../server/db/client";

export type MessageWithSender = Message & { sender: User; }
export type GroupAndMembers = Group & { members: User[] }
export type GroupAndMessages = Group & {messages: Message[]}

export const getGroupByID = async (groupId: number) => {
    const group = await prisma.group.findUnique({
        where: { id: groupId },
        include: {
            members: true
        }
    });

    return group;
}

export const getUserById = async (userId: string) => {
const user = await prisma.user.findUnique({
    where: { id: userId },
});

return user;
}

export const getUserByName = async (userName: string) => {
    const user = await prisma.user.findFirst({
        where: { name: userName },
    });

    return user;
}

export const createNewMessageInGroup = async (message: string, userId: string, groupId: number) => { 
    const newMessage = await prisma.message.create({
        data: {
            message: message as string,
            group: {
                connect: { id: groupId }
            },
            sender: {
                connect: { id: userId }
            },
        }
    });

    return newMessage;
}

export const getMessagesByGroup = async (groupId: number) => {
    const messages: MessageWithSender[] = await prisma.message.findMany({
      where: { groupId: groupId },
      include: {sender: true}
    });
  
    return messages;
}

export const getMembersByGroupID = async (groupId: number) => {
    const members = await prisma.group.findUnique({
        where: { id: groupId },
        select: {
            members: true
        }
    })
    
    return members?.members;
}

//Returns groups + most recent message for each group
export const getGroupsByUserID = async (userId: string) => {
    const groups = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            groups: {
                include: { 
                    messages: {
                        orderBy: [{messageId: "desc"}],
                        take: 1
                    }
                }
            }
        }
    });

    return groups;
}

export const setGroupMembers = async (groupId: number, memberIds: {id: string}[] ) => {
    const updatedMembers = await prisma.group.update({
        where: { id: groupId },
        data: {
            members: {
                set: memberIds
            }
        },
        include: { members: { select: { name: true } } }
    });
}