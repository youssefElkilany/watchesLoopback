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
    Response,
    Request,
    RestBindings,
  } from '@loopback/rest';
import { WatchCategoryRepository } from '../../repositories';
import { WatchCategory } from '../../models';
import { inject, service } from '@loopback/core';
import { WCategoryService } from './watchCategoryService/wCategory.service';
  
const rateLimitStore = new Map<string, { count: number; lastRequest: number }>();

const RATE_LIMIT_WINDOW_MS = 1 * 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 3;

  export class WatchCategoryController {
    constructor(
      @repository(WatchCategoryRepository)
      public watchCategoryRepository : WatchCategoryRepository,
      @service(WCategoryService) public wCategoryService: WCategoryService
    ) {}


    // to get all watches belongs to that category
    @get('/watch-categories/watches')
    @response(200, {
      description: 'Array of WatchCategory model instances',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: getModelSchemaRef(WatchCategory, {includeRelations: true}),
          },
        },
      },
    })
    async findWatchesByType(
        @param.query.string('type') type:string
     // @param.filter(WatchCategory) filter?: Filter<WatchCategory>,
    ): Promise<object> {
        return this.wCategoryService.getWatchesByType(type)
    }
  
    @post('/watch-categories')
    @response(200, {
      description: 'WatchCategory model instance',
      content: {'application/json': {schema: getModelSchemaRef(WatchCategory)}},
    })
    async create(
      @requestBody({
        content: {
          'application/json': {
            schema: getModelSchemaRef(WatchCategory, {
             // title: 'NewWatchCategory',
              exclude: ['id'],
            }),
          },
        },
      })
      watchCategory: Omit<WatchCategory, 'id'>,
    ): Promise<WatchCategory> {
        return await this.wCategoryService.createWC(watchCategory)
}
  
    @get('/watch-categories')
    @response(200, {
      description: 'Array of WatchCategory model instances',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: getModelSchemaRef(WatchCategory, {includeRelations: true}),
          },
        },
      },
    })
    async find(
      @inject(RestBindings.Http.REQUEST) req: Request,
      @inject(RestBindings.Http.RESPONSE) res: Response,
      @param.filter(WatchCategory) filter?: Filter<WatchCategory>,
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
      return await this.wCategoryService.getAll()
     // return this.watchCategoryRepository.find(filter);
    }

    @get('/watch-categories/deleted')
    @response(200, {
      description: 'Array of WatchCategory model instances',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: getModelSchemaRef(WatchCategory, {includeRelations: true}),
          },
        },
      },
    })
    async findDeleted(
    ): Promise<object> {
      return await this.wCategoryService.getAllDeleted()
     // return this.watchCategoryRepository.find(filter);
    }

  
    @get('/watch-categories/{id}')
    @response(200, {
      description: 'WatchCategory model instance',
      content: {
        'application/json': {
          schema: getModelSchemaRef(WatchCategory, {includeRelations: true}),
        },
      },
    })
    async findById(
      @param.path.number('id') id: number,
      @param.filter(WatchCategory, {exclude: 'where'}) filter?: FilterExcludingWhere<WatchCategory>
    ): Promise<WatchCategory> {
      return this.watchCategoryRepository.findById(id, filter);
    }
  
  
    @del('/watch-categories/{id}')
    @response(204, {
      description: 'WatchCategory DELETE success',
    })
    async deleteById(@param.path.number('id') id: number): Promise<object> {
      await this.watchCategoryRepository.deleteById(id);
      return {
        Msg:"deleted Successfully"
      }
    }
  }
  