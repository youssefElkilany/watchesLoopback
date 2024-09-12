import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {WatchesecommerceDataSource} from '../datasources';
import {OrderLines, OrderLinesRelations} from '../models';

export class OrderLinesRepository extends DefaultCrudRepository<
  OrderLines,
  typeof OrderLines.prototype.id,
  OrderLinesRelations
> {
  constructor(
    @inject('datasources.watchesecommerce') dataSource: WatchesecommerceDataSource,
  ) {
    super(OrderLines, dataSource);
  }
}
