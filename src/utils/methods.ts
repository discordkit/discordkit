import type { z } from "zod";
import type { RequestParams } from "./addParams";
import { buildURL } from "./buildURL";
import type { RequestBody } from "./request";
import { request } from "./request";
import type { MutationBuilder } from "./types";

export const mutation = <T, S extends z.ZodTypeAny>(
  schema: S,
  fn: MutationBuilder<{ input: z.infer<S> }, T>
): MutationBuilder<{ input: z.infer<S> }, T> =>
  new Proxy(fn, {
    // eslint-disable-next-line @typescript-eslint/space-before-function-paren
    apply: async function (target, thisArg, args): Promise<T> {
      schema.parse(args[0]?.input);
      return target.apply(thisArg, args) as Promise<T>;
    }
  });

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
