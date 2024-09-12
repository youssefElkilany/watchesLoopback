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
    RestBindings,
    Request,
    HttpErrors,
  } from '@loopback/rest';
import { OrderLinesRepository } from '../../repositories';
import { OrderLines } from '../../models';
import { inject, service } from '@loopback/core';
import { OrderLinesService } from './orderLinesService/orderLines.service';
  
  export class OrderLinesController {
    constructor(
      @repository(OrderLinesRepository)
      public orderLinesRepository : OrderLinesRepository,
      @service(OrderLinesService) public os:OrderLinesService,
      @inject('auth.user') private user: any
    ) {}

///middelware
    // @middelware(AuthMiddelware)
    @get('/protected-route')
    protectedRoute(
      @inject(RestBindings.Http.REQUEST) request: Request,
    ): string {
      // Access the userId attached by the AuthMiddleware
      const userId = (request as any).userId;
      console.log({userId})
      console.log({user:this.user})
  
      return `Hello, user with ID: ${this.user.id}`;
    }

    @get('/order-lines/details/{orderId}')
    @response(200, {
      description: 'Array of OrderLines model instances',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: getModelSchemaRef(OrderLines, {includeRelations: true}),
          },
        },
      },
    })
    async getOrderDetails(
      @param.path.number('orderId') orderId:number
    ): Promise<object> {
     
    return await this.os.getOrderDetails(orderId,this.user.id)
    }

    @get('/order-lines')
    @response(200, {
      description: 'Array of OrderLines model instances',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: getModelSchemaRef(OrderLines, {includeRelations: true}),
          },
        },
      },
    })
    async find(
    ): Promise<object> {
      if(this.user.role == 'user')
        {
          throw new HttpErrors.Unauthorized("u cant access this api")
        }
      return await this.os.getOrders()
    }


    @get('/order-lines/{id}')
    @response(200, {
      description: 'OrderLines model instance',
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderLines, {includeRelations: true}),
        },
      },
    })
    async findById(
      @param.path.number('id') id: number,
     // @param.filter(OrderLines, {exclude: 'where'}) filter?: FilterExcludingWhere<OrderLines>
    ): Promise<OrderLines> {
      if(this.user.role == 'user')
        {
          throw new HttpErrors.Unauthorized("u cant access this api")
        }
     return await this.os.getOrderById(id)
    }
  
    @post('/order-lines')
    @response(200, {
      description: 'OrderLines model instance',
      content: {'application/json': {schema: getModelSchemaRef(OrderLines)}},
    })
    async create(
      @requestBody({
        content: {
          'application/json': {
            schema: getModelSchemaRef(OrderLines, {
              title: 'NewOrderLines',
              exclude: ['id','totalPrice','createdAt','updatedAt'],
            }),
          },
        },
      })
      orderLines: Omit<OrderLines, 'id'>,
    ): Promise<object> {
      //return this.orderLinesRepository.create(orderLines);
      return this.os.createOrderLines(orderLines,this.user.id)
    }
  
    @del('/order-lines')
    @response(204, {
      description: 'OrderLines DELETE success',
    })
    async deleteById(@param.query.string('id') id: string): Promise<object> {
     // await this.orderLinesRepository.deleteById(id);
     return await this.os.hardDelete(id,this.user.id)
    }
  }
  