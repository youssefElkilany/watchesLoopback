import {injectable, /* inject, */ BindingScope} from '@loopback/core';
import { NULL, repository } from '@loopback/repository';
import { OrderRepository, OrderShipmentRepository } from '../../../repositories';
import { HttpErrors } from '@loopback/rest';

@injectable({scope: BindingScope.TRANSIENT})
export class OrderShipmentService {
  constructor(/* Add @inject to inject parameters */
    @repository(OrderShipmentRepository) public osR:OrderShipmentRepository,
    @repository(OrderRepository) public orderRepository:OrderRepository
  ) {}


  async getAllShipment(filter:any,customerId:number){


    let query = `SELECT * FROM \`order\` WHERE customerId = ? AND shipmentId IS NOT NULL `
    const getOrders = await this.orderRepository.execute(query,[customerId])
    // const getOrders = await this.orderRepository.find({where:{customerId,orderShipmentId:{not:null}}})
    if(getOrders.length <=0)
    {
        throw new HttpErrors.NotFound("no order shipments yet")
    }
    console.log({getOrders})
    let shipmetIds:any = []
    for(let i=0;i<getOrders.length;i++)
    {
        shipmetIds.push({id:getOrders[i].shipmentId})
    }
    console.log({shipmetIds})
    console.log({filter})
   const shipment = await this.osR.find({where:{or:shipmetIds},skip:filter.skip,limit:filter.limit,order:filter?.order})

    return {
shipment
    }
  }

  async getShipment(id:number,customerId:number){

    const query = `SELECT * FROM \`order\` WHERE customerId = ? AND shipmentId = ? `;

    const result = await this.orderRepository.execute(query, [customerId,id]);
    if (result.length === 0) {
      throw new HttpErrors.NotFound('No orders found with the given shipmentId');
    }

    const findShipment = await this.osR.findById(id)
    if(!findShipment)
    {
        throw new HttpErrors.NotFound("no shipment found")
    }
    return findShipment
  }

  /*
   * Add service methods here
   */
}
