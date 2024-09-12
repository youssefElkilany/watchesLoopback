// import {MetadataAccessor, MetadataInspector} from '@loopback/core';

// Define a metadata key for roles
// export const AUTH_ROLES_KEY = MetadataAccessor.create<string[],MethodDecorator>('auth.roles');

// // Decorator to define roles for a route
// export function authorizeRoles(...roles: string[]) {
//   return function(target: any, propertyKey: string) {
//     MetadataInspector.defineMetadata(AUTH_ROLES_KEY, roles, target, propertyKey);
//   };
// }

// import {Provider} from '@loopback/core';
// import {
//   AuthorizationContext,
//   AuthorizationDecision,
//   AuthorizationMetadata,
//   Authorizer,
// } from '@loopback/authorization';
// import {repository} from '@loopback/repository';
// import { CustomerRepository } from '../repositories';
// import { HttpErrors, MiddlewareContext } from '@loopback/rest';


// export class RoleBasedAuthorizationProvider implements Provider<Authorizer> {
//   constructor(
//     @repository(CustomerRepository)
//     public customerRepository: CustomerRepository,
//   ) {}

//   value(): Authorizer {
//     return this.authorize.bind(this);
//   }

//   async authorize(
//     authorizationCtx: AuthorizationContext,
//     metadata: AuthorizationMetadata,
//   ): Promise<AuthorizationDecision> {
//     // const user = await authorizationCtx.principals[0]; // Get the authenticated user

//     // if (!user) {
//     //   return AuthorizationDecision.DENY;
//     // }

//     // const {request, response} = authorizationCtx;

//     //   console.log(`Request: ${request.method} ${request.url}`);

//     //   const authorization = request.headers['authorization'];
//     //   console.log({authorization});
//     //   if (!authorization?.startsWith('Bearer')) {
//     //     throw new HttpErrors.Unauthorized('bearer or Authorization header is missing');
//     //   }
//     const token = authorization.split('Bearer')[1];
//       console.log({token});
//       if (!token) {
//         throw new HttpErrors.Unauthorized('Token not found');
//       }

//       // try {
//         const decodedToken = jwt.verify(token, 'secret') as any;
//         console.log({decodedToken});
//         if (!decodedToken || !decodedToken.id) {
//           throw new HttpErrors.Unauthorized('Invalid token');
//         }

//         const findUser = await this.customerRepository.findById(decodedToken.id);
//         console.log({findUser})
//         if (!findUser) {
//           throw new HttpErrors.NotFound('User not found');
//         }


//     const userEntity = await this.customerRepository.findById(user.id);

//     if (!userEntity) {
//       return AuthorizationDecision.DENY;
//     }

//     const allowedRoles = metadata.allowedRoles ?? [];
//     if (allowedRoles.includes(String(userEntity.role))) {
//       return AuthorizationDecision.ALLOW;
//     }

//     return AuthorizationDecision.DENY;
//   }
// }


export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export type RoutePermission = {
  roles: string[] | string | {
    requiredRoles: string[];
    optionalRoles?: string[];
  };
};

export type RoutePermissions = Record<string, Record<any, RoutePermission>>;

// n3mlha ta5od awl /categories/ <= t2of 3nd sharta
// lw get mo3zm get byb2a admin m3ada elm7tag n3rf id bta3 user => orders , order-lines
export let routePermissions: RoutePermissions = {
  'protected-route': {
    GET: { roles: ['admin'] },
    POST: { roles: ['admin'] },
    PUT:{roles:['']},
    PATCH:{roles:['']},
    DELETE:{roles:['']}
  },
  'categories': {
    GET: { roles: ['admin'] }, // auth for deleted categries
    POST: { roles: ['admin'] }, 
    PUT:{roles:['admin']},
    PATCH:{roles:['admin']},
    DELETE:{roles:['admin']}
  },
  'customers': {
    GET: { roles: ['user','admin'] }, // auth for deleted watches
    POST: { roles: ['admin'] },
    PUT:{roles:['user','admin']},
    PATCH:{roles:['user','admin']},
    DELETE:{roles:['user','admin']}
  },
  'watches': {
    GET: { roles: ['admin'] }, // auth for deleted watches
    POST: { roles: ['admin'] },
    PUT:{roles:['admin']},
    PATCH:{roles:['admin']},
    DELETE:{roles:['admin']}
  },
  'watch-categories': {
    GET: { roles: ['user','admin'] },
    POST: { roles: ['admin'] },
    PUT:{roles:['admin']},
    PATCH:{roles:['admin']},
    DELETE:{roles:['admin']}
  },
  'orders': {
    GET: { roles: ['user'] },
    POST: { roles: ['user'] },
    PUT:{roles:['user']},
    PATCH:{roles:['user']},
    DELETE:{roles:['user']}
  },
  'order-lines': {
    GET: { roles: ['user'] },
    POST: { roles: ['user'] },
    PUT:{roles:['user']},
    PATCH:{roles:['user']},
    DELETE:{roles:['user']}
  },
  'order-shipments': {
    GET: { roles: ['user'] },
    POST: { roles: ['user'] },
    PUT:{roles:['user']},
    PATCH:{roles:['user']},
    DELETE:{roles:['user']}
  },


  // '/complex-route': {
  //   POST: {
  //     roles: {
  //       requiredRoles: ['admin'],
  //       optionalRoles: ['user'], // Optional roles
  //     },
  //   },
  // },
  // Add more routes with methods and allowed roles here
};