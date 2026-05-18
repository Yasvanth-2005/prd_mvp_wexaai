import { redirect } from "next/navigation";
import { AlertTriangle, Boxes, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiError } from "@/lib/api";
import { serverAuthApi, serverDashboardApi } from "@/lib/api-server";

export default async function DashboardPage() {
  try {
    const [{ organization }, summary] = await Promise.all([
      serverAuthApi.me(),
      serverDashboardApi.get(),
    ]);

    return (
      <div className="mx-auto max-w-6xl space-y-8 p-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Inventory overview for {organization.name}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total products
              </CardTitle>
              <Package className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">
                {summary.totalProducts.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Units in stock
              </CardTitle>
              <Boxes className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">
                {summary.totalQuantityOnHand.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-600" />
              <CardTitle>Low stock items</CardTitle>
            </div>
            <CardDescription>
              Products at or below their low-stock threshold
            </CardDescription>
          </CardHeader>
          <CardContent>
            {summary.lowStockItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No low stock items right now.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Qty on hand</TableHead>
                    <TableHead className="text-right">Threshold</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.lowStockItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="destructive">{item.quantityOnHand}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {item.lowStockThreshold}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      redirect("/login");
    }
    throw err;
  }
}
