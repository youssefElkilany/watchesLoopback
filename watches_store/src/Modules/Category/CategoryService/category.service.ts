import {injectable, /* inject, */ BindingScope} from '@loopback/core';
import { repository } from '@loopback/repository';
import { CategoryRepository } from '../../../repositories';
import { Category } from '../../../models';
import { HttpErrors } from '@loopback/rest';
import logger from '../../../Utils/logger';

@injectable({scope: BindingScope.TRANSIENT})
export class CategoryService {
  constructor(/* Add @inject to inject parameters */
    @repository(CategoryRepository)public categoryRepository:CategoryRepository
  ) {}


  async getCategories(filter:any):Promise<Category[]>{
    return await this.categoryRepository.find({where:{isDeleted:false},skip:filter.skip,limit:filter.limit,order:filter?.order})
  }

  async getDeletedCategories():Promise<Category[]>{
    return await this.categoryRepository.find({where:{isDeleted:true}})
  }

  async getCategoriesById(id:number):Promise<Category>{

    const findCategoy = await this.categoryRepository.findOne({where:{id,isDeleted:false}})
    if(!findCategoy)
    {
      logger.error("category not found",)
        throw new HttpErrors.NotFound("category not found")
    }

    return findCategoy
  }


  async createCategory(Category:Category){
    // letting him to search in deleted categories too if he wants to retreive deleted category and not adding same deleted category
    const findType = await this.categoryRepository.findOne({where:{type:Category.type}})
    if(findType)
    {
      logger.error("that type already exist",)
        throw new HttpErrors.Conflict("that type already exist")
    }

    return await this.categoryRepository.create(Category)

  }

  async createCategoryBulk(Category:Category[]){


    const uniqueCategoriesSet = new Set<string>();

  for (const cat of Category) {
    const key = `${cat.type}`
    if (uniqueCategoriesSet.has(key)) {
      throw new HttpErrors.BadRequest(`Duplicate types in input: ${cat.type}`);
    }
    uniqueCategoriesSet.add(key)
  }

    const uniqueTypes = Category.map(cat => ({type:cat.type.toLowerCase().trim()}))
    console.log({uniqueTypes})

    

    const checkCategory = await this.categoryRepository.find({where:{or:uniqueTypes}})
    if(checkCategory.length > 0)
    {
      throw new HttpErrors.Conflict(`this type: ${checkCategory[0].type} already exist `)
    }


  //   for(let i=0;i<Category.length;i++)
  //     {
  //           // letting him to search in deleted categories too if he wants to retreive deleted category and not adding same deleted category
  //   const findType = await this.categoryRepository.findOne({where:{type:Category[i].type}})
  //   if(findType)
  //   {
  //       throw new HttpErrors.Conflict("that type already exist")
  //   }
  // }

    return await this.categoryRepository.createAll(uniqueTypes)
  }



  async updatebulkCategory(category:Category[]){

    const uniqueCategoriesSet = new Set<string>();

  for (const cat of category) {
    const key = `${cat.type}`
    if (uniqueCategoriesSet.has(key)) {
      throw new HttpErrors.BadRequest(`Duplicate types in input: ${cat.type}`);
    }
    uniqueCategoriesSet.add(key)
  }
  console.log({size:uniqueCategoriesSet.size})

  for(let i=0;i<uniqueCategoriesSet.size;i++)
  {
    const findCat = await this.categoryRepository.findById(category[i].id)
    if(!findCat)
    {
      throw new HttpErrors.NotFound("id not found")
    }

    const findType = await this.categoryRepository.findOne({where:{type:category[i].type}})
    if(findType)
    {
      throw new HttpErrors.Conflict(`type: ${category[i].type}  already exist`)
    }
    if(category[i].description)
      {
        await this.categoryRepository.updateById(category[i].id,{type:category[i].type,description:category[i].description})
      }
      else{
        const result = this.categoryRepository.updateById(category[i].id,{type:category[i].type})
      }
  }
   return {
    Msg:"customer updated successfully"
}
  }


  async updateCategory(id:number,category:Category){

    const findCategory = await this.categoryRepository.findById(id)
    if(!findCategory)
    {
      throw new HttpErrors.NotFound("id not found")
    }

    const findType = await this.categoryRepository.findOne({where:{type:category.type}})
    if(findCategory?.id == findType?.id) // if type is the same and no update will happen in row
    {
        throw new HttpErrors.Conflict("type already the same")
    }
    if(findType) // if type exist in database but from another row
    {
        throw new HttpErrors.Conflict("type already exist")
    }
    if(category.description)
    {
      await this.categoryRepository.updateById(id,{type:category.type,description:category.description})
    }

   await this.categoryRepository.updateById(id,{type:category.type})

   return {
    Msg:"customer updated successfully"
}
  }


  async hardDelete(id:string){

    console.log({id})

    const idArray = id.split(',').map(id => parseInt(id)).filter(idd => !isNaN(idd));

    console.log({idArray})
    if (idArray.length === 0) {
      throw new HttpErrors.BadRequest('Invalid IDs provided');
    }

    
    const result = await this.categoryRepository.deleteAll({
      id: {inq: idArray},
    })

    if (result.count === 0) {
      throw new HttpErrors.NotFound('No records found with the provided IDs');
    }


    return {
        Msg:"category deleted successfully"
    }
  }

  async softDelete(id:string){


    console.log({id})

    const idArray = id.split(',').map(id => parseInt(id)).filter(idd => !isNaN(idd));

    console.log({idArray})
    if (idArray.length === 0) {
      throw new HttpErrors.BadRequest('Invalid Ids');
    }

    // Perform the bulk delete operation
    const result = await this.categoryRepository.updateAll(
      {isDeleted:true},
      {id: {inq: idArray}},
    )

    if (result.count === 0) {
      throw new HttpErrors.NotFound('No records found with the this Ids');
    }

    return {
        Msg:"category deleted successfully"
    }
  }


  async searchForCategory(id:number|undefined,type:string|undefined){
    
    const searchKey: any = {};

    if (id !== undefined) {
      searchKey.id = id;
    }
    if (type !== undefined) {
      searchKey.type = type;
    }

    if(Object.keys(searchKey).length == 0)
    {
      throw new HttpErrors.BadRequest("nothing entered")
    }

    const category = await this.categoryRepository.find({where:searchKey})
    if(category.length <=0)
    {
      throw new HttpErrors.NotFound("nothing matched your preferences")
    }

    return {
      category
    }
  }
  /*
   * Add service methods here
   */
}
