import {Entity, hasMany, model, property} from '@loopback/repository';
import { Watch } from './watch.model';
import { WatchCategory } from './watch-category.model';

@model()
export class Category extends Entity {
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
  type: string;

  @property({
    type: 'string',
  })
  description?: string;

  @property({
    type: 'boolean',
    default:false
  })
  isDeleted?: boolean;

  @hasMany(() => Watch, {through: {model: () => WatchCategory}})
  watches: Watch[];

  @property({
    type: 'date',
  })
  createdAt?: string;

  @property({
    type: 'date',
  })
  updatedAt?: string;

  constructor(data?: Partial<Category>) {
    super(data);
  }
}

export interface CategoryRelations {
  // describe navigational properties here
}

export type CategoryWithRelations = Category & CategoryRelations;
