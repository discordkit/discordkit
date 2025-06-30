import type { GenericSchema, GenericSchemaAsync, InferOutput } from "valibot";
import type { RequestParams } from "./addParams.js";
import { buildURL } from "./buildURL.js";
import type { RequestBody } from "./request.js";
import { request } from "./request.js";

export type Fetcher<
  /** A schema to validate the input arguments of a fetch call */
  S extends GenericSchema | GenericSchemaAsync | null = null,
  /** The return value expected from the fetch call */
  R = void
> = S extends null
  ? () => Promise<R>
  : (config: InferOutput<NonNullable<S>>) => Promise<R>;

export const get = async <T>(url: string, params?: RequestParams): Promise<T> =>
  request(buildURL(url, params));

export const post = async <T>(url: string, body?: RequestBody): Promise<T> =>
  request(buildURL(url), `POST`, body);

export const put = async <T>(url: string, body?: RequestBody): Promise<T> =>
  request(buildURL(url), `PUT`, body);

export const patch = async <T>(url: string, body?: RequestBody): Promise<T> =>
  request(buildURL(url), `PATCH`, body);

export const remove = async <T = void>(url: string): Promise<T> =>
  request(buildURL(url), `DELETE`);
