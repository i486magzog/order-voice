import { Dashboard } from "@/components/Dashboard";
import { getAllOrders } from "@/server/actions/order";

export default async function DashboardPage() {
 
  return (
    <Dashboard orders={await getAllOrders()} /> 
  )
}