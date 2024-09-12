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
import { Category } from '../../models';
import { CategoryRepository } from '../../repositories';
import { inject, service } from '@loopback/core';
import { CategoryService } from './CategoryService/category.service';
import { request } from 'http';
//import { authorizeRoles } from '../../Middelware/authorization';
  
  export class CategoryController {
    constructor(
      @repository(CategoryRepository)
      public categoryRepository : CategoryRepository,
      @service(CategoryService) public cs:CategoryService,
      @inject('auth.user') private user: any
    ) {}


    @get('/categories')
    @response(200, {
      description: 'Array of Category model instances',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: getModelSchemaRef(Category, {includeRelations: true}),
          },
        },
      },
    })
    async getAllCategories(
      @param.query.number('skip') skip: number = 0,
      @param.query.number('limit') limit: number = 10,
      @param.query.string('order') order: string = 'type ASC'
    ): Promise<Category[]> {
      const filter = {
        skip,
        limit,
        order: [order],
      };
  return await this.cs.getCategories(filter)
    }

    @get('/categories/deleted')
    @response(200, {
      description: 'Array of Category model instances',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: getModelSchemaRef(Category, {includeRelations: true}),
          },
        },
      },
    })
    async getDeletedCategories(
    ): Promise<Category[]> {
      if(this.user.role === 'user')
      {
        throw new HttpErrors.Unauthorized("u cant access this api")
      }
   return await this.cs.getDeletedCategories()
    }


    @get('/categories/{id}')
    @response(200, {
      description: 'Array of Category model instances',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: getModelSchemaRef(Category, {includeRelations: true}),
          },
        },
      },
    })
    async find(
        @param.path.number('id')id:number
    //  @param.filter(Category) filter?: Filter<Category>,
    ): Promise<Category> {
  return await this.cs.getCategoriesById(id)
    }


  
    @post('/categories')
    @response(200, {
      description: 'Category model instance',
      content: {'application/json': {schema: getModelSchemaRef(Category)}},
    })
    async create(
      @requestBody({
        content: {
          'application/json': {
            schema: getModelSchemaRef(Category, {
            //  title: 'NewCategory',
              exclude: ['id','createdAt','updatedAt'],
            }),
          },
        },
      })
      category: Omit<Category, 'id'>,
    ): Promise<Category> {
    //  return this.categoryRepository.create(category);
    return await this.cs.createCategory(category)
    }

    @post('/categories/bulk')
    @response(200, {
      description: 'Category model instance',
      content: {'application/json': {schema: getModelSchemaRef(Category)}},
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
                  type: {type: 'string'},
                  description:{type:'string'}
                },
                required: ['type'],
              },
            },
          },
        },
      })
      category: Omit<Category, 'id'>[],
    ): Promise<object> {
    //  return this.categoryRepository.create(category);
    return await this.cs.createCategoryBulk(category)
    }


    @put('/categories/bulk')
    @response(200, {
      description: 'Category model instance',
      content: {'application/json': {schema: getModelSchemaRef(Category)}},
    })
    async updateBulk(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id:{type:'number'},
                  type: {type: 'string'},
                  description:{type:'string'},
                },
                required: ['id','type'],
              },
            },
          },
        },
      })
      category: Category[],
    ): Promise<object> {
    //  return this.categoryRepository.create(category);
    return await this.cs.updatebulkCategory(category)
    }
  
   
  
   
  
  
    @patch('/categories/{id}')
    @response(204, {
      description: 'Category PATCH success',
    })
    async updateById(
      @param.path.number('id') id: number,
      @requestBody({
        content: {
          'application/json': {
            schema: getModelSchemaRef(Category, {
              partial: true,
              exclude:['createdAt','updatedAt']
            }),
          },
        },
      })
      category: Category,
    ): Promise<object> {
    //   await this.categoryRepository.updateById(id, category);

    return await this.cs.updateCategory(id,category)
    }
  
    @del('/categories')
    @response(204, {
      description: 'Category DELETE success',
    })
    async deleteById(@param.query.string('id') id: string): Promise<object> {
     // await this.categoryRepository.deleteById(id);
     return await this.cs.hardDelete(id)
    }

    @del('/categories/soft')
    @response(204, {
      description: 'Category DELETE success',
    })
    async softDeleteById(@param.query.string('id') id: string): Promise<object> {
     // await this.categoryRepository.deleteById(id);
     return await this.cs.softDelete(id)
    }


    @get('/categories/search', {
        responses: {
          '200': {
            description: 'Array of Customer model instances',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    'x-ts-type': Category,
                  },
                },
              },
            },
          },
        },
      })
      async searchCustomers(
        @param.query.number('id') id?: number,
        @param.query.string('type') type?: string,
      ): Promise<object> {

        return this.cs.searchForCategory(id,type)
      }

  }
  