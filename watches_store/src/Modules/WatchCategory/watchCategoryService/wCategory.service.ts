import {injectable, /* inject, */ BindingScope} from '@loopback/core';
import { repository } from '@loopback/repository';
import { CategoryRepository, WatchCategoryRepository, WatchRepository } from '../../../repositories';
import { HttpErrors } from '@loopback/rest';
import { WatchCategory } from '../../../models';

@injectable({scope: BindingScope.TRANSIENT})
export class WCategoryService {
  constructor(/* Add @inject to inject parameters */
    @repository(WatchCategoryRepository) public watchCatRepo:WatchCategoryRepository,
    @repository(CategoryRepository) public categoryRepository:CategoryRepository,
    @repository(WatchRepository) public watchRepository:WatchRepository
  ) {}



  async getAll(){

  let query = `
    SELECT 
      wc.categoryId, 
      wc.watchId, 
      c.id AS categoryId, 
      c.type, 
      c.description, 
      w.id AS watchId, 
      w.brand, 
      w.model, 
      w.price, 
      w.quantity
    FROM watchcategory wc
    INNER JOIN category c ON wc.categoryId = c.id AND c.isDeleted = false
    INNER JOIN watch w ON wc.watchId = w.id AND w.isDeleted = false
  `;
  const result = await this.watchCatRepo.execute(query,[])
  if(result.length <=0)
  {
    throw new HttpErrors.NotFound("nothing found")
  }
//console.log({result})
  return {
    result
   // findAll
  }

  }

  async getAllDeleted(){

    let query = `
      SELECT wc.categoryId, wc.watchId, c.id AS categoryId, c.type, c.description, 
        w.id AS watchId, w.brand, w.model, w.price, w.quantity
      FROM watchcategory wc
      INNER JOIN category c ON wc.categoryId = c.id
      INNER JOIN watch w ON wc.watchId = w.id 
      WHERE c.isDeleted = true OR w.isDeleted = true
    `;
    const result = await this.watchCatRepo.execute(query,[])
    if(result.length <=0)
    {
      throw new HttpErrors.NotFound("nothing found")
    }
  //console.log({result})
    return {
      result
     // findAll
    }
  
    }
  
  async getWatchesByType(type:string){

    // search for this type in category model
    const findCategory = await this.categoryRepository.findOne({where:{type}})
    if(!findCategory)
    {
        throw new HttpErrors.NotFound("type not found ")
    }

    // check that this category belongs to number of watches
    const findWC = await this.watchCatRepo.find({where:{categoryId:findCategory.id}})
    if(findWC.length <=0)
    {
        throw new HttpErrors.NotFound("this type doesn't match any watch")
    }

    let watchesArr:any = []

    for(let i=0;i<findWC.length;i++)
    {
        const findWatches = await this.watchRepository.findOne({where:{id:findWC[i].watchId,isDeleted:false}})
        if(!findWatches) // if id not found skip this iteration and dont push => 3shan mmkn watch ttl3 mamsoo7a softDelete
        {
            continue
        }
        watchesArr.push(findWatches)
    }

    return {
        watchesArr
    }

  }

  async createWC(wc:WatchCategory){

    const {categoryId,watchId} = wc

    const findWatch = await this.watchRepository.findOne({where:{id:watchId,isDeleted:false}})
    if(!findWatch)
      {
          throw new HttpErrors.Conflict("Invalid watchId")
      }

    const findCat = await this.categoryRepository.findOne({where:{id:categoryId,isDeleted:false}})
    if(!findCat)
      {
          throw new HttpErrors.Conflict("Invalid categoryId")
      }

    const findWC = await this.watchCatRepo.findOne({where:{watchId,categoryId}})
    if(findWC)
    {
        throw new HttpErrors.Conflict("there is watch with same category")
    }
    
    try {
        return await this.watchCatRepo.create(wc);
      } catch (error) {
        // if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        //   throw new HttpErrors.BadRequest('Invalid watchId');
        // } else {
          throw new HttpErrors.InternalServerError('An unexpected error occurred.');
       // }
  }
}



  /*
   * Add service methods here
   */
}
