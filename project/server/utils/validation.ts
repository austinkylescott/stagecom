import { getQuery, readBody } from "h3";
import type { H3Event } from "h3";
import type { z, ZodIssue, ZodTypeAny } from "zod";

type ValidationSource = "body" | "params" | "query";

const formatIssues = (issues: ZodIssue[]) =>
  issues.map((issue) => ({
    code: issue.code,
    message: issue.message,
    path: issue.path.length > 0 ? issue.path.join(".") : null,
  }));

const throwValidationError = (
  source: ValidationSource,
  issues: ZodIssue[],
): never => {
  throw createError({
    statusCode: 400,
    statusMessage: "Validation failed",
    data: {
      error: "validation_error",
      source,
      issues: formatIssues(issues),
    },
  });
};

const parseWithSchema = <TSchema extends ZodTypeAny>(
  source: ValidationSource,
  schema: TSchema,
  input: unknown,
): z.output<TSchema> => {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    throwValidationError(source, parsed.error.issues);
  }

  return parsed.data;
};

export const parseParams = <TSchema extends ZodTypeAny>(
  event: H3Event,
  schema: TSchema,
): z.output<TSchema> => parseWithSchema("params", schema, event.context.params);

export const parseQueryParams = <TSchema extends ZodTypeAny>(
  event: H3Event,
  schema: TSchema,
): z.output<TSchema> => parseWithSchema("query", schema, getQuery(event));

export const parseBody = async <TSchema extends ZodTypeAny>(
  event: H3Event,
  schema: TSchema,
): Promise<z.output<TSchema>> => {
  const body = await readBody(event);
  return parseWithSchema("body", schema, body);
};
