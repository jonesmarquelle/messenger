import type { Message } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "../../server/db/client";

const messagesHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    const {
        body: {groupId, userId, message},
        method,
    } = req; 

    try {
        switch (method) {
            case 'GET':
                if (!groupId) {
                    return res.status(500).send({error: "Missing parameter: groupId"});
                }
                const messages: Message[] | undefined = (await prisma.group.findUnique({
                    where: { id: Number.parseInt(groupId as string) },
                    include: { messages: true },
                }))?.messages;
                if (messages === undefined) {
                    return res.status(500).send({error: "Unable to find messages"});
                }
                return res.status(200).send(messages);

             case 'PUT':
                const missing = [];
                console.log(req);
                if (!userId) missing.push("userId");
                if (!groupId) missing.push("groupId");
                if (!message) missing.push("message");
                if (missing.length > 0) return res.status(500).send({error: `Missing parameters ${missing}`});

                const newMessage = await prisma.message.create({
                    data: {
                        message: message as string,
                        group: {
                            connect: { id: Number.parseInt(groupId as string) }
                        },
                        sender: {
                            connect: { id: userId as string }
                        },
                    }
                });
                return res.status(200).json(newMessage);

            default:
                res.setHeader('Allow', ['GET', 'PUT'])
                return res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch(e) {
        return res.status(500).send({error: e});
    }
};

export default messagesHandler;
