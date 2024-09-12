import {injectable, /* inject, */ BindingScope} from '@loopback/core';
import { repository } from '@loopback/repository';
import { OrderLinesRepository, OrderRepository, OrderShipmentRepository, WatchRepository } from '../../../repositories';
import { HttpErrors } from '@loopback/rest';
import { Order, OrderLines, orderStatus, Watch } from '../../../models';
import shortid from 'shortid';

@injectable({scope: BindingScope.TRANSIENT})
export class OrderService {
  constructor(/* Add @inject to inject parameters */
    @repository(OrderRepository) public orderRepository:OrderRepository,
    @repository(OrderLinesRepository) public oLR:OrderLinesRepository,
    @repository(WatchRepository) public watchesRepo:WatchRepository,
    @repository(OrderShipmentRepository) public oSR:OrderShipmentRepository
  ) {}


  async getOrders(id:number,filter:any){
    
    const findOrder = await this.orderRepository.find({where:{customerId:id},skip:filter.skip,limit:filter.limit,order:filter?.order})
    if(findOrder.length <=0)
    {
        throw new HttpErrors.NotFound("no orders yet")
    }
    return {
        Msg:"all orders",
        findOrder
    }
  }

  async getOrderById(customerId:number,id:number):Promise<Order>{

    const findOrder = await this.orderRepository.findOne({where:{id,customerId}})
    if(!findOrder)
    {
        throw new HttpErrors.NotFound("Order not found")
    }

    return findOrder
  }

  // make auth to check that customer already exist in app
  async createOrder(id:number,order:Order){
    
    // only 1 order to deliver at a time
    const findActiveOrders = await this.orderRepository.findOne({where:{customerId:id,status:'Active'}})
    if(findActiveOrders)
    {
      throw new HttpErrors.Conflict('there is already an active order procecced or delete your order') // n8yr error hena
    }
    
    return await this.orderRepository.create({customerId:id}) // then go create order lines to buy watches
  }

  async createOrderAndOrderLines(customerId:number,ol:OrderLines[]){

    const findActiveOrders = await this.orderRepository.findOne({where:{customerId,status:'Active'}})
    if(findActiveOrders)
    {
      throw new HttpErrors.Conflict('there is already an active order procecced or delete your order') // n8yr error hena
    }

    const Order =  await this.orderRepository.create({customerId})
    if(!Order)
    {
      throw new HttpErrors.BadRequest("order haven't been created")
    }

     let totalPrice = 0

     const uniqueOrderSet = new Set<string>();

  for (const obj of ol) {
    const key = `${obj.watchId}`
    if (uniqueOrderSet.has(key)) {
      throw new HttpErrors.BadRequest(`Duplicate watchId in input: ${obj.watchId}`);
    }
    uniqueOrderSet.add(key)
  }

     for(let i=0;i<ol.length;i++)
     {
      const findWatch = await this.watchesRepo.findOne({where:{id:ol[i].watchId,isDeleted:false}})
      if(!findWatch)
      {
        throw new HttpErrors.NotFound("this watch not found")
      }

      if(Number(findWatch.quantity) < ol[i].quantity)
        {
          throw new HttpErrors.NotFound(`there is only ${findWatch.quantity} in stock`)
        }

        totalPrice += findWatch.price * ol[i].quantity
      // check if there duplicate watches in cart
      const findWatchInOL = await this.oLR.findOne({where:{watchId:ol[i].watchId,orderId:Order.id}}) // condition msh hy7sal asln
      if(findWatchInOL)// n3mlha akher 7aga totalPrice lma agy azbtha => 23ml lel order update mrteen 1- minus lel price eladeem 2-plus lel price elgdeed
      {
        throw new HttpErrors.Conflict("there is already watch in cart")
      }
     }

     const createOL = await this.oLR.createAll(ol)
     if(createOL.length <= 0)
      {
        throw new HttpErrors.BadRequest("failed to create order lines")
      }

     return {MSG:"cart created successfully",orderLines:createOL}
    
  }
// not needed
  async updateOrder(id:number,customerId:number,order:Order){
    
    const {status} = order

    if(orderStatus.Active != status && orderStatus.Checkout != status && orderStatus.Shipment != status)
    {
      throw new HttpErrors.BadRequest("order status must be Active or Checkout or Shipment")
    }
    const findOrder = await this.orderRepository.findOne({where:{id,customerId}})
    if(!findOrder)
    {
      throw new HttpErrors.NotFound("order not found")
    }
    if(findOrder.status === 'Shipment')
    {
      throw new HttpErrors.BadRequest("order is already shiped can't update order")
    }
    // mynf3sh nroo7 mn active le shipment leeh ? => 3shan totalPrice yban lel user w b3deeha y3ml confirm lel order
    console.log({orderStatus:findOrder.status,status})
    if(findOrder.status === 'Active' && status === 'Shipment')
    {
      throw new HttpErrors.BadRequest("u need to checkout first to confirm order")
    } // if status of order == checkout
    if(findOrder.status === status)
      {
        throw new HttpErrors.BadRequest(`your order status is already ${status} `)
      }
    if(status === 'Active')
    {
      await this.orderRepository.updateById(id,{status})
      return {Msg:"order status have been changed to Active"}
    }

    // hashoof watches el fel order lines w check 3aleehom w update totalPrice
    const findOl = await this.oLR.find({where:{orderId:id}})
    if(findOl.length <=0)
    {
      throw new HttpErrors.NotFound('no order lines found')
    }

    let totalPrice = 0
    for(let i=0;i<findOl.length;i++)
    {
      const findWatch = await this.watchesRepo.findOne({where:{id:findOl[i].watchId}})
      if(findWatch?.isDeleted === true)
      {
        // delete order line if watch is deleted => softDeleted
        const deleteOrderLineRecord = await this.oLR.deleteById(findOl[i].id)
      }
     else if(!findWatch)
        {
          throw new HttpErrors.NotFound(`this watch is not available for now`)
        }
       else if(Number(findWatch.quantity) < findOl[i].quantity)
        {
          throw new HttpErrors.Conflict(`this watch with model: ${findWatch.model} have ${findWatch.quantity} in stock `)
        }
        else{
        totalPrice += findWatch.price * findOl[i].quantity
        console.log({totalPrice})
        }
    }
    if(status === 'Checkout')
    {
      const updateStatus = await this.orderRepository.updateById(id,{status,totalPrice})
    }
      
      if(status === 'Shipment')
      {
        
        const createShipment = await this.oSR.create({trackingNumber:shortid.generate()})

        const updateStatus = await this.orderRepository.updateById(id,{status,totalPrice,shipmentId:createShipment?.id})
        for(let i=0;i<findOl.length;i++)
          {
            const findWatch = await this.watchesRepo.findById(findOl[i].watchId)
            let quantity = Number(findWatch.quantity) - findOl[i].quantity  
            const decreaseWatchStock = await this.watchesRepo.updateById(findOl[i].watchId,{quantity})
          }
      }
      // elmfrood hena 23ml condition lw shipment create shipment model
      // w kman 22ll mn stock fel watches
      return {
        MSG:`update order status to ${status}`
      }
  }


  async deleteOrder(id:number,customerId:number){

    const findOrder = await this.orderRepository.findOne({where:{id,customerId}})
    if(!findOrder)
    {
        throw new HttpErrors.NotFound("id not found")
    }
    if(findOrder.status === 'Shipment')
      {
        throw new HttpErrors.BadRequest("order is already shiped can't delete order")
      }

     await this.orderRepository.deleteById(id)

    return {
        Msg:"Order deleted successfully"
    }
  }



  /*
   * Add service methods here
   */
}
