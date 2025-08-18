import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersCommandBus } from './commands/orders.command-bus';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderPrototypeService } from './prototypes/prototype.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly commandBus: OrdersCommandBus,
    private readonly prototypeService: OrderPrototypeService,
  ) {}

  @Get()
  list() {
    return this.ordersService.findAll();
  }

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.commandBus.createOrder(dto);
  }

  // Duplicar: crea un borrador a partir de una orden existente (opcionalmente con overrides)
  @Post(':id/duplicate')
  async duplicate(
    @Param('id', ParseIntPipe) id: number,
    @Body() overrides?: Partial<CreateOrderDto>,
  ) {
    const proto = await this.prototypeService.buildFromOrder(id);
    const draft = proto.clone({
      ...overrides,
      // si quieres, limpia descuentos o fee por defecto:
      // discountId: null, discountAmount: 0, fee: 0
    });

    // Reutilizamos el caso de uso de creación
    return this.commandBus.createOrder({
      ...draft,
      // adapta tipos si es necesario:
      paymentMethod: draft.paymentMethod as any,
    });
  }
}
