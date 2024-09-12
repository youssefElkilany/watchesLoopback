import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {WatchesecommerceDataSource} from '../datasources';
import {Watch, WatchRelations} from '../models';

export class WatchRepository extends DefaultCrudRepository<
  Watch,
  typeof Watch.prototype.id,
  WatchRelations
> {
  constructor(
    @inject('datasources.watchesecommerce') dataSource: WatchesecommerceDataSource,
  ) {
    super(Watch, dataSource);
  }
}
