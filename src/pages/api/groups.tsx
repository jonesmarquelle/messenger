import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "../../server/db/client";

const groupsHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    const {
        body: {groupId, userId, groupName, groupIcon},
        method,
    } = req; 

    try {
        switch (method) {
            case 'GET':
                if (!groupId) {
                    return res.status(500).send({error: "Missing parameter: groupId"});
                }
                const group = await prisma.group.findUnique({
                    where: { id: Number.parseInt(groupId as string) },
                    include: { members: true },
                })

                if (group === null) {
                    return res.status(500).send({error: "Unable to find group"});
                }

                return res.status(200).send(group);

             case 'PUT':
                const missing = [];
                console.log(req);
                if (!userId) missing.push("userId");
                if (!groupName) missing.push("groupName");
                if (missing.length > 0) return res.status(500).send({error: `Missing parameters ${missing}`});

                const newGroup = await prisma.group.create({
                    data: {
                        name: groupName,
                        iconUrl: groupIcon,
                        members: {
                            connect:[
                                {
                                    id: userId
                                }
                            ]
                        }
                    }
                });

                return res.status(200).json(newGroup);

            default:
                res.setHeader('Allow', ['GET', 'PUT'])
                return res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch(e) {
        return res.status(500).send({error: e});
    }
};

export default groupsHandler;
