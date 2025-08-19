export interface Command {
  execute(): void
}

export class OrderService {
  async createOrder(dto: any) {
    try {
      const response = await fetch("http://localhost:3000/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      })

      if (!response.ok) {
        throw new Error(`Error al crear la orden: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Orden creada en backend:", data)
      return data
    } catch (error) {
      console.error("Error al crear orden:", error)
      throw error
    }
  }

  async deleteOrder(orderId: string) {
    try {
      const response = await fetch(`http://localhost:3000/orders/${orderId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Error al eliminar orden: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error al eliminar orden:", error)
      throw error
    }
  }
}

export class CreateOrderCommand implements Command {
  private receiver: OrderService
  private orderData: any

  constructor(receiver: OrderService, orderData: any) {
    this.receiver = receiver
    this.orderData = orderData
  }

  async execute() {
    return await this.receiver.createOrder(this.orderData)
  }
}

export class DeleteOrderCommand implements Command {
  private receiver: OrderService
  private orderId: string

  constructor(receiver: OrderService, orderId: string) {
    this.receiver = receiver
    this.orderId = orderId
  }

  async execute() {
    return await this.receiver.deleteOrder(this.orderId)
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