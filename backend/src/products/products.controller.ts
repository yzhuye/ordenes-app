// src/products/products.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import type { GetProductsQuery } from './products.service'; 

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query() query: any) { 
    const normalized: GetProductsQuery = {
      search: typeof query.search === 'string' ? query.search : undefined,
      active:
        typeof query.active === 'string'
          ? query.active.toLowerCase() === 'true'
          : undefined,
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
      orderBy: typeof query.orderBy === 'string' ? query.orderBy : undefined,
      order:
        query.order === 'asc' || query.order === 'desc' ? query.order : undefined,
    };

    return this.productsService.findAll(normalized);
  }
}
