// import {Middleware, MiddlewareContext} from '@loopback/rest';

// export async function logMiddleware(
//   context: MiddlewareContext,
//   next: ,
// ) {
//   const {request} = context;
//   console.log(`Request: ${request.method} ${request.url}`);

//   // Call the next middleware in the chain
//   const result = await next();

//   console.log(`Response status: ${context.response.statusCode}`);

//   return result;
// }


// import {inject, Interceptor, InvocationContext, Provider} from '@loopback/core';
// import {HttpErrors, MiddlewareContext, MiddlewareNext, RestBindings} from '@loopback/rest';
// import {intercept} from '@loopback/core';
// // import {AuthMiddleware} from './middleware/auth.middleware';

// class AuthInterceptor implements Provider<Interceptor> {
//   constructor(
//     @inject('middleware.auth') private authMiddleware: AuthMiddleware,
//   ) {}

//   value(): Interceptor {
//     return async (invocationCtx: InvocationContext, next: Function) => {
//       const ctx = invocationCtx.getSync<MiddlewareContext>(
//         RestBindings.Http.CONTEXT,
//       );

//       const nextMiddleware: MiddlewareNext = async () => {
//         return await next();
//       };

//       await this.authMiddleware.value()(ctx, nextMiddleware);
//     };
//   }
// }

// export class MyController {
//   constructor() {}

//   @intercept(AuthInterceptor)
//   @get('/protected-route')
//   protectedRoute(): string {
//     return 'Hello, authenticated user!';
//   }
// }


///// dah elsh8aaal ===================================
// import {MiddlewareContext, Middleware, HttpErrors} from '@loopback/rest';
// import  jwt  from 'jsonwebtoken';
// import { CustomerRepository } from '../repositories';
// import { repository } from '@loopback/repository';
// import { Provider } from '@loopback/core';

// export class AuthMiddelware implements Provider<Middleware> {
//     constructor(
//         @repository(CustomerRepository) public customerRepository:CustomerRepository
//     ){}

//       value(): Middleware  {
//         return async(ctx: MiddlewareContext,next
//         )=> {
//         const {request, response} = ctx;
      
//         console.log(`Request: ${request.method} ${request.url}`);
      
//         const authorization = request.headers['authorization']
//         console.log({authorization})
//         if(!authorization?.startsWith('BearerKey'))
//         {
//           throw new HttpErrors.Unauthorized("no auth found")
//         }
      
//         const token = authorization.split('Bearer')[1]
//         console.log({token})
//         if(!token)
//         {
//           throw new HttpErrors.Unauthorized("no auth found")
//         }
      
//         const decodedToken = jwt.verify(token,'secret') as any
//         console.log({decodedToken})
//         if(!decodedToken)
//         {
//           throw new HttpErrors.Unauthorized("no auth found")
//         }

//        const findUser = await this.customerRepository.find({where:{id:decodedToken.id}})
//        console.log({findUser})
//        if(!findUser)
//        {
//         throw new HttpErrors.NotFound("user not found")
//        }

//       //  (request as any).user  = findUser
//       //  console.log({user:(request as any).user})
//       ctx.bind('auth.user').to(findUser);
      
//         // Call the next middleware in the chain
//         await next();
      
//         console.log(`Response status: ${response.statusCode}`);
//       };
//       }
        

// }
// ==========================================================
// export const auth: Middleware = async (
//     ctx: MiddlewareContext,next
//   //  @repository(CustomerRepository)  customerRepository:CustomerRepository
//   )=> {
//   const {request, response} = ctx;

//   console.log(`Request: ${request.method} ${request.url}`);

//   const authorization = request.headers['authorization']
//   if(!authorization?.startsWith('BearerKey'))
//   {
//     throw new HttpErrors.Unauthorized("no auth found")
//   }

//   const token = authorization.split('Bearer')[1]
//   if(!token)
//   {
//     throw new HttpErrors.Unauthorized("no auth found")
//   }

//   const decodedToken = jwt.verify(token,'secret')
//   if(!decodedToken)
//   {
//     throw new HttpErrors.Unauthorized("no auth found")
//   }
  
