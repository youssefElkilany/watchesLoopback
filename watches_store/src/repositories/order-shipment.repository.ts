import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {WatchesecommerceDataSource} from '../datasources';
import {OrderShipment, OrderShipmentRelations} from '../models';

export class OrderShipmentRepository extends DefaultCrudRepository<
  OrderShipment,
  typeof OrderShipment.prototype.id,
  OrderShipmentRelations
> {
  constructor(
    @inject('datasources.watchesecommerce') dataSource: WatchesecommerceDataSource,
  ) {
    super(OrderShipment, dataSource);
  }
}
