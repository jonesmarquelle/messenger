import type { User } from '@prisma/client';
import useSWR from 'swr';

export function useUser (id: string) {
    const fetcher = (url: URL) => fetch(url).then((res) => res.json());
    const { data, error } = useSWR(`/api/users/?name=user&id=${id}`, fetcher)

    return {
        user: data,
        isLoading: !error && !data,
        isError: error
    }
}