//  // const findUser = await customerRepository.find()

//   // Call the next middleware in the chain
//   await next();

//   console.log(`Response status: ${response.statusCode}`);
// };










import {Provider, inject} from '@loopback/core';
import {Middleware, MiddlewareContext, HttpErrors, RestBindings, FindRoute} from '@loopback/rest';
import {repository} from '@loopback/repository';
import {CustomerRepository} from '../repositories';
import * as jwt from 'jsonwebtoken';
import { HttpMethod, routePermissions } from './authorization';




export class AuthMiddleware implements Provider<Middleware> {
  constructor(
    @repository(CustomerRepository) public customerRepository: CustomerRepository,
    @inject(RestBindings.SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
  ) {}

  value(): Middleware  {
    return async (ctx: MiddlewareContext, next) => {
      const {request, response} = ctx;

      console.log(`Request: ${request.method} ${request.url}`);

      const authorization = request.headers['authorization'];
      console.log({authorization});
      if (!authorization?.startsWith('Bearer')) {
        throw new HttpErrors.Unauthorized('bearer or Authorization header is missing');
      }

      const token = authorization.split('Bearer')[1];
      console.log({token});
      if (!token) {
        throw new HttpErrors.Unauthorized('Token not found');
      }

     // try {
        const decodedToken = jwt.verify(token, 'secret') as any;
        console.log({decodedToken});
        if (!decodedToken || !decodedToken.id) {
          throw new HttpErrors.Unauthorized('Invalid token');
        }

        const findUser = await this.customerRepository.findOne({where:{id:decodedToken.id,isDeleted:false}});
        console.log({findUser})
        if (!findUser) {
          throw new HttpErrors.NotFound('User not exist')
        }

        ctx.bind('auth.user').to(findUser);
        const route = this.findRoute(request);

        let controllerName =  route.spec.tags?.join('')
        console.log({controllerName})
        let methodName = route.spec.operationId?.split('.')[1]
        console.log({methodName})

        //const allowedRoles = Reflect.getMetadata(AUTH_ROLES_KEY, route.spec.);
       // const allowedRoles = Reflect.getMetadata(AUTH_ROLES_KEY, OrderLinesController.prototype,'protectedRoute' );

       
        // console.log({allowedRoles})
        // if (allowedRoles && !allowedRoles.includes(findUser.role)) { // name => role
        //   throw new HttpErrors.Forbidden('You do not have the required role to access this resource');
        // }

        const routePath = request.url;
      const method = request.method as HttpMethod
console.log({routePath})
      // Define role-based access for specific routes
      // const routePermissions: Record<string, string[]> = {
      //   '/protected-route': ['admin','user'],
      //   '/user-only': ['user', 'admin'],
      //   // Add more routes and allowed roles here
      // };

/////console.log({routePermissions})
     ////// const allowedRoles = routePermissions[routePath];
    ////  let requestMethodArr  = Array(allowedRoles.GET.roles) // nkml mn hena
      //let arr = [...Array(requestMethod)]
    /////  console.log({requestMethodArr})
    /////  console.log({allowedRoles})
      // if (allowedRoles && !allowedRoles.includes(String(findUser.role))) {
      //   throw new HttpErrors.Forbidden('You do not have the required role to access this resource.');
      // }


      /// el gdeeed ============

      // removing slashes from route and removing '?' if route have query param
      // i only need to know which model to know authorization of each API
      let splitedRoute = routePath.split('/')[1].split('?')[0]
      console.log({splitedRoute})
      const permission:any = routePermissions[splitedRoute]?.[method]
      console.log({permission})

    if (!permission) {
      throw new HttpErrors.Forbidden('No permissions are defined for this route and method.');
    }

    const { roles } = permission;
    console.log({roles})

      if (!roles.includes(findUser.role)) {
        throw new HttpErrors.Forbidden('You are not authorized to access this API.');
      }
    

      // } catch (err) {
      //   throw new HttpErrors.Unauthorized('Token verification failed');
      // }

      await next();

      console.log(`Response status: ${response.statusCode}`);
    };
  }
}
