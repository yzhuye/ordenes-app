"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Truck, CheckCircle, TrendingUp, Clock, Plus } from "lucide-react"
import { NavLink } from "react-router-dom"

export function OrderDashboard() {
  const stats = [
    {
      title: "Total Órdenes",
      value: "1,234",
      change: "+12%",
      icon: ShoppingCart,
      color: "text-primary",
    },
    {
      title: "Pendientes",
      value: "89",
      change: "+5%",
      icon: Clock,
      color: "text-secondary",
    },
    {
      title: "En Tránsito",
      value: "156",
      change: "+8%",
      icon: Truck,
      color: "text-accent",
    },
    {
      title: "Completadas",
      value: "989",
      change: "+15%",
      icon: CheckCircle,
      color: "text-green-600",
    },
  ]

  const recentOrders = [
    {
      id: "ORD-001",
      customer: "María García",
      total: "$299.99",
      status: "pending",
      date: "2024-01-15",
    },
    {
      id: "ORD-002",
      customer: "Juan Pérez",
      total: "$156.50",
      status: "shipped",
      date: "2024-01-14",
    },
    {
      id: "ORD-003",
      customer: "Ana López",
      total: "$89.99",
      status: "delivered",
      date: "2024-01-13",
    },
  ]

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-secondary text-secondary-foreground",
      shipped: "bg-accent text-accent-foreground",
      delivered: "bg-green-100 text-green-800",
    }

    const labels = {
      pending: "Pendiente",
      shipped: "Enviado",
      delivered: "Entregado",
    }

    return <Badge className={variants[status as keyof typeof variants]}>{labels[status as keyof typeof labels]}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6">
        <h1 className="font-playfair text-3xl font-bold text-foreground mb-2">¡Bienvenido al Dashboard de Órdenes!</h1>
        <p className="text-muted-foreground text-lg">Gestiona y monitorea todas tus órdenes desde un solo lugar</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">{stat.change}</span>
                  <span className="text-muted-foreground">vs mes anterior</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Orders */}
      <div >
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle className="font-playfair">Órdenes Recientes</CardTitle>
              <CardDescription>Las últimas órdenes procesadas en el sistema</CardDescription>
            </div>
            
            <Button asChild className="w-flex" size="lg">
              <NavLink to="orders/create">
                <Plus className="h-5 w-5" />
                Crear Nueva Orden
              </NavLink>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium text-foreground">{order.id}</div>
                    <div className="text-sm text-muted-foreground">{order.customer}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-foreground">{order.total}</div>
                    {getStatusBadge(order.status)}
                  </div>
                </div>
              ))}
            </div>
              <Button asChild variant="outline" className="w-full mt-4 bg-transparent cursor-pointer">
                <NavLink to="/orders">Ver Todas las Órdenes</NavLink>
              </Button>
          </CardContent>
        </Card>

      
      </div>
    </div>
  )
}