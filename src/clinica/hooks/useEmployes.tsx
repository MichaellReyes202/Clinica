import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router"
import { getEmployeeAction } from "../actions/Employee.action";



export const useEmployes = () => {
  const [searchParams] = useSearchParams();

  const query = searchParams.get('query') || undefined;
  const limit = searchParams.get('limit') || 10;
  const page = searchParams.get('page') || 1;

  return useQuery({
    queryKey: ['employees', { query, limit, page }],
    queryFn: () => getEmployeeAction({ query, limit, offset: (Number(page) - 1) * Number(limit) }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}



// Después de que la petición POST/PUT de la especialidad sea exitosa
//queryClient.invalidateQueries({ queryKey: ['specialties'] });
// Y si es un nuevo empleado o una edición:
//queryClient.invalidateQueries({ queryKey: ['employees'] });

//Con esta refactorización, obtienes la optimización que necesitas para la paginación y el control granular sobre qué datos se actualizan.