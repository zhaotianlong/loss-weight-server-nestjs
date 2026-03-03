import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // 如果数据本身已经是规范格式，或者包含 data 和 meta (分页格式)
        if (data && typeof data === 'object') {
          // 处理分页格式 { data: [], meta: {} }
          if (data.data !== undefined && data.meta !== undefined) {
            return {
              code: 200,
              success: true,
              msg: 'success',
              data: data.data,
              meta: data.meta,
              timestamp: new Date().toISOString(),
            };
          }

          // 如果已经包含了 code 或 success
          if ('code' in data || 'success' in data) {
            return {
              code: data.code || 200,
              success: data.success !== false,
              msg: data.msg || data.message || 'success',
              data: data.data !== undefined ? data.data : data,
              timestamp: new Date().toISOString(),
            };
          }
        }

        return {
          code: 200,
          success: true,
          msg: 'success',
          data: data || null,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
