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
    Request,
    RestBindings,
    Response,
  } from '@loopback/rest';
  import {Watch} from '../../models';
  import {WatchRepository} from '../../repositories';
import { inject, service } from '@loopback/core';
import { WatchesService } from './watchesService/watches.service';
import rateLimit from 'express-rate-limit';
//import { limiter } from '../../Utils/rateLimiter';

// A simple in-memory store for rate limiting
const rateLimitStore = new Map<string, { count: number; lastRequest: number }>();

const RATE_LIMIT_WINDOW_MS = 1 * 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 3;


  export class WatchesController {
    constructor(
      @repository(WatchRepository)
      public watchRepository : WatchRepository,
      @service(WatchesService) public ws:WatchesService
    ) {}


    @get('/watches')
    @response(200, {
      description: 'Array of Watch model instances',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: getModelSchemaRef(Watch, {includeRelations: true}),
          },
        },
      },
    })
    async find(
      @inject(RestBindings.Http.REQUEST) req: Request,
      @inject(RestBindings.Http.RESPONSE) res: Response,
      @param.query.number('skip') skip: number = 0,
    @param.query.number('limit') limit: number = 10,
    @param.query.string('order') order: string = 'brand ASC'
    ): Promise<object> {
      
      const ip = req.ip; // get ip
      console.log({ip})
    const now = Date.now();

    // Get or initialize rate limit data
    let data = rateLimitStore.get(String(ip));
    console.log({data})
    if (!data) { // initialize data
      data = { count: 0, lastRequest: now };
      rateLimitStore.set(String(ip), data);
    }

    
    // Checking rate limit
    if (now - data.lastRequest > RATE_LIMIT_WINDOW_MS) {
      // Reset the rate limit window when time exceeds Rate_limit 
      data.count = 1;
      data.lastRequest = now;
    } else {
      data.count++;
    }

    // count aktr mn limit el ana 7ato print error
    if (data.count > RATE_LIMIT_MAX_REQUESTS) {
      // Rate limit exceeded
      res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', Math.floor(now / 1000) + (RATE_LIMIT_WINDOW_MS / 1000));
      return Promise.reject({
        statusCode: 429,
        message: 'Too many requests, please try again in a minute.',
      });
    }

      const filter = {
        skip,
        limit,
        order: [order],
      }

      return await this.ws.getWatches(filter)
    }

    @get('/watches/deleted')
    @response(200, {
      description: 'Array of Watch model instances',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: getModelSchemaRef(Watch, {includeRelations: true}),
          },
        },
      },
    })
    async findDeletedWatches(
    ): Promise<Watch[]> {
      return await this.ws.getDeletedWatches()
    }

    @get('/watches/{id}')
    @response(200, {
      description: 'Watch model instance',
      content: {
        'application/json': {
          schema: getModelSchemaRef(Watch, {includeRelations: true}),
        },
      },
    })
    async findById(
      @param.path.number('id') id: number,
      //@param.filter(Watch, {exclude: 'where'}) filter?: FilterExcludingWhere<Watch>
    ): Promise<Watch> {
    //  return this.watchRepository.findById(id);
    return await this.ws.getWatchById(id)
    }

    

  
    @post('/watches')
    @response(200, {
      description: 'Watch model instance',
      content: {'application/json': {schema: getModelSchemaRef(Watch)}},
    })
    async create(
      @requestBody({
        content: {
          'application/json': {
            schema: getModelSchemaRef(Watch, {
             // title: 'NewWatch',
              exclude: ['id','createdAt','updatedAt','isDeleted'],
            }),
          },
        },
      })
      watch: Omit<Watch, 'id'>,
    ): Promise<Watch> {
     // return this.watchRepository.create(watch);
     return await this.ws.createWatch(watch)
    }

    @post('/watches/bulk')
    @response(200, {
      description: 'Watch model instance',
      content: {'application/json': {schema: getModelSchemaRef(Watch)}},
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
                  model: {type: 'string'},
                  brand:{type:'string'},
                  price: {type: 'number'},
                  quantity:{type:'number'}
                },
                required: ['model','brand','price'],
              },
            },
          },
        },
      })
      watch: Omit<Watch, 'id'>[],
    ): Promise<Watch[]> {
     return await this.ws.createWatchBulk(watch)
    }   


// hena hn3ml interface fel type 3nd schema 3shan a7aded attributes el 3ayz ad5lha
    @put('/watches/{id}')
    @response(204, {
      description: 'Watch PATCH success',
    })
    async updateById(
      @param.path.number('id') id: number,
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                brand: {type: 'string'},
                model:{type:'string'},
                price:{type:'number'},
                quantity:{type:'number'},
              },
            },
          },
        },
      })
      watch: {brand:string,model:string,price:number,quantity:number},
    ): Promise<object> {
     // await this.watchRepository.updateById(id, watch);
     return await this.ws.updateWatch(id,watch)
    }
  
    
  
    @del('/watches')
    @response(204, {
      description: 'Watch DELETE success',
    })
    async deleteById(@param.query.string('id') id: string): Promise<object> {
     // await this.watchRepository.deleteById(id);
      return await this.ws.hardDelete(id)
    }

    @del('/watches/soft')
    @response(204, {
      description: 'Watch DELETE success',
    })
    async softDeleteById(@param.query.string('id') id: string): Promise<object> {
    //   await this.watchRepository.deleteById(id);
    return await this.ws.softDelete(id)
    }

    @get('/watches/search', {
      responses: {
        '200': {
          description: 'Array of watches model instances',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  'x-ts-type': Watch,
                },
              },
            },
          },
        },
      },
    })
    async searchCustomers(
      @param.query.number('id') id?: number,
      @param.query.string('brand') brand?: string,
      @param.query.string('model') model?: string,
     // @param.query.string('quantity') quantity?: string,
      @param.query.string('price') price?: number,
    ): Promise<object> {

      return this.ws.searchForWatch(id,brand,model,price)
    }

  }
  