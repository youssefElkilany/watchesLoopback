import {Entity, model, property} from '@loopback/repository';

export const roles = {
user : "user",
admin : "admin"
}


@model()
export class Customer extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
    unique:true
  })
  name: string;

  @property({
    type: 'string',
   default:'user'
  })
  role?: string;

  @property({
    type: 'date',
  })
  createdAt?: string;

  @property({
    type: 'date',
  })
  updatedAt?: string;

  @property({
    type: 'boolean',
    default:false
  })
  isDeleted?: boolean;



  constructor(data?: Partial<Customer>) {
    super(data);
  }
}

export interface CustomerRelations {
  // describe navigational properties here
}

export type CustomerWithRelations = Customer & CustomerRelations;
