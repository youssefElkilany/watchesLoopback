
import {
    SequenceHandler,
    FindRoute,
    ParseParams,
    InvokeMethod,
    Send,
    Reject,
   MiddlewareContext,
   Middleware,
   Response,
   HttpErrors,
  } from '@loopback/rest';
  import {inject} from '@loopback/core';
  import {RestBindings} from '@loopback/rest';
import { AuthMiddleware } from './Middelware/authentication';
import logger from './Utils/logger';

export class MySequence implements SequenceHandler {
    constructor(
      @inject(RestBindings.SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
      @inject(RestBindings.SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
      @inject(RestBindings.SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
      @inject(RestBindings.SequenceActions.SEND) public send: Send,
      @inject(RestBindings.SequenceActions.REJECT) public reject: Reject,
      @inject('middleware.auth') private authMiddleware: Middleware, // Changed to Middleware
    ) {}
  
    async handle(context: MiddlewareContext): Promise<void> {
      const {request, response} = context;
      try {
        const route = this.findRoute(request); // to get route details from request
        // console.log({route:route.path})

        let routePath = request.url
        let splitedRoute = routePath.split('/')[1] // split slashes from route
       splitedRoute = splitedRoute.split('?')[0] // split ? if there are query params in route
      console.log({splitedRoute})
      
  
        if (route.path === '/protected-route' ||
          splitedRoute === 'customers' && (request.method === 'GET' || request.method === 'POST' || request.method === 'DELETE' || request.method === 'PUT' || request.method === 'PATCH') ||
          splitedRoute === 'orders' && (request.method === 'GET' || request.method === 'POST' || request.method === 'DELETE' || request.method === 'PUT' || request.method === 'PATCH') ||
          splitedRoute === 'order-lines' && (request.method === 'GET' || request.method === 'POST' || request.method === 'DELETE' || request.method === 'PUT' || request.method === 'PATCH') ||
          splitedRoute === 'order-shipments' && (request.method === 'GET' || request.method === 'POST' || request.method === 'DELETE' || request.method === 'PUT' || request.method === 'PATCH') ||
        splitedRoute === 'watches' && (request.method === 'POST' || request.method === 'DELETE' || request.method === 'PUT' || request.method === 'PATCH') || // ha5tsr dool fe includes w 23mlhom fe array 
        splitedRoute === 'categories' && (request.method === 'POST' || request.method === 'DELETE' || request.method === 'PUT' || request.method === 'PATCH') ||
        splitedRoute === 'watch-categories' && (request.method === 'POST' || request.method === 'DELETE' || request.method === 'PUT' || request.method === 'PATCH') || 
        route.path === '/categories/deleted' && (request.method === 'GET') || route.path === '/watches/deleted' && (request.method === 'GET') || route.path === '/customers/deleted' && (request.method === 'GET') || route.path === '/watch-categories/deleted' && (request.method === 'GET')
      ) {
        console.log({urlll:request.url,methoddd:request.method})
          await this.authMiddleware(context, async () => {
            const args = await this.parseParams(request, route);
           // console.log({args})
            const result = await this.invoke(route, args);
           // console.log({result}) // get result of endpoint
           // console.log({url:request.url,method:request.method})
            this.send(response, result); // send response to client
          });
        } else {
          const args = await this.parseParams(request, route);
          const result = await this.invoke(route, args);
          this.send(response, result);
        }
      } catch (err) {
        this.handleError(err,response)
       // this.reject(context, err);
      }
    }

    private handleError(err: Error, response: Response): void {
      // Log the error (optional)
      //console.error('Global error handler:', err);
      logger.error("error",err)
  
      // Determine the status code and message
      let statusCode = 500;
      let message = 'Internal server error';
  
      if (err instanceof HttpErrors.HttpError) {
        statusCode = err.statusCode;
       // message = err.message;
      } 
      // else if (err.name === 'ValidationError') {
      //   statusCode = 400; // Bad Request
      //   message = err.message;
      // }
  
      // Set the appropriate headers and status code
      response.status(statusCode).send({error: err});
    }
}