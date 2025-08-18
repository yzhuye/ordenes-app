import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Min, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';

class OrderItemDto {
  @IsInt() @IsPositive()
  productId: number;

  @IsInt() @Min(1)
  quantity: number;

  @IsPositive()
  price: number;
}

export class CreateOrderDto {
  @IsString() @IsNotEmpty() contactName: string;
  @IsEmail()  contactEmail: string;
  @IsString() @IsNotEmpty() contactPhone: string;
  @IsString() @IsNotEmpty() country: string;
  @IsString() @IsNotEmpty() city: string;
  @IsString() @IsNotEmpty() zipCode: string;
  @IsString() @IsNotEmpty() deliveryAddress: string;
  @IsOptional() @IsString() notes?: string | null;

  @IsEnum(PaymentMethod) paymentMethod: PaymentMethod;

  @ValidateNested({ each: true }) @Type(() => OrderItemDto) @ArrayMinSize(1)
  items: OrderItemDto[];

  @IsOptional() @IsPositive() fee?: number;
  @IsOptional() @IsInt() discountId?: number | null;
  @IsOptional() @IsPositive() discountAmount?: number; // monto fijo; adapta si usas %
}
