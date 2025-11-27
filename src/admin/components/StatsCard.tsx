export const StatsCard = ({ label, count, icon: Icon, color, bg }: any) => (
   <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-4 shadow-sm">
      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${bg} ${color}`}>
         <Icon className="h-5 w-5" />
      </div>
      <div>
         <p className="text-2xl font-bold text-foreground">{count}</p>
         <p className="text-xs text-muted-foreground">{label}</p>
      </div>
   </div>
)
