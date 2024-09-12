import {injectable, /* inject, */ BindingScope} from '@loopback/core';
import { repository } from '@loopback/repository';
import { OrderLinesRepository, OrderRepository, WatchRepository } from '../../../repositories';
import { HttpErrors } from '@loopback/rest';
import { OrderLines } from '../../../models';

@injectable({scope: BindingScope.TRANSIENT})
export class OrderLinesService {
  constructor(/* Add @inject to inject parameters */
    @repository(OrderLinesRepository) public ol:OrderLinesRepository,
    @repository(OrderRepository) public orderRepository:OrderRepository,
    @repository(WatchRepository) public watchRepository :WatchRepository
  ) {}


  async getOrders(){
    
    const findOrder = await this.ol.find()
    if(findOrder.length <=0)
    {
        throw new HttpErrors.NotFound("no orders yet")
    }
    return {
        Msg:"all order lines",
        findOrder
    }
  }

  async getOrderById(id:number):Promise<OrderLines>{

    const findOrderLines = await this.ol.findOne({where:{id}})
    if(!findOrderLines)
    {
      throw new HttpErrors.NotFound("Order not found")
    }

    return findOrderLines
  }

  async getOrderDetails(orderId:number,customerId:number){

    let orderDetailsArr:any = []
    const findOrder = await this.orderRepository.findOne({where:{id:orderId,customerId}})
    if(!findOrder)
    {
      throw new HttpErrors.NotFound("orderId not found")
    }

    orderDetailsArr.push(findOrder)

    const findOrderLines = await this.ol.find({where:{orderId}})
    if(findOrderLines.length <=0)
    {
      throw new HttpErrors.NotFound("no related order lines yet")
    }
    orderDetailsArr.push(findOrderLines)
    for(let i=0;i<findOrderLines.length;i++)
    {
      const findWatches = await this.watchRepository.findOne({where:{id:findOrderLines[0].watchId}})
      orderDetailsArr.push(findWatches)
    }

    return {
      orderDetailsArr
    }
    // hena b2a h3ml for loop 3la orderLines w ageeb watches kolha w represent data 
  }

// hnsheel totalPrice mn order delwa2ty w n3mlha b3deen
// for updating and creating orderLines
  async createOrderLines(cart:OrderLines,customerId:number){

    console.log({cart})

    // order must belongs to customer
    const findOrder = await this.orderRepository.findOne({where:{id:cart.orderId,customerId,status:"Active"||"Checkout"}})
    if(!findOrder)
    {
        throw new HttpErrors.NotFound("order id not found")
    }
    // watch must be not deleted
    const findWatch = await this.watchRepository.findOne({where:{id:cart.watchId,isDeleted:false}})
    if(!findWatch)
    {
        throw new HttpErrors.NotFound("watch id not found")
    }
    // check available stock
    if(Number(findWatch?.quantity) < cart.quantity)
    {
      throw new HttpErrors.NotFound(`there is only ${findWatch.quantity} in stock`)
    }
    console.log({findWatch})

    // check if there is already same watch in cart belongs to same order
    const checkDuplicate:any = await this.ol.findOne({where:{orderId:cart.orderId,watchId:cart.watchId}})
    if(checkDuplicate) // update order line if watch exist in order
    {
       // let quantity:number = Number(checkDuplicate?.quantity) + Number(cart?.quantity)
        
        // na2es hena n7sb lw price already 3nd order m7tageen n3mlo minus w n3ml plus lel quantities elgdeeda bel price elgdeed
        // calculating total price

        let totalPrice:number = findWatch.price * Number(cart.quantity)
        // 
       // totalPrice += Number(checkDuplicate?.totalPrice)
        // update quantity in orderLines
        const updateOrderLines = await this.ol.updateById(checkDuplicate.id,{quantity:cart.quantity,totalPrice})

        // decreasing stock of watches
        // let calculatedQuantity = Number(findWatch.quantity) - cart.quantity
        // const updateWatch = await this.watchRepository.updateById(cart.watchId,{quantity:calculatedQuantity})

        // // updating total price in order
        // const updateOrder = await this.orderRepository.updateById(cart.orderId,{totalPrice})

        return {
          MSG:"orderLines has been updated"
        }

    }// b3deeha n3ml add 3ady b2a w lazm nt2kd brdo en quantity msh exceeded



        let totalPrice:number = findWatch.price * Number(cart?.quantity)

        const createOrderLines = await this.ol.create({orderId:cart.orderId,watchId:cart.watchId,quantity:cart.quantity,totalPrice})
        if(!createOrderLines)
        {
          throw new HttpErrors.BadRequest("order lines not created")
        }

        return {
          Msg:"order line created successfully",
          createOrderLines
        }
  }

// to delete orderline from active order
  async hardDelete(id:string,customerId:number){


    console.log({id})

    const idArray = id.split(',').map(id => parseInt(id)).filter(idd => !isNaN(idd))

    console.log({idArray})
    if (idArray.length === 0) {
      throw new HttpErrors.BadRequest('Invalid IDs provided')
    }
    
    for(let i=0;i<idArray.length;i++)
    {
      const checkOl = await this.ol.findById(idArray[i])
      if(!checkOl)
      {
        throw new HttpErrors.NotFound(`orderId: ${idArray[i]} not found`)
      }
      // order must belong to customer and must not be shiped
      const checkIds = await this.orderRepository.findOne({where:{id:checkOl.id,customerId,status:'Active'||'Checkout'}})
      if(!checkIds)
      {
        throw new HttpErrors.NotFound(`this order doesn't belong to you`)
      }
    }

    const result = await this.ol.deleteAll({
      id: {inq: idArray},
    })

    if (result.count === 0) {
      throw new HttpErrors.NotFound('No records found with the provided IDs')
    }

    return {
        Msg:"category deleted successfully"
    }

  }


  

  /*
   * Add service methods here
   */
}
