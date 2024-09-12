import {belongsTo, Entity, model, property} from '@loopback/repository';
import { Category } from './category.model';
import { Watch } from './watch.model';

@model()
export class WatchCategory extends Entity {
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
  @belongsTo(()=>Watch)
  watchId: number;

  @belongsTo(()=>Category)
  categoryId: number;


  constructor(data?: Partial<WatchCategory>) {
    super(data);
  }
}

export interface WatchCategoryRelations {
  // describe navigational properties here
}

export type WatchCategoryWithRelations = WatchCategory & WatchCategoryRelations;
