import {injectable, /* inject, */ BindingScope} from '@loopback/core';
import { repository } from '@loopback/repository';
import { WatchRepository } from '../../../repositories';
import { HttpErrors } from '@loopback/rest';
import { Watch } from '../../../models';



@injectable({scope: BindingScope.TRANSIENT})
export class WatchesService {
  constructor(/* Add @inject to inject parameters */
    @repository(WatchRepository)
    public watchRepository:WatchRepository
  ) {}

  async getWatches(filter:any):Promise<object>{

    const watches = await this.watchRepository.find({where:{isDeleted:false},skip:filter.skip,limit:filter.limit,order:filter?.order})
    return {
      watches
    }
  }

  async getDeletedWatches():Promise<Watch[]>{
    return await this.watchRepository.find({where:{isDeleted:true}})
  }

  async getWatchById(id:number):Promise<Watch>{

    const findWatch = await this.watchRepository.findOne({where:{id,isDeleted:false}})
    if(!findWatch)
    {
        throw new HttpErrors.NotFound("Watch not found")
    }

    return findWatch
  }


  async createWatch(watch:Watch){

    // search in deleted and non deleted
    const findBrand = await this.watchRepository.findOne({where:{brand:watch.brand,model:watch.model}})
    if(findBrand)
    {
        throw new HttpErrors.Conflict("that brand and model already exist")
    }

    const watches =  await this.watchRepository.create(watch)
    if(!watches)
    {
      throw new HttpErrors.BadRequest("error in creating watch")
    }
return watches
  }

  async createWatchBulk(watches:Watch[]){

  const uniqueWatchesSet = new Set<string>();

  for (const watch of watches) {
    const key = `${watch.brand}-${watch.model}`;
    if (uniqueWatchesSet.has(key)) {
      throw new HttpErrors.BadRequest(`Duplicate watch in input array: ${watch.brand} - ${watch.model}`);
    }
    uniqueWatchesSet.add(key);
  }

      // extract brand and watch from input
      const uniqueWatches = watches.map(watch => ({
        brand: watch.brand.trim().toLowerCase(), // to remove white spaces
        model: watch.model.trim().toLowerCase(),
      }));
    console.log({uniqueWatches})

    // remove duplicate input of same brand and model
      // check for duplicate at database
      const checkWatches = await this.watchRepository.find({
        where: {
          or: uniqueWatches,
        },
      });
      console.log({checkWatches})
    
      if (checkWatches.length > 0) {
        throw new HttpErrors.Conflict(`The brand "${checkWatches[0].brand}" with model "${checkWatches[0].model}" already exists.`);
      }
    
      console.log({watches})
      // Perform the bulk insert since there are no conflicts
      const createdWatches = await this.watchRepository.createAll(watches);
    
      if (!createdWatches || createdWatches.length === 0) {
        throw new HttpErrors.BadRequest('Error in creating watches');
      }
    
      return createdWatches;

  }




