import { BaseModel } from '@adonisjs/lucid/orm'
import type { Request } from '@adonisjs/core/http'
import { LucidModel, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'


interface DatabaseQueryBuilderMacros {
  exists(): Promise<boolean>
}

interface ModelQueryBuilderMacros<Model extends LucidModel, Result = InstanceType<Model>> {
  /**
   * Macro to add WHERE clauses for multiple columns with their respective values.
   * @param fields - The fields and their values to filter by.
   */
  whereEqual(fields: Record<string, any>): this

  /**
   * Macro to add a WHERE clause for the primary key of the model.
   * @param uid - The value of the primary key.
   */
  whereUid(uid: number): this

  /**
   * Macro to pluck a single column value from the resulting rows.
   * @param column - The name of the column to pluck.
   */
  pluck(column: string): Promise<Result[]>

  last(): Promise<Result>

  /**
   * Macro to find a record by its primary key.
   * @param uid - The value of the primary key.
   */
  find(uid: number): Promise<Result | null>

  /**
   * Macro to find a record by its primary key or throw an exception if not found.
   * @param uid - The value of the primary key.
   */
  findOrFail(uid: number): Promise<Result>

  /**
   * Macro to update records based on a query or throw an exception if no rows are affected.
   * @param data - The data to update.
   */
  updateOrFail(data: Record<string, any>): Promise<void>

  /**
   * Macro to delete records based on a query or throw an exception if no rows are affected.
   */
  deleteOrFail(): Promise<void>

  /**
   * Macro to check if any records match the query.
   */
  exists(): Promise<boolean>

  /**
   * Macro to exclude a specific model instance or UID from the query results.
   * @param modelOrId - The model instance or UID to exclude.
   */
  except(modelOrId: InstanceType<typeof BaseModel> | number | string): this

  /**
   * Macro to count the number of records matching the query.
   * @param column - The column or columns to count.
   */
  getCount<
    T extends string | object,
    R = T extends string ? number : { [K in keyof T]: number }
  >(column?: T): Promise<R>

  /**
   * TS Query setted by search()
   */
  _tsQuery?: string

  /**
   * Macro to perform a full-text search using PostgreSQL's built-in text search functionality.
   * @param query - The search query.
   * @param vectorColumn - The name of the column containing the search vector.
   */
  search(query: string, vectorColumn?: string): this

  /**
   * Macro to calculate the rank of search results based on their relevance to the search query.
   * @param vectorColumn - The name of the column containing the search vector.
   */
  rank(vectorColumn?: string): this

  /**
   * Macro to paginate query results using request parameters.
   * @param request - The HTTP request object containing pagination parameters.
   */
  paginateUsing(request: Request): ReturnType<ModelQueryBuilderContract<Model, Result>['paginate']>
}


declare module '@adonisjs/lucid/types/querybuilder' {
  interface DatabaseQueryBuilderContract extends DatabaseQueryBuilderMacros {}
}
declare module '@adonisjs/lucid/database' {
  interface DatabaseQueryBuilder extends DatabaseQueryBuilderMacros {}
}
declare module '@adonisjs/lucid/types/model' {
  interface ModelQueryBuilderContract<Model, Result> extends ModelQueryBuilderMacros<Model, Result> {}
}
declare module '@adonisjs/lucid/orm' {
  interface ModelQueryBuilder extends ModelQueryBuilderMacros<LucidModel> {}
}