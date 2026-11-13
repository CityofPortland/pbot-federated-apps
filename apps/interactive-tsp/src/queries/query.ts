import { query as graphqlQuery } from '@pbotapps/components';
import {
  assertName,
  Kind,
  OperationTypeNode,
  print,
  type ArgumentNode,
  type FieldNode,
  type ValueNode,
} from 'graphql';
import { errorProperties, getLogger } from '../logging';

const logger = getLogger(['interactive-tsp', 'graphql']);

export type QueryValue =
  | string
  | number
  | boolean
  | null
  | readonly QueryValue[]
  | { readonly [name: string]: QueryValue | undefined };

type QueryArguments = Readonly<Record<string, QueryValue | undefined>>;

type SelectedField = {
  args?: QueryArguments;
  select?: QuerySelection;
};

export type QuerySelection = {
  readonly [field: string]: boolean | SelectedField;
};

export type QueryOptions = SelectedField & {
  field: string;
} & Omit<Parameters<typeof graphqlQuery>[0], 'operation' | 'variables'>;

function nameNode(value: string) {
  return { kind: Kind.NAME, value: assertName(value) } as const;
}

function valueNode(value: QueryValue): ValueNode {
  if (value === null) return { kind: Kind.NULL };
  if (typeof value === 'string') return { kind: Kind.STRING, value };
  if (typeof value === 'boolean') return { kind: Kind.BOOLEAN, value };
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error('GraphQL arguments must contain finite numbers.');
    }
    return {
      kind: Number.isInteger(value) ? Kind.INT : Kind.FLOAT,
      value: String(value),
    };
  }
  if (Array.isArray(value)) {
    return { kind: Kind.LIST, values: value.map(valueNode) };
  }
  return {
    kind: Kind.OBJECT,
    fields: Object.entries(value)
      .filter((entry): entry is [string, QueryValue] => entry[1] !== undefined)
      .map(([name, value]) => ({
        kind: Kind.OBJECT_FIELD,
        name: nameNode(name),
        value: valueNode(value),
      })),
  };
}

function fieldNode(field: string, { args, select }: SelectedField): FieldNode {
  const arguments_: ArgumentNode[] = Object.entries(args ?? {})
    .filter((entry): entry is [string, QueryValue] => entry[1] !== undefined)
    .map(([name, value]) => ({
      kind: Kind.ARGUMENT,
      name: nameNode(name),
      value: valueNode(value),
    }));

  const selections =
    select &&
    Object.entries(select)
      .filter(([, selection]) => selection !== false)
      .map(([name, selection]) =>
        fieldNode(name, typeof selection === 'boolean' ? {} : selection)
      );

  if (selections?.length === 0) {
    throw new Error('GraphQL selections must contain at least one field.');
  }

  return {
    kind: Kind.FIELD,
    name: nameNode(field),
    arguments: arguments_,
    selectionSet: selections
      ? { kind: Kind.SELECTION_SET, selections }
      : undefined,
  };
}

export async function query<T>({
  field,
  args,
  select,
  ...options
}: QueryOptions) {
  const started = performance.now();

  logger.debug('Query started: {field}', { field });

  try {
    const operation = print({
      kind: Kind.DOCUMENT,
      definitions: [
        {
          kind: Kind.OPERATION_DEFINITION,
          operation: OperationTypeNode.QUERY,
          selectionSet: {
            kind: Kind.SELECTION_SET,
            selections: [fieldNode(field, { args, select })],
          },
        },
      ],
    });

    const response = await graphqlQuery<T>({ ...options, operation });

    const properties = {
      field,
      durationMs: performance.now() - started,
      errorCount: response.errors?.length ?? 0,
      hasData: response.data != null,
    };

    if (properties.errorCount || !properties.hasData) {
      logger.warning(
        'Query returned errors or missing data: {field}',
        properties
      );
    } else {
      logger.debug('Query returned: {field}', properties);
    }

    return response;
  } catch (error) {
    logger.error('Query failed: {field}', {
      field,
      durationMs: performance.now() - started,
      ...errorProperties(error),
    });

    throw error;
  }
}
