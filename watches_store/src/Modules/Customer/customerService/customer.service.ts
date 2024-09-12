import {injectable, /* inject, */ BindingScope} from '@loopback/core';
import { CustomerRepository } from '../../../repositories';
import { repository } from '@loopback/repository';
import { Customer, roles } from '../../../models';
import { HttpErrors } from '@loopback/rest';

@injectable({scope: BindingScope.TRANSIENT})
export class CustomerService {
  constructor(/* Add @inject to inject parameters */
    @repository(CustomerRepository)
      public customerRepository : CustomerRepository
  ) {}

  /*
   * Add service methods here
   */

  async getCustomers(filter:any):Promise<Customer[]>{
    return await this.customerRepository.find({where:{isDeleted:false},skip:filter.skip,limit:filter.limit,order:filter?.order})
  }

  async getDeletedCustomers():Promise<Customer[]>{
    return await this.customerRepository.find({where:{isDeleted:true}})
  }

  async getCustomerById(id:number):Promise<object>{
    const findCustomer = await this.customerRepository.findOne({where:{id,isDeleted:false}})
    if(!findCustomer)
    {
        throw new HttpErrors.NotFound("customer not found")
    }
    return {findCustomer}
  }

  async addCustomers(customer:Customer):Promise<Customer>{

    const checkName = await this.customerRepository.findOne({where:{name:customer.name}})
    if(checkName)
    {
        throw new HttpErrors.Conflict("name already exist")
    }
    if(roles.admin != customer?.role && roles.user != customer?.role)
    {
        throw new HttpErrors.BadRequest("wrong roles must be user or admin")
    }
    return await this.customerRepository.create(customer)
    }


    async addCustomersBulk(customer:Customer[]):Promise<Customer[]>{

        for(let i=0;i<customer.length;i++)
        {
            const checkName = await this.customerRepository.findOne({where:{name:customer[i].name}})
        if(checkName)
        {
            throw new HttpErrors.Conflict("name already exist")
        }
        }
        return await this.customerRepository.createAll(customer)
        }



    async updateCustomerById(id:number,name:string){

        
        const findCustomer = await this.customerRepository.findOne({where:{id}}) // elmfrood ageeb id mn middelware auth
        if(!findCustomer)
        {
            throw new HttpErrors.NotFound("id not found")
        }

        const findName = await this.customerRepository.findOne({where:{name}}) 
        if(findName)
        {
            throw new HttpErrors.Conflict("name already exist")
        }


         await this.customerRepository.updateById(id,{name})
       
         return {
        Msg:"customer updated successfully"
       }
        
    }

    async hardDelete(id:number){

        const findCustomer = await this.customerRepository.findById(id)
        if(!findCustomer)
        {
            throw new HttpErrors.NotFound("id not found ")
        }

        await this.customerRepository.deleteById(id);
        return {
            Msg:"customer deleted successfully"
        }
    }

    async softDelete(id:number){

        const findCustomer = await this.customerRepository.findById(id)
        if(!findCustomer)
        {
            throw new HttpErrors.NotFound("id not found")
        }//if i remove this exception hanlding loopback will still handle it 

        await this.customerRepository.updateById(id,{isDeleted:true});
        return {
            Msg:"customer deleted successfully"
        }
    }


    async searchForCustomer(id:number| undefined,name:string | undefined,role:string | undefined){

        const searchKey: any = {};

  
        if (id !== undefined) {
            searchKey.id = id;
          }

    if (name !== undefined) {
      searchKey.name = name;
    }

    if (role !== undefined) {
        searchKey.role = role;
      }

    if(Object.keys(searchKey).length === 0)
        {
            throw new HttpErrors.BadRequest("nothing entered to search")
        }

    const findCustomer = await this.customerRepository.find({where:searchKey})
    if(findCustomer.length <= 0)
    {
        throw new HttpErrors.NotFound("no customer matched your preference")
    }

    return findCustomer

    }
}


