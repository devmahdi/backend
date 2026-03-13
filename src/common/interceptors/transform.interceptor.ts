import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  meta?: any;
  error?: null;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // If data already has the response shape, return as-is
        if (data && typeof data === 'object' && ('data' in data || 'meta' in data)) {
          return {
            data: data.data !== undefined ? data.data : data,
            meta: data.meta || null,
            error: null,
          };
        }

        // Otherwise, wrap it in the standard shape
        return {
          data,
          meta: null,
          error: null,
        };
      }),
    );
  }
}
