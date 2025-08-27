import { Dashboard } from "@/components/Dashboard";
import { getAllOrdersAction } from "@/server/actions/order";

export default async function DashboardPage() {
 
  return (
    <Dashboard orders={await getAllOrdersAction()} /> 
  )
}