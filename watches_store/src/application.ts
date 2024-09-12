import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';
import { CustomerService } from './Modules/Customer/customerService/customer.service';
import { WatchesService } from './Modules/Watches/watchesService/watches.service';
import { CategoryService } from './Modules/Category/CategoryService/category.service';
import { OrderService } from './Modules/Order/orderService/order.service';
import { OrderLinesService } from './Modules/OrderLines/orderLinesService/orderLines.service';
// import { AuthMiddelware } from './Middelware/authentication';
import { WCategoryService } from './Modules/WatchCategory/watchCategoryService/wCategory.service';
import { AuthMiddleware } from './Middelware/authentication';
import { OrderShipmentService } from './Modules/Shipment/orderShipmentService/orderShipment.service';

export {ApplicationConfig};

export class WatchesStoreApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);
    
    this.middleware(AuthMiddleware);
    // lma b3mlha hena by3ml 3la application kolo
    //this.middleware(AuthMiddelware)

    this.bind('middleware.auth').toProvider(AuthMiddleware);
    this.bind('auth.user').toProvider(AuthMiddleware);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);
    
   // this.dataSource(WatchesecommerceDataSource) // to make datasource bounded to application

   this.service(CustomerService)
   // this.service(WatchesService)
  //  this.service(CategoryService)
  this.bind('services.CategoryService').toClass(CategoryService);
  this.bind('services.WatchesService').toClass(WatchesService);
  this.bind('services.OrderService').toClass(OrderService);
  this.bind('services.OrderLinesService').toClass(OrderLinesService);
  this.bind('services.WCategoryService').toClass(WCategoryService);
  this.bind('services.OrderShipmentService').toClass(OrderShipmentService);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['Modules/Customer' , 'Modules/Watches','Modules/Category','Modules/Order','Modules/OrderLines','Modules/WatchCategory','Modules/Shipment'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
}
