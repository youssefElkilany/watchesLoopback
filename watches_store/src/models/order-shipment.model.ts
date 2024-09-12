import {Entity, model, property} from '@loopback/repository';

@model()
export class OrderShipment extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  trackingNumber: string;

  @property({
    type: 'date',
  })
  createdAt?: string;

  @property({
    type: 'date',
  })
  updatedAt?: string;


  constructor(data?: Partial<OrderShipment>) {
    super(data);
  }
}

export interface OrderShipmentRelations {
  // describe navigational properties here
}

export type OrderShipmentWithRelations = OrderShipment & OrderShipmentRelations;
