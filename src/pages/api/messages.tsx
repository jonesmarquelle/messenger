import type { Message } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { DBMessageAction } from "..";

import { prisma } from "../../server/db/client";
import { createNewMessageInGroup, getMessagesByGroup, MessageWithSender } from "../../server/db/queries";

const messagesHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    const {
        query: { groupId },
        body: { action, userId, message },
        method,
    } = req; 

    try {
        switch (method) {
            case 'GET':
                if (!groupId) return res.status(500).send({error: "Missing parameter: groupId"});

                const messages: MessageWithSender[] = await getMessagesByGroup(Number.parseInt(groupId as string));
                
                if (messages === undefined) return res.status(500).send({error: "Unable to find messages"});

                return res.status(200).send(messages);

             case 'PUT':
                if (!action) return res.status(500).send({error: "Missing action parameter"});

                const missing = [];
                if (!groupId) missing.push("groupId");
                if (!userId) missing.push("userId");
                if (!message) missing.push("message");
                if (missing.length > 0) return res.status(500).send({error: `Missing parameters: ${missing}`});

                switch (action) {
                    case DBMessageAction.create:
                        const newMessage = await createNewMessageInGroup(message, userId, Number.parseInt(groupId as string))
                        return res.status(200).json(newMessage);
                    
                    default:
                        return res.status(500).send({error: `Invalid action: ${action}`})
                }

            default:
                res.setHeader('Allow', ['GET', 'PUT'])
                return res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch(e) {
        return res.status(500).send({error: e});
    }
};

export default messagesHandler;
