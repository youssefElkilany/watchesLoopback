import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {WatchesecommerceDataSource} from '../datasources';
import {Category, CategoryRelations} from '../models';

export class CategoryRepository extends DefaultCrudRepository<
  Category,
  typeof Category.prototype.id,
  CategoryRelations
> {
  constructor(
    @inject('datasources.watchesecommerce') dataSource: WatchesecommerceDataSource,
  ) {
    super(Category, dataSource);
  }
}
