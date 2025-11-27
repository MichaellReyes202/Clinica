import { useSearchParams } from 'react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { useEffect } from 'react';

interface Props {
   totalPages: number;
}

export const CustomPagination = ({ totalPages }: Props) => {
   const [searchParams, setSearchParams] = useSearchParams();

   const queryPage = searchParams.get('page') || '1';
   const currentPage = isNaN(+queryPage) ? 1 : +queryPage;

   // Validar que la página actual esté dentro de los límites
   useEffect(() => {
      if (totalPages === 0) return;

      // Si la página actual es mayor al total de páginas, redirigir a la última página
      if (currentPage > totalPages) {
         handlePageChange(totalPages);
      }

      // Si la página actual es menor a 1, redirigir a la primera página
      if (currentPage < 1) {
         handlePageChange(1);
      }
   }, [currentPage, totalPages]);

   const handlePageChange = (page: number) => {
      // Validar límites antes de cambiar
      if (page < 1 || page > totalPages || totalPages === 0) return;

      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('page', page.toString());
      setSearchParams(newSearchParams);
   };

   // Si no hay páginas, no mostrar la paginación
   if (totalPages === 0) return null;

   return (
      <div className="flex items-center justify-center gap-4">
         {/* Botón Anterior */}
         <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="gap-2"
         >
            <ChevronLeft className="h-4 w-4" />
            Anterior
         </Button>

         {/* Indicador de Página Actual */}
         <div className="flex items-center gap-2 px-4 py-2 rounded-md bg-muted/50 border border-border">
            <span className="text-sm font-medium text-muted-foreground">
               Página
            </span>
            <span className="text-sm font-bold text-foreground">
               {currentPage}
            </span>
            <span className="text-sm text-muted-foreground">
               de
            </span>
            <span className="text-sm font-bold text-foreground">
               {totalPages}
            </span>
         </div>

         {/* Botón Siguiente */}
         <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="gap-2"
         >
            Siguiente
            <ChevronRight className="h-4 w-4" />
         </Button>
      </div>
   );
};