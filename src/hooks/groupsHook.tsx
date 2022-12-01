import { Group } from "@prisma/client";
import useSWR from "swr";
import type { SidebarGroup } from "../components/Sidebar";
import { GroupAndMessages } from "../server/db/queries";

export function useGroups (userId: string) {
    const fetcher = (url: URL) => fetch(url).then((res) => res.json());
    const { data, error, mutate } = useSWR(`/api/users/?name=groups&id=${userId}`, fetcher)

    if (data) {
        const sidebarGroupList: SidebarGroup[] = data.map((group: GroupAndMessages) => {
            const newGroup: SidebarGroup = {
                id: group.id,
                name: group.name,
                iconUrl: group.iconUrl,
                lastMessage: group.messages?.[0]
            };
            return newGroup;
        });

        return {
            groups: sidebarGroupList,
            isLoading: !error && !data,
            isError: error,
            refreshGroups: mutate
        };
    }

    return {
        groups: data,
        isLoading: !error && !data,
        isError: error,
        refreshGroups: mutate
    }
}

export function useMembers(groupId: number|undefined) {
    const fetcher = (url: URL) => fetch(url).then((res) => res.json());
    const { data, error, mutate } = useSWR(`/api/groups/?name=members&groupId=${groupId}`, fetcher)

    return {
        members: data,
        isLoading: !error && !data,
        isError: error,
        refreshMembers: mutate
    }
}