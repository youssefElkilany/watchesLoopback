import {Entity, model, property} from '@loopback/repository';

@model()
export class OrderLines extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'number',
    required: true,
  })
  orderId: number;

  @property({
    type: 'number',
    required: true,
  })
  watchId: number;

  @property({
    type: 'number',
    required:true,
  })
  quantity: number;

  @property({
    type: 'number',
    //required: true,
  })
  totalPrice?: number;

  @property({
    type: 'date',
  })
  createdAt?: string;

  @property({
    type: 'date',
  })
  updatedAt?: string;


  constructor(data?: Partial<OrderLines>) {
    super(data);
  }
}

export interface OrderLinesRelations {
  // describe navigational properties here
}

export type OrderLinesWithRelations = OrderLines & OrderLinesRelations;