  async updateWatch(id:number,watch:any){
    
    console.log({watch})
    console.log({model:watch.model})
    let sql1 = 'SELECT * FROM watch WHERE id = ?'
    const findWatch = await this.watchRepository.execute(sql1,[id])
    if(!findWatch)
    {
        throw new HttpErrors.NotFound("id not found")
    }
    console.log({findWatch})

    let sql = 'UPDATE watch SET'
    let params : Array<number|string> = []

    if(watch.model)
    {
        sql += ' model = ?'
        params.push(watch.model)
    }
    if(watch.brand)
    {
      if (params.length > 0) sql += ','

        sql += ' brand = ?'
        params.push(watch.brand)
    }
    if(watch.price)
    {
      if (params.length > 0) sql += ','

        sql += ' price <= ?'
        params.push(watch.price)
    }
    if(watch.quantity)
    {
      if (params.length > 0) sql += ','

        sql += ' quantity >= ?'
        params.push(watch.quantity)
    }

    // to check for duplicate model and brand in watch table
    if(watch.model && watch.brand)
    {
        let sql = 'SELECT brand , model FROM watch WHERE model = ? AND brand = ?'
        const findWatch = await this.watchRepository.execute(sql,[watch.model,watch.brand])
        if(findWatch)
        {
            throw new HttpErrors.Conflict("this watch already exist with same brand and model")
        }
    }
    else if(watch.brand)
    {
        console.log({brand:findWatch[0].brand})
        let sql = 'SELECT brand , model FROM watch WHERE model = ? AND brand = ?'
        const checkDuplicate = await this.watchRepository.execute(sql,[findWatch[0].model,watch.brand])
        if(checkDuplicate.length > 0)
        {
            throw new HttpErrors.Conflict("this watch already exist with same brand and model")
        }
    }
    else if(watch.model)
    {
        console.log({model:findWatch[0].model})
        let sql = 'SELECT brand , model FROM watch WHERE model = ? AND brand = ?'
        const checkDuplicate = await this.watchRepository.execute(sql,[watch.model,findWatch[0].brand])
        if(checkDuplicate.length > 0)
        {
          console.log({checkDuplicate})
            throw new HttpErrors.Conflict("this watch already exist with same brand and model")
        }

    }

    sql += ' WHERE id = ?'
    params.push(id)
    const updateWatch = await this.watchRepository.execute(sql,params)
    if(!updateWatch)
    {
        throw new HttpErrors.BadRequest("no update happened")
    }
    

    return  {
        Msg:"updated successfully",
       // updateWatch
    }

  }


  async hardDelete(id:string){

    console.log({id})

    const idArray = id.split(',').map(id => parseInt(id)).filter(idd => !isNaN(idd));

    console.log({idArray})
    if (idArray.length === 0) {
      throw new HttpErrors.BadRequest('Invalid IDs provided');
    }

    // Perform the bulk delete operation
    const result = await this.watchRepository.deleteAll({
      id: {inq: idArray},
    })

    if (result.count === 0) {
      throw new HttpErrors.NotFound('No records found with the provided IDs');
    }

    // const findWatch = await this.watchRepository.findById(idArray)
    // if(!findWatch)
    // {
    //     throw new HttpErrors.NotFound("id not found")
    // }

    //  await this.watchRepository.deleteById(id)
     return {
      Msg:"watches deleted successfully"
  }
  }

  async softDelete(id:string){


    console.log({id})

    const idArray = id.split(',').map(id => parseInt(id)).filter(idd => !isNaN(idd))

    console.log({idArray})
    if (idArray.length === 0) {
      throw new HttpErrors.BadRequest('Invalid IDs provided')
    }

   const result = await this.watchRepository.updateAll(
    {isDeleted: true},
    {id: {inq: idArray}}
  )

  if (result.count === 0) {
    throw new HttpErrors.NotFound('No records found with the provided IDs');
  }

    // const findWatch = await this.watchRepository.findById(id)
    // if(!findWatch)
    // {
    //     throw new HttpErrors.NotFound("id not found")
    // }
    
    //  await this.watchRepository.updateById(id,{isDeleted:true})
     return {
      Msg:"watches deleted successfully"
  }
  }


  async searchForWatch(id:number|undefined,brand:string|undefined,model:string|undefined,price:number|undefined){

    
    let sql = 'SELECT * FROM watch WHERE '
    let params:Array<string|number> = []

    if (id !== undefined) {
      if (params.length > 0) sql += ' AND '
        sql += ' id = ?'
        params.push(id)
    }
    if (brand !== undefined) {
      if (params.length > 0) sql += ' AND '
      sql += ' brand = ?'
      params.push(brand)
    }
    if (model !== undefined) {
      if (params.length > 0) sql += ' AND '
        sql += ' model = ?'
        params.push(model)
      }

      if(price)
      {
        if (params.length > 0) sql += ' AND '
        sql += ' price <= ?'
        params.push(price)
      }

     // sql += ' AND isDeleted = false '

      if(params.length <= 0)
      {
        throw new HttpErrors.BadRequest("nothing entered")
      }


    const query = await this.watchRepository.execute(sql,params)
    if(query.length <= 0)
    {
      throw new HttpErrors.NotFound("nothing matched your preference")
    }
    return query
  }

  /*
   * Add service methods here
   */
}
