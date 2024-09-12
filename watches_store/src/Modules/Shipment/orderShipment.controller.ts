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
import { OrderShipmentRepository } from '../../repositories';
import { OrderShipment } from '../../models';
import { inject, service } from '@loopback/core';
import { OrderShipmentService } from './orderShipmentService/orderShipment.service';

  
  export class OrderShipmentController {
    constructor(
      @repository(OrderShipmentRepository)
      public orderShipmentRepository : OrderShipmentRepository,
      @inject('auth.user') private user: any,
      @service(OrderShipmentService) public oss:OrderShipmentService
    ) {}
   
  
    @get('/order-shipments')
    @response(200, {
      description: 'Array of OrderShipment model instances',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: getModelSchemaRef(OrderShipment, {includeRelations: true}),
          },
        },
      },
    })
    async find(
        @param.query.number('skip') skip: number = 0,
        @param.query.number('limit') limit: number = 5,
        @param.query.string('order') order: string = 'id ASC'
    ): Promise<object> {
        const filter = {
            skip,
            limit,
            order: [order],
          };
    //   return this.orderShipmentRepository.find(filter);
    return this.oss.getAllShipment(filter,this.user.id)
    }
  
  
    @get('/order-shipments/{id}')
    @response(200, {
      description: 'OrderShipment model instance',
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderShipment, {includeRelations: true}),
        },
      },
    })
    async findById(
      @param.path.number('id') id: number,
      @param.filter(OrderShipment, {exclude: 'where'}) filter?: FilterExcludingWhere<OrderShipment>
    ): Promise<OrderShipment> {
     // return this.orderShipmentRepository.findById(id, filter);
     return this.oss.getShipment(id,this.user.id)
    }
  }
  