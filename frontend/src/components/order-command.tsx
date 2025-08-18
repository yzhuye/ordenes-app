// Interfaz Command
export interface Command {
  execute(): void
}

export class OrderService {
  createOrder(orderData: any) {
    console.log("Orden creada:", orderData)
  }

  cancelOrder(orderId: string) {
    console.log(`Orden ${orderId} cancelada`)
  }
}

export class CreateOrderCommand {
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

export class CancelOrderCommand implements Command {
  private receiver: OrderService
  private orderId: string

  constructor(receiver: OrderService, orderId: string) {
    this.receiver = receiver
    this.orderId = orderId
  }

  execute() {
    this.receiver.cancelOrder(this.orderId)
  }
}

export class CommandInvoker {
  private history: Command[] = []

  run(command: Command) {
    command.execute()
    this.history.push(command)
  }

  getHistory() {
    return this.history
  }
}