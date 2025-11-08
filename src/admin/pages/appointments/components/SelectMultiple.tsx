


// import { useState } from "react";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { toast } from "sonner";

// // import { MultiSelect } from "@/components/multi-select";
// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { MultiSelect } from "@/components/custom/multi-select";

// const FormSchema = z.object({
//   frameworks: z
//     .array(z.string())
//     .min(1, { message: "Please select at least one framework." }),
// });

// const frameworksList = [
//   { value: "next.js", label: "Next.js" },
//   { value: "react", label: "React" },
//   { value: "vue", label: "Vue.js" },
//   { value: "angular", label: "Angular" },
// ];

// export const SelectMultiple = () => {
//   // const form = useForm<z.infer<typeof FormSchema>>({
//   //   resolver: zodResolver(FormSchema),
//   //   defaultValues: {
//   //     frameworks: [],
//   //   },
//   // });

//   // function onSubmit(data: z.infer<typeof FormSchema>) {
//   //   toast.success(`Selected: ${data.frameworks.join(", ")}`);
//   // }

//   return (
//     <div>
//       <FormField
//         name="frameworks"
//         render={({ field }) => (
//           <FormItem>
//             <FormLabel>Select Frameworks</FormLabel>
//             <FormControl>
//               <MultiSelect
//                 options={frameworksList}
//                 value={field.value}
//                 onValueChange={field.onChange}
//                 placeholder="Choose frameworks..."
//               />
//             </FormControl>
//             <FormMessage />
//           </FormItem>
//         )}
//       />
//       <Button type="submit" >Submit</Button>
//     </div>
//   );
// }

import { useState } from "react";
import { MultiSelect } from "@/components/custom/multi-select";

const frameworksList = [
  { value: "next.js", label: "Next.js" },
  { value: "react", label: "React" },
  { value: "vue", label: "Vue.js" },
  { value: "angular", label: "Angular" },
];

export const SelectMultiple = () => {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <div className="space-y-3">
      <MultiSelect
        singleLine={false}
        hideSelectAll={true}
        options={frameworksList}
        value={selected}
        onValueChange={setSelected}
        placeholder="Choose frameworks..."
      />
      <p className="text-sm text-muted-foreground">Selected: {selected.join(", ")}</p>
    </div>
  );
};