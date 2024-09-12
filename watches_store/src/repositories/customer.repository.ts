import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import { Customer, CustomerRelations } from '../models';
import { WatchesecommerceDataSource } from '../datasources';
// import {WatchesecommerceDataSource} from '../datasources';
// import { WatchesecommerceDataSource } from '../DB/watches.datasource';
// import { Customer,CustomerRelations } from '../DB/models/customer.model';

export class CustomerRepository extends DefaultCrudRepository<
  Customer,
  typeof Customer.prototype.id,
  CustomerRelations
> {
  constructor(
    @inject('datasources.watchesecommerce') dataSource: WatchesecommerceDataSource,
  ) {
    super(Customer, dataSource);
  }
}
