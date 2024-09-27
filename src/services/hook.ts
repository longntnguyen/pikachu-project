import { QueryKey, useQuery, UseQueryOptions } from "@tanstack/react-query";

type ApiQueryProps<Output, TransformedOutput> = UseQueryOptions<
  Output,
  unknown,
  TransformedOutput,
  QueryKey
>;

export const useApiQuery = <Output, TransformedOutput = Output>(
  props: ApiQueryProps<Output, TransformedOutput>
) => {
  return useQuery<Output, unknown, TransformedOutput>({
    ...props,
  });
};
