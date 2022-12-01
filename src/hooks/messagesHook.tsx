import useSWR from 'swr';

export function useMessages (groupId: number|undefined) {
    const fetcher = (url: URL) => fetch(url).then((res) => res.json());
    const { data, mutate, error } = useSWR(`/api/messages/?groupId=${groupId}`, fetcher)

    return {
        messages: data,
        refreshMessages: mutate,
        isError: error
    }
}