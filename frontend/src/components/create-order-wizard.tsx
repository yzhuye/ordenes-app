import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, ShoppingCart, CreditCard, CheckCircle, Plus, Minus, ArrowRight, ArrowLeft } from "lucide-react"

// --- Estado y Tipos ---
interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
}

// --- INICIO: Lógica del Patrón Decorator para el Cálculo de Precios ---

// 1. Interfaz Component: Define la operación que será decorada.
interface PriceCalculator {
  calculate(items: OrderItem[]): number
}

// 2. Concrete Component: La implementación base de la operación (calcula el subtotal).
class BasePriceCalculator implements PriceCalculator {
  public calculate(items: OrderItem[]): number {
    if (!items || items.length === 0) {
      return 0
    }
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }
}

// 3. Decorator Base Class: Mantiene una referencia al objeto envuelto (el calculador que decora).
abstract class PriceDecorator implements PriceCalculator {
  protected wrappedCalculator: PriceCalculator

  constructor(calculator: PriceCalculator) {
    this.wrappedCalculator = calculator
  }

  // El decorador delega el trabajo principal al objeto que está envolviendo.
  public calculate(items: OrderItem[]): number {
    return this.wrappedCalculator.calculate(items)
  }
}

// 4. Concrete Decorators: Añaden funcionalidades específicas sobre el cálculo base.

// Decorador para añadir impuestos.
class TaxDecorator extends PriceDecorator {
  private taxRate: number

  constructor(calculator: PriceCalculator, taxRate: number) {
    super(calculator)
    this.taxRate = taxRate
  }

  public calculate(items: OrderItem[]): number {
    const basePrice = super.calculate(items)
    return basePrice * (1 + this.taxRate)
  }
}

// Decorador para añadir gastos de envío.
class ShippingDecorator extends PriceDecorator {
  private shippingFee: number

  constructor(calculator: PriceCalculator, fee: number) {
    super(calculator)
    this.shippingFee = fee
  }

  public calculate(items: OrderItem[]): number {
    const priceBeforeShipping = super.calculate(items)
    return priceBeforeShipping + this.shippingFee
  }
}

// Decorador para aplicar un descuento.
class DiscountDecorator extends PriceDecorator {
  private discountAmount: number

  constructor(calculator: PriceCalculator, discount: number) {
    super(calculator)
    this.discountAmount = discount
  }

  public calculate(items: OrderItem[]): number {
    const priceBeforeDiscount = super.calculate(items)
    // Asegura que el precio no sea negativo tras el descuento.
    return Math.max(0, priceBeforeDiscount - this.discountAmount)
  }
}

// --- FIN: Lógica del Patrón Decorator ---

export function CreateOrderWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [customerData, setCustomerData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState("")
  const [discountCode, setDiscountCode] = useState("") // Nuevo estado para el código de descuento

  const availableProducts = [
    { id: "1", name: "Laptop Gaming", price: 1299.99 },
    { id: "2", name: "Mouse Inalámbrico", price: 49.99 },
    { id: "3", name: "Teclado Mecánico", price: 129.99 },
    { id: "4", name: "Monitor 4K", price: 399.99 },
    { id: "5", name: "Auriculares", price: 79.99 },
  ]

  const steps = [
    { number: 1, title: "Cliente", icon: User, description: "Información del cliente" },
    { number: 2, title: "Productos", icon: ShoppingCart, description: "Seleccionar productos" },
    { number: 3, title: "Pago", icon: CreditCard, description: "Método de pago" },
    { number: 4, title: "Confirmación", icon: CheckCircle, description: "Revisar orden" },
  ]

  // Hook `useMemo` para construir y ejecutar la cadena de decoradores.
  // El cálculo solo se re-ejecuta si los items de la orden o el código de descuento cambian.
  const orderTotals = useMemo(() => {
    // 1. Empezamos con el calculador base (subtotal).
    const baseCalculator: PriceCalculator = new BasePriceCalculator()
    const subtotal = baseCalculator.calculate(orderItems)

    // 2. Aplicamos el decorador de impuestos.
    const taxRate = 0.16
    const calculatorWithTax = new TaxDecorator(baseCalculator, taxRate)
    const subtotalWithTax = calculatorWithTax.calculate(orderItems)
    
    // 3. Aplicamos el decorador de envío.
    const shippingFee = orderItems.length > 0 ? 15.00 : 0
    let calculatorWithShipping: PriceCalculator = new ShippingDecorator(calculatorWithTax, shippingFee)

    // 4. Aplicamos el decorador de descuento (condicionalmente).
    let finalCalculator: PriceCalculator = calculatorWithShipping
    let discountApplied = 0
    if (discountCode.toUpperCase() === "DESCUENTO20") {
      discountApplied = 20.00
      finalCalculator = new DiscountDecorator(finalCalculator, discountApplied)
    }

    const finalTotal = finalCalculator.calculate(orderItems)

    // Devolvemos un objeto con todos los valores desglosados para la UI.
    return {
      subtotal,
      tax: subtotalWithTax - subtotal,
      shipping: shippingFee,
      discount: discountApplied,
      finalTotal,
    }
  }, [orderItems, discountCode])

  const addProduct = (product: (typeof availableProducts)[0]) => {
    const existingItem = orderItems.find((item) => item.id === product.id)
    if (existingItem) {
      setOrderItems(
        orderItems.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)),
      )
    } else {
      setOrderItems([...orderItems, { ...product, quantity: 1 }])
    }
  }

  const updateQuantity = (id: string, change: number) => {
    setOrderItems(
      orderItems
        .map((item) => {
          if (item.id === id) {
            const newQuantity = Math.max(0, item.quantity + change)
            return newQuantity === 0 ? null : { ...item, quantity: newQuantity }
          }
          return item
        })
        .filter(Boolean) as OrderItem[],
    )
  }

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="pb-2" htmlFor="name">Nombre Completo</Label>
                <Input
                  id="name"
                  value={customerData.name}
                  onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                  placeholder="Ingresa el nombre del cliente"
                />
              </div>
              <div>
                <Label className="pb-2" htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerData.email}
                  onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                  placeholder="cliente@email.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="pb-2" htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={customerData.phone}
                  onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <Label className="pb-2" htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={customerData.address}
                  onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                  placeholder="Dirección completa de entrega"
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-4">Productos Disponibles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableProducts.map((product) => (
                  <Card key={product.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-2xl font-bold text-primary">${product.price}</p>
                      <Button onClick={() => addProduct(product)} className="w-full mt-2 cursor-pointer" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {orderItems.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-4">Productos Seleccionados</h3>
                <div className="space-y-3">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">${item.price} c/u</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, -1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="font-medium w-8 text-center">{item.quantity}</span>
                        <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                        <div className="font-semibold min-w-[80px] text-right">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg">Subtotal:</span>
                      <span className="font-bold text-xl text-primary">${orderTotals.subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label className="pb-3">Método de Pago</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un método de pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit">Tarjeta de Crédito</SelectItem>
                  <SelectItem value="debit">Tarjeta de Débito</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="transfer">Transferencia Bancaria</SelectItem>
                  <SelectItem value="cash">Efectivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="discount" className="pb-3">Código de Descuento</Label>
              <div className="flex gap-2">
                <Input
                  id="discount"
                  placeholder="Ej: DESCUENTO20"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className="uppercase"
                />
              </div>
              {orderTotals.discount > 0 && (
                <p className="text-sm text-green-600 mt-2">
                  ¡Descuento de ${orderTotals.discount.toFixed(2)} aplicado!
                </p>
              )}
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Resumen de Pago</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${orderTotals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Impuestos (16%):</span>
                    <span>${orderTotals.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío:</span>
                    <span>${orderTotals.shipping.toFixed(2)}</span>
                  </div>
                  {orderTotals.discount > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Descuento Aplicado:</span>
                      <span>-${orderTotals.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total a Pagar:</span>
                      <span className="text-primary">${orderTotals.finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="font-playfair text-2xl font-bold text-foreground mb-2">¡Orden Creada Exitosamente!</h3>
              <p className="text-muted-foreground">
                La orden ha sido procesada y se ha enviado una confirmación por email
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Resumen de la Orden</CardTitle>
                <CardDescription>Orden #ORD-{Date.now().toString().slice(-6)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Cliente:</h4>
                  <p>{customerData.name}</p>
                  <p className="text-sm text-muted-foreground">{customerData.email}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Productos ({orderItems.length}):</h4>
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.name} x{item.quantity}
                      </span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total Final:</span>
                    <span className="text-primary">${orderTotals.finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button className="flex-1">Ver Orden Completa</Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                Crear Nueva Orden
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-playfair text-3xl font-bold text-foreground">Crear Nueva Orden</h1>
        <p className="text-muted-foreground">Sigue los pasos para crear una orden completa</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.number
              const isCompleted = currentStep > step.number

              return (
                <div key={step.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                      w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors
                      ${
                        isActive
                          ? "bg-primary text-primary-foreground border-primary"
                          : isCompleted
                            ? "bg-green-600 text-white border-green-600"
                            : "bg-muted text-muted-foreground border-border"
                      }
                    `}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="mt-2 text-center">
                      <div className={`font-medium text-sm ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-muted-foreground">{step.description}</div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`
                      flex-1 h-0.5 mx-4 transition-colors
                      ${isCompleted ? "bg-green-600" : "bg-border"}
                    `}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-playfair">
            Paso {currentStep}: {steps[currentStep - 1].title}
          </CardTitle>
          <CardDescription>{steps[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>{renderStepContent()}</CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep} disabled={currentStep === 1} className="gap-2 bg-transparent cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
          Anterior
        </Button>

        <Button onClick={nextStep} disabled={currentStep === 4} className="gap-2 cursor-pointer">
          {currentStep === 3 ? "Crear Orden" : "Siguiente"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
