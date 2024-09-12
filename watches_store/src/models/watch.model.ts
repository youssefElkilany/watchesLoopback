import {Entity, hasMany, model, property} from '@loopback/repository';
import { Category } from './category.model';
import { WatchCategory } from './watch-category.model';

// hnzwd ehna enum lel brands
@model()
export class Watch extends Entity {
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
  price: number;

  @property({
    type: 'number',
    default: 1,
  })
  quantity?: number;

  @property({
    type: 'string',
    required: true,
  })
  brand: string;

  @property({
    type: 'string',
    required: true,
  })
  model: string;

  @property({
    type: 'boolean',
    default:false
  })
  isDeleted?: boolean;

  @property({
    type: 'date',
  })
  createdAt?: string;

  @property({
    type: 'date',
  })
  updatedAt?: string;

  @hasMany(()=>Category,{through:{model:()=> WatchCategory}})
  categories?:Category[]


  constructor(data?: Partial<Watch>) {
    super(data);
  }
}

export interface WatchRelations {
  // describe navigational properties here
}

export type WatchWithRelations = Watch & WatchRelations;
