import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from "@nestjs/common";
import { OrdersCommandBus } from "./commands/orders.command-bus";
import { OrderPrototypeService } from "./prototypes/prototype.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { DraftOrder } from "./prototypes/order.prototype";

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly commandBus: OrdersCommandBus,
    private readonly prototypeService: OrderPrototypeService,
  ) {}

  @Get()     
  list() { 
    return this.commandBus.listOrders(); 
  }
  
  @Get(':id') 
  findOne(@Param('id', ParseIntPipe) id: number) { 
    return this.commandBus.getOrder(id); 
  }
  
  @Post()    
  create(@Body() dto: CreateOrderDto) { 
    return this.commandBus.createOrder(dto); 
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.commandBus.deleteOrder(id);
  }

  @Get(':id/reorder')
  async createReorderDraft(@Param('id', ParseIntPipe) id: number): Promise<DraftOrder> {
    const prototype = await this.prototypeService.buildFromOrder(id);
    return prototype.clone({
      notes: null,
    });
  }

  // This endpoint allows customer to modify delivery address, add notes, change items, etc.
  @Post(':id/reorder-with-changes')
  async reorderWithChanges(
    @Param('id', ParseIntPipe) id: number,
    @Body() changes: Partial<DraftOrder>
  ): Promise<DraftOrder> {
    const prototype = await this.prototypeService.buildFromOrder(id);
    return prototype.clone(changes);
  }

  @Post(':id/reorder-now')
  async reorderImmediately(
    @Param('id', ParseIntPipe) id: number,
    @Body() changes?: Partial<DraftOrder>
  ) {
    const prototype = await this.prototypeService.buildFromOrder(id);
    const reorderDraft = prototype.clone(changes || { notes: null });
    
    const createDto: CreateOrderDto = {
      contactName: reorderDraft.contactName,
      contactEmail: reorderDraft.contactEmail,
      contactPhone: reorderDraft.contactPhone,
      country: reorderDraft.country,
      city: reorderDraft.city,
      zipCode: reorderDraft.zipCode,
      deliveryAddress: reorderDraft.deliveryAddress,
      notes: reorderDraft.notes || undefined,
      paymentMethod: reorderDraft.paymentMethod as any,
      items: reorderDraft.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      })),
      discountCode: reorderDraft.discountCode || undefined
    };
    
    return this.commandBus.createOrder(createDto);
  }

  @Post('validate-products')
  validateProducts(@Body() items: { productId: number; quantity: number }[]) {
    return this.commandBus.validateProducts(items);
  }

  @Get('validate-discount/:code')
  validateDiscount(@Param('code') code: string) {
    return this.commandBus.validateDiscount(code);
  }
}