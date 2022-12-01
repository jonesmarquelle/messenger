import { Group, User } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { DBGroupAction } from "..";

import { prisma } from "../../server/db/client";
import { getGroupByID, getMembersByGroupID, getUserById, getUserByName, GroupAndMembers, setGroupMembers } from "../../server/db/queries";

const groupsHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    const {
        query: { name, groupId },
        body: { action, userId, userName, groupName, groupIcon },
        method,
    } = req; 

    try {
        switch (method) {
            case 'GET':
                if (!groupId) return res.status(500).send({error: "Missing parameter: groupId"});

                switch(name) {
                    case 'group':
                        const group = await getGroupByID(Number.parseInt(groupId as string));
                        if (!group) return res.status(500).send({ error: "Group not found" });
                        return res.status(200).send(group);
                    case 'members':
                        const members = await getMembersByGroupID(Number.parseInt(groupId as string));
                        if (members === undefined) return res.status(500).send({ error: "Group members not found" });
                        return res.status(200).send(members);
                }

             case 'PUT':
                const missing = [];
                if (!action) return res.status(500).send({error: `Missing action parameter`});
                if (!userId && !userName) missing.push("userId and userName");
                if (!groupName && !groupId) missing.push("groupName and groupId");
                if (missing.length > 0) return res.status(500).send({error: `Missing parameters ${missing}`});

                switch (action) {
                    case DBGroupAction.create:
                        if (!userId || !groupName) return res.status(500).send({error: `Missing parameter userId or groupName`});
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

                    case DBGroupAction.removeMember:
                        if (!groupId) return res.status(500).send({error: `Missing parameter groupId`});
                        if (!userId) return res.status(500).send({error: `Missing parameter userId`});
                        const groupIdNum = Number.parseInt(groupId as string);
                        let newMembersIDs = (await getMembersByGroupID(groupIdNum) ?? []).map((user) => {return {id: user.id}});
                        newMembersIDs = newMembersIDs.filter((member) => {return member.id != userId});

                        const updatedGroup = await setGroupMembers(groupIdNum, newMembersIDs);
                        return res.status(200).json(updatedGroup);

                    case DBGroupAction.addMember:
                        if (!groupId) return res.status(500).send({error: `Missing parameter groupId`});
                        const gID = Number.parseInt(groupId as string);
                        const currentMembersIDs = (await getMembersByGroupID(gID) ?? []).map((user) => {return {id: user.id}});

                        let newMember;
                        if (userId) {
                            newMember = await getUserById(userId);
                        } else {
                            newMember = await getUserByName(userName); 
                        }
                        if (!newMember) return res.status(500).send({error: `User Not Found: ${{userId, userName}}`});

                        const newMemberList = [...currentMembersIDs, {id: newMember.id}]

                        const updateGroup = await setGroupMembers(gID, newMemberList)
                        return res.status(200).json(updateGroup);

                    default:
                        return res.status(500).send({error: `Invalid action: ${action}`});
                }
                

            default:
                res.setHeader('Allow', ['GET', 'PUT'])
                return res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch(e) {
        return res.status(500).send({error: e});
    }
};

export default groupsHandler;
