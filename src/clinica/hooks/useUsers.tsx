import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { getUsersAction } from "../actions/Users.action";



export const useUsers = () => {
  const [searchParams] = useSearchParams();

  const query = searchParams.get('query') || undefined;
  const limit = searchParams.get('limit') || 10;
  const page = searchParams.get('page') || 1;

  return useQuery({
    queryKey: ['users', { query, limit, page }],
    queryFn: () => getUsersAction({ query, limit, offset: (Number(page) - 1) * Number(limit) }),
    staleTime: 1000 * 60 * 10, // 10 minutes
  })

}