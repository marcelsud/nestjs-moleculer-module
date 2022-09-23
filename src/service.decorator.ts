
import { applyDecorators, Injectable, SetMetadata } from '@nestjs/common';

export function Service(name: string) {
  return applyDecorators(
    SetMetadata('service', name),
    Injectable(),
  );
}
