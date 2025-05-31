import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Association {
  id: string;
  name: string;
  amount: number;
}

interface AssociationsDonationsProps {
  associations: Association[];
}

export function AssociationsDonations({ associations }: AssociationsDonationsProps) {
  const sortedAssociations = [...associations].sort((a, b) => b.amount - a.amount);
  
  const totalAmount = associations.reduce((sum, assoc) => sum + assoc.amount, 0);
  
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-red-500",
    "bg-orange-500",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Associations soutenues</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sortedAssociations.map((association, index) => {
            const percentage = Math.round((association.amount / totalAmount) * 100);
            const colorClass = colors[index % colors.length];
            
            return (
              <div key={association.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{association.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {association.amount.toFixed(2)}€ ({percentage}%)
                  </div>
                </div>
                <Progress
                  value={percentage}
                  className="h-2"
                  indicatorClassName={colorClass}
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}