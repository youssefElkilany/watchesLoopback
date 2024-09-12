import {belongsTo, Entity, hasOne, model, property} from '@loopback/repository';
import { Customer } from './customer.model';
import { OrderShipment } from './order-shipment.model';


export const orderStatus = {
  Active : "Active",
  Checkout:"Checkout",
  Shipment : "Shipment"
}

@model()
export class Order extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  // @property({
  //   type: 'number',
  //   required: true,
  // })
  @belongsTo(()=>Customer) // mkntsh 3yza tsht8l b hasOne w etsh8lt b belongTo
  customerId: number;

  @property({
    type: 'number',
    default: 0,
  })
  totalPrice?: number

  @property({
    type: 'date',
  })
  createdAt?: string;

  @property({
    type: 'date',
  })
  updatedAt?: string;

  @property({
    type: 'string',
    default: 'Active',
  })
  status?: string;

   @belongsTo(()=>OrderShipment)
  //@hasOne(() => OrderShipment)
  shipmentId?: number;


  constructor(data?: Partial<Order>) {
    super(data);
  }
}

export interface OrderRelations {
  // describe navigational properties here
}

export type OrderWithRelations = Order & OrderRelations;
