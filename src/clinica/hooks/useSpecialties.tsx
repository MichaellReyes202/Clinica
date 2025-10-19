import { useQuery } from "@tanstack/react-query"
import { getSpecialtiesAction, getSpecialtiesOption } from "../actions/Specialties.action"
import { useSearchParams } from "react-router"

export const useSpecialtiesOption = () => {
  return useQuery({
    queryKey: ["specialtiesOption"],
    queryFn: () => getSpecialtiesOption(),
    staleTime: 1000 * 60 * 60
  })
}

export const useSpecialties = () => {
  const [searchParams] = useSearchParams();

  const query = searchParams.get('query') || undefined;
  const limit = searchParams.get('limit') || 10;
  const page = searchParams.get('page') || 1;

  return useQuery({
    queryKey: ["specialties", { query, limit, page }],
    queryFn: () => getSpecialtiesAction({ query, limit, offset: (Number(page) - 1) * Number(limit) }),
    staleTime: 1000 * 60 * 60
  })
}