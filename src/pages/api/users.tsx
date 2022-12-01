import { Group, Message } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getGroupsByUserID, getUserById } from "../../server/db/queries";

const usersHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    const {
        query: { name, id },
        method,
    } = req; 
        switch (method) {
            case 'GET':
                if (id === undefined) return res.status(500).send({ error: "Missing parameter: id" });

                switch (name) {
                    case 'user':
                        const user = await getUserById(id as string);
                        if (!user) return res.status(500).send({ error: "User not found" });
                        return res.status(200).send(user);

                    case 'groups':
                        const groups = await getGroupsByUserID(id as string);
                        if (groups === undefined || groups === null) return res.status(500).send({ error: "User groups not found" });
                        return res.status(200).send(groups.groups);
                }
                
            default:
                res.setHeader('Allow', ['GET', 'PUT'])
                return res.status(405).end(`Method ${method} Not Allowed`);
        }
    
}

export default usersHandler;