import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

export type GetProductsQuery = {
  search?: string;
  active?: boolean;
  page?: number;  
  limit?: number;  
  orderBy?: keyof Prisma.ProductOrderByWithRelationInput; 
  order?: 'asc' | 'desc';
};

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(q: GetProductsQuery = {}) {
    const page  = Number(q.page)  > 0 ? Number(q.page)  : 1;
    const limit = Number(q.limit) > 0 ? Number(q.limit) : 20;
    const skip  = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};
    if (typeof q.active === 'boolean') where.isActive = q.active;
    if (q.search?.trim()) {
      where.OR = [
        { name:        { contains: q.search, mode: 'insensitive' } },
        { description: { contains: q.search, mode: 'insensitive' } },
      ];
    }

    const orderByField = q.orderBy ?? 'createdAt';
    const orderDir     = q.order ?? 'desc';

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderByField]: orderDir },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      pages: Math.max(1, Math.ceil(total / limit)),
    };
  }
}
