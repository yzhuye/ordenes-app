import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PricingFactory } from './pricing/pricing.factory';
import { OrdersCommandBus } from './commands/orders.command-bus';
import { OrderPrototypeService } from './prototypes/prototype.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, PricingFactory, OrdersCommandBus, OrderPrototypeService],
  exports: [OrdersService, PricingFactory, OrdersCommandBus, OrderPrototypeService],
})
export class OrdersModule {}
