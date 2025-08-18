import { OrderDashboard } from "@/components/order-dashboard"
import { OrderList } from "@/components/order-list"
import { CreateOrderWizard } from "@/components/create-order-wizard"
import { OrderTracking } from "@/components/order-tracking"
import Layout from "./components/layout"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

export default function DashboardPage() {
  return (
    
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <OrderDashboard />
            </Layout>
          }
        />
        <Route
          path="/orders"
          element={
            <Layout>
              <OrderList />
            </Layout>
          }
        />
        <Route
          path="/orders/create"
          element={
            <Layout>
              <CreateOrderWizard />
            </Layout>
          }
        />
        <Route
          path="/tracking"
          element={
            <Layout>
              <OrderTracking />
            </Layout>
          }
        />
      </Routes>
    </Router>
  )
}

