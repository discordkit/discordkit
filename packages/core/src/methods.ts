import type { z } from "zod";
import type { RequestParams } from "./addParams.ts";
import { buildURL } from "./buildURL.ts";
import type { RequestBody } from "./request.ts";
import { request } from "./request.ts";

export type Fetcher<
  S extends z.ZodTypeAny | null = null,
  R = void
> = S extends null
  ? () => Promise<R>
  : (config: z.infer<NonNullable<S>>) => Promise<R>;

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
