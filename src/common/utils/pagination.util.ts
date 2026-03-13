import { Repository, FindOptionsWhere, FindManyOptions } from 'typeorm';
import { PaginationDto, PaginatedResult, PaginationMeta } from '../dto/pagination.dto';

export async function paginate<T>(
  repository: Repository<T>,
  paginationDto: PaginationDto,
  options?: FindManyOptions<T>,
): Promise<PaginatedResult<T>> {
  const { page = 1, limit = 20 } = paginationDto;
  const skip = (page - 1) * limit;

  const [data, total] = await repository.findAndCount({
    ...options,
    skip,
    take: limit,
  });

  const meta = new PaginationMeta(total, page, limit);

  return {
    data,
    meta,
  };
}

export function getPaginationParams(paginationDto: PaginationDto) {
  const { page = 1, limit = 20 } = paginationDto;
  const skip = (page - 1) * limit;

  return {
    skip,
    take: limit,
  };
}
