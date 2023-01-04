import { GraphQLInt } from 'graphql';
import {
  Arg,
  Args,
  Authorized,
  ClassType,
  Mutation,
  Query,
  Resolver,
} from 'type-graphql';
import { DataSource, DeleteResult } from 'typeorm';
import { PaginationArgs } from './args';

// interface IBaseResolver {
//   getOne(uuid: string): Promise<any>;
//   getAll(args: PaginationArgs): Promise<any>;
//   delete(uuid: string): Promise<DeleteResult>;
// }

export function createBaseResolver<T extends ClassType, U extends ClassType>(
  suffix: string,
  objectType: T,
  findInputType: U,
  dataSource: DataSource,
  authorization?: {
    delete: unknown[];
    find: unknown[];
  }
): any {
  @Resolver(() => objectType, { isAbstract: true })
  abstract class BaseResolver {
    @Query(() => objectType, { name: `get${suffix}` })
    async getOne(@Arg('uuid') uuid: string) {
      const x = await dataSource.manager.findOneByOrFail(objectType, {
        uuid,
      });

      return x;
    }

    @Query(() => objectType, { name: `findOne${suffix}` })
    async findOne(@Arg('data') data: U) {
      const x = await dataSource.manager.findOneByOrFail(
        objectType,
        data as typeof findInputType
      );

      return x;
    }

    @Query(() => GraphQLInt, { name: `get${suffix}Count` })
    async getCount() {
      const x = await dataSource.manager.count(objectType);

      return x;
    }

    @Query(() => [objectType], { name: `getAll${suffix}` })
    getAll(@Args() { skip, take }: PaginationArgs) {
      return dataSource.manager.find(objectType, { skip, take });
    }

    @Query(() => objectType, { name: `findAll${suffix}` })
    async findAll(@Arg('data') data: U & PaginationArgs) {
      const x = await dataSource.manager.find(
        objectType,
        data as typeof findInputType & PaginationArgs
      );

      return x;
    }

    @Mutation(() => objectType, { name: `delete${suffix}` })
    @Authorized([...authorization.delete])
    async delete(@Arg('uuid') uuid: string): Promise<DeleteResult> {
      const result = await dataSource.manager.delete(objectType, { uuid });

      return result;
    }
  }

  @Resolver(() => objectType, { isAbstract: true })
  abstract class AuthorizedBaseResolver {
    @Query(() => objectType, { name: `findOne${suffix}` })
    @Authorized([...authorization.find])
    async findOne(@Arg('data') data: U) {
      const x = await dataSource.manager.findOneByOrFail(
        objectType,
        data as typeof findInputType
      );

      return x;
    }

    @Query(() => GraphQLInt, { name: `get${suffix}Count` })
    @Authorized([...authorization.find])
    async getCount() {
      const x = await dataSource.manager.count(objectType);

      return x;
    }

    @Query(() => objectType, { name: `findAll${suffix}` })
    @Authorized([...authorization.find])
    async findAll(@Arg('data') data: U & PaginationArgs) {
      const x = await dataSource.manager.find(
        objectType,
        data as typeof findInputType & PaginationArgs
      );

      return x;
    }

    @Mutation(() => objectType, { name: `delete${suffix}` })
    @Authorized([...authorization.delete])
    async delete(@Arg('uuid') uuid: string): Promise<DeleteResult> {
      const result = await dataSource.manager.delete(objectType, { uuid });

      return result;
    }
  }

  return authorization ? AuthorizedBaseResolver : BaseResolver;
}
