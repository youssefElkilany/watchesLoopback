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
    HttpErrors,
  } from '@loopback/rest';
import { Customer } from '../../models/';
import { CustomerRepository } from '../../repositories';
import { inject, service } from '@loopback/core';
import { CustomerService } from './customerService/customer.service';
import jwt from "jsonwebtoken"
import logger from '../../Utils/logger';

  export class CustomerControllerController {
    constructor(
      @repository(CustomerRepository)
      public customerRepository : CustomerRepository,
      @service(CustomerService) public cs:CustomerService,
      @inject('auth.user') private user: any
    ) {}
  

    // must have account 
    @get('/customers/all')
    @response(200, {
      description: 'Array of Customer model instances',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: getModelSchemaRef(Customer, {includeRelations: true}),
          },
        },
      },
    })
    async find(
     @param.query.number('skip') skip: number = 0,
     @param.query.number('limit') limit: number = 10,
     @param.query.string('order') order: string = 'name ASC'
    ): Promise<Customer[]> {
      console.log({skip,limit})
      const filter = {
        skip,
        limit,
        order: [order],
      }
    return await this.cs.getCustomers(filter)
    }

    // only for admin
    @get('/customers/deleted')
    @response(200, {
      description: 'Array of Customer model instances',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: getModelSchemaRef(Customer, {includeRelations: true}),
          },
        },
      },
    })
    async findDeletedCustomers(
    ): Promise<Customer[]> {
      if(this.user.role === 'user')
      {
        throw new HttpErrors.Unauthorized("u cant access this API")
      }
    return await this.cs.getDeletedCustomers()
    }


    // get profile of user by taking id from authentication
    @get('/customers')
    @response(200, {
      description: 'Customer model instance',
      content: {
        'application/json': {
          schema: getModelSchemaRef(Customer, {includeRelations: true}),
        },
      },
    })
    async findById(
    ): Promise<object> {
    //  return this.customerRepository.findById(id);
    return await this.cs.getCustomerById(this.user.id)
    }

    @post('/signup')
    @response(200, {
      description: 'Customer model instance',
      content: {'application/json': {schema: getModelSchemaRef(Customer)}},
    })
    async create(
      @requestBody({
        content: {
          'application/json': {
            schema: getModelSchemaRef(Customer, {
             // title: 'NewCustomer',
              exclude: ['id','createdAt','updatedAt'], // user cant enter them at body
            }),
          },
        },
      })
      customer: Omit<Customer, 'id'>,
    ): Promise<Customer> {
     // return this.customerRepository.create(customer);
     return await this.cs.addCustomers(customer)
    }

  

    @patch('/customers', {
        responses: {
          '204': {
            description: 'Customer name update success',
          },
        },
      })

      // specifying name to be sent in body
      async updateCustomerName(
      //  @param.path.number('id') id: number,
        @requestBody({
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: {type: 'string'},
                },
                required: ['name'],
              },
            },
          },
        })
        customer: {name: string},
      ): Promise<object> {
      return this.cs.updateCustomerById(this.user.id,customer.name)
      }
    
  
    @del('/customers')
    @response(204, {
      description: 'Customer DELETE success',
    })
    async deleteById(): Promise<object> {
    return await this.cs.hardDelete(this.user.id)
    }

    @del('/customers/soft')
    @response(204, {
      description: 'Customer DELETE success',
    })
    async softdeleteById(): Promise<object> {
    //   await this.customerRepository.deleteById(id);
    return await this.cs.softDelete(this.user.id)
    }

// admin who can search for customers
    @get('/customers/search', {
        responses: {
          '200': {
            description: 'Array of Customer model instances',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    'x-ts-type': Customer,
                  },
                },
              },
            },
          },
        },
      })
      async searchCustomers(
        @param.query.number('id') id?: number,
        @param.query.string('name') name?: string,
        @param.query.string('role') role?:string
      ): Promise<Customer[]> {
        return this.cs.searchForCustomer(id,name,role)
      }

      @post('/login')
    @response(200, {
      description: 'Customer model instance',
      content: {'application/json': {schema: getModelSchemaRef(Customer)}},
    })

    async login(
      @requestBody({
        content: {
          'application/json': {
            schema: getModelSchemaRef(Customer, {
             // title: 'NewCustomer',
              exclude: ['id','createdAt','updatedAt','isDeleted'], // user cant enter them at body
            }),
          },
        },
      })
      customer: Omit<Customer, 'id'>,
    ): Promise<object> {
     
      try {
        const findUser = await this.customerRepository.findOne({where:{name:customer.name,isDeleted:false}})
        if(!findUser)
        {
          throw new HttpErrors.NotFound("user not found")
        }
  
        const token = jwt.sign({id:findUser.id,name:customer.name},'secret')
        return {
          Msg:"login successfully",
          token
        }
      } catch (error) {
        logger.error("error at login",error.message)
        return {Msg:(error.message),status:500}
        }
      }
     

  }
  