import {
    Count,
    CountSchema,
    Filter,
    FilterExcludingWhere,
    repository,
    Where,
  } from '@loopback/repository';
  import {
    post,
    param,
    get,
    getModelSchemaRef,
    patch,
    put,
    del,
    requestBody,
    response,
  } from '@loopback/rest';
import { OrderRepository } from '../../repositories';
import { Order, OrderLines } from '../../models';
import { inject, service } from '@loopback/core';
import { OrderService } from './orderService/order.service';

  
  export class OrderController {
    constructor(
      @repository(OrderRepository)
      public orderRepository : OrderRepository,
      @service(OrderService) public os:OrderService,
      @inject('auth.user') private user: any
    ) {}


    @get('/orders')
    @response(200, {
      description: 'Array of Order model instances',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: getModelSchemaRef(Order, {includeRelations: true}),
          },
        },
      },
    })
    async find(
    //  @param.filter(Order) filter?: Filter<Order>,
    @param.query.number('skip') skip: number = 0,
     @param.query.number('limit') limit: number = 10,
     @param.query.string('order') order: string = 'id ASC'
    ): Promise<object> {
      const filter = {
        skip,
        limit,
        order: [order],
      };
     return await this.os.getOrders(this.user.id,filter)
    }

    

    @get('/orders/{id}')
    @response(200, {
      description: 'Order model instance',
      content: {
        'application/json': {
          schema: getModelSchemaRef(Order, {includeRelations: true}),
        },
      },
    })
    async findById(
      @param.path.number('id') id:number
    ): Promise<Order> {
     // return this.orderRepository.findById(id);
     return await this.os.getOrderById(this.user.id,id)
    }
  
    @post('/orders')
    @response(200, {
      description: 'Order model instance',
      content: {'application/json': {schema: getModelSchemaRef(Order)}},
    })
    async create(
      @requestBody({
        content: {
          'application/json': {
            schema: getModelSchemaRef(Order, {
            //   title: 'NewOrder',
              exclude: ['id','createdAt','updatedAt','customerId'],//elmfrood exlude customerId kman 3shan auth
            }),
          },
        },
      })
      order: Omit<Order, 'id'>,
    ): Promise<Order> {
     // return this.orderRepository.create(order);
     return await this.os.createOrder(this.user.id,order) // na5od param hena customerId mn auth
    }

    @post('/orders/lines')
    @response(200, {
      description: 'Order model instance',
      content: {'application/json': {schema: getModelSchemaRef(Order)}},
    })
    async createBulk(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  watchId: {type: 'number'},
                  quantity:{type:'number'}
                },
                required: ['watchId','quantity'],
              },
            },
          },
        },
      })
      orderLines:Omit<OrderLines,'id'>[]
    ): Promise<object> {
     // return this.orderRepository.create(order);
     return await this.os.createOrderAndOrderLines(this.user.id,orderLines) // na5od param hena customerId mn auth
    }
  
    @patch('/orders/{id}')
    @response(204, {
      description: 'Order PATCH success',
    })
    async updateById(
      @param.path.number('id') id: number,
      @requestBody({
        content: {
          'application/json': {
            schema: getModelSchemaRef(Order, {partial: true,exclude:['createdAt','updatedAt','customerId','totalPrice']}),
          },
        },
      })
      order: Order,
    ): Promise<object> {
      // await this.orderRepository.updateById(id, order);
      return await this.os.updateOrder(id,this.user.id,order)
    }
  
    @del('/orders/{id}')
    @response(204, {
      description: 'Order DELETE success',
    })
    async deleteById(@param.path.number('id') id: number): Promise<object> {
    //   await this.orderRepository.deleteById(id);
    return await this.os.deleteOrder(id,this.user.id)
    }


  }
  