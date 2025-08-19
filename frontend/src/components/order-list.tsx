"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Eye } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet"
import { OrderService, DeleteOrderCommand, CommandInvoker } from "./order-command"


export function OrderList() {
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const orderService = new OrderService()
  const invoker = new CommandInvoker()

  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await fetch("http://localhost:3000/orders")
      const data = await res.json()
      setOrders(data)
    } catch (error) {
      console.error("Error cargando órdenes:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      (order.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (String(order.id).toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (order.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleDeleteOrder = async (orderId: string) => {
    const command = new DeleteOrderCommand(orderService, orderId)
    await invoker.run(command)
    setOrders((prev) => prev.filter((order) => order.id !== orderId))
    console.log("Historial:", invoker.getHistory())
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-foreground">Lista de Órdenes</h1>
          <p className="text-muted-foreground">Gestiona y visualiza todas las órdenes del sistema</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Órdenes ({filteredOrders.length})</CardTitle>
              <CardDescription>Lista completa de órdenes</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Orden</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">Cargando órdenes...</TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{order.contactName}</TableCell>
                    <TableCell className="text-muted-foreground">{order.contactEmail}</TableCell>
                    <TableCell>{order.itemsCount}</TableCell>
                    <TableCell className="font-semibold">${Number(order.totalPrice).toLocaleString()}</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right flex gap-2 justify-end">
                      {/* Botón ver detalles */}
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2 mr-2"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                            Ver
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="w-[500px] sm:w-[600px]  p-6">
                          <SheetHeader>
                            <SheetTitle className="text-2xl font-bold">Orden #{selectedOrder?.id}</SheetTitle>
                            <SheetDescription className="text-muted-foreground">
                              Información completa de la orden seleccionada
                            </SheetDescription>
                          </SheetHeader>

                          {selectedOrder && (
                            <div className="space-y-6 mt-6">
                              {/* Cliente */}
                              <div className="space-y-1">
                                <h4 className="font-semibold text-lg">👤 Cliente</h4>
                                <p className="font-medium">{selectedOrder.contactName}</p>
                                <p className="text-sm text-muted-foreground">{selectedOrder.contactEmail}</p>
                                <p className="text-sm">{selectedOrder.contactPhone}</p>
                              </div>

                              <hr className="border-border" />

                              {/* Dirección */}
                              <div className="space-y-1">
                                <h4 className="font-semibold text-lg">📍 Dirección</h4>
                                <p>{selectedOrder.deliveryAddress}</p>
                                <p>{selectedOrder.city}, {selectedOrder.country}</p>
                                <p>{selectedOrder.zipCode}</p>
                              </div>

                              <hr className="border-border" />

                              {/* Pago */}
                              <div className="space-y-2">
                                <h4 className="font-semibold text-lg">💳 Pago</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <span className="text-muted-foreground">Método:</span>
                                  <span className="font-medium">{selectedOrder.paymentMethod}</span>

                                  <span className="text-muted-foreground">Subtotal:</span>
                                  <span>${Number(selectedOrder.subtotal).toLocaleString()}</span>

                                  <span className="text-muted-foreground">Envío:</span>
                                  <span>${Number(selectedOrder.fee).toLocaleString()}</span>

                                  <span className="font-semibold text-lg">Total:</span>
                                  <span className="font-bold text-primary text-lg">
                                    ${Number(selectedOrder.totalPrice).toLocaleString()}
                                  </span>
                                </div>
                              </div>

                              <hr className="border-border" />

                              {/* Fecha */}
                              <div>
                                <h4 className="font-semibold text-lg">🗓 Fecha</h4>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(selectedOrder.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          )}
                        </SheetContent>
                      </Sheet>

                      {/* Botón eliminar */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" className="gap-2" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar esta orden?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará la orden <strong>#{order.id}</strong>.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Volver</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteOrder(order.id)}>
                              Sí, eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
