import { HttpException, HttpStatus } from '@nestjs/common';

export class AreaNotFoundException extends HttpException {
  constructor() {
    super('Area not found', HttpStatus.NOT_FOUND);
  }
}

export class InvalidGeometryException extends HttpException {
  constructor() {
    super('Invalid geometry data', HttpStatus.BAD_REQUEST);
  }
}

export class DuplicateAreaCodeException extends HttpException {
  constructor() {
    super('Area code already exists in this ward', HttpStatus.CONFLICT);
  }
}
