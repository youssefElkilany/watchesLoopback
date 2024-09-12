import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {WatchesecommerceDataSource} from '../datasources';
import {WatchCategory, WatchCategoryRelations} from '../models';

export class WatchCategoryRepository extends DefaultCrudRepository<
  WatchCategory,
  typeof WatchCategory.prototype.id,
  WatchCategoryRelations
> {
  constructor(
    @inject('datasources.watchesecommerce') dataSource: WatchesecommerceDataSource,
  ) {
    super(WatchCategory, dataSource);
  }
}
