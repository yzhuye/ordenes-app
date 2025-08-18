// Interfaz Command
export interface Command {
  execute(): void
}

export class OrderService {
  createOrder(orderData: any) {
    console.log("Orden creada:", orderData)
  }
}

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