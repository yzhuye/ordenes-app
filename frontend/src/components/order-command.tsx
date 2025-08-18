// Interfaz Command
export interface Command {
  execute(): void
}

// Receiver: Servicio que realiza la acción real
export class OrderService {
  createOrder(orderData: any) {
    // Aquí podrías hacer una petición a la API, guardar en localStorage, etc.
    console.log("Orden creada:", orderData)
  }
}

// Concrete Command
export class CreateOrderCommand implements Command {
  private receiver: OrderService
  private orderData: any

  constructor(receiver: OrderService, orderData: any) {
    this.receiver = receiver
    this.orderData = orderData
  }

  execute() {
    this.receiver.createOrder(this.orderData)
  }
}