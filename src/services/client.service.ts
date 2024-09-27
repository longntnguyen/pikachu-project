import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

type ResponseBaseModel<T> = {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  timestamp: Date;
  message: string[];
  data: T;
};
export type SuccessResponseBaseModel<T = null> = ResponseBaseModel<T>;

const axiosClient = axios.create({
  baseURL: "https://pokeapi.co/api/v2/",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 1000 * 60 * 5,
});

export const service = {
  get: <Output>(url: string, config?: AxiosRequestConfig) =>
    axiosClient.get<Output>(url, config).then((res) => res.data),
  post: <Output, Input>(
    url: string,
    data: Input,
    config?: AxiosRequestConfig
  ) =>
    axiosClient
      .post<
        SuccessResponseBaseModel<Output>,
        AxiosResponse<SuccessResponseBaseModel<Output>>,
        Input
      >(url, data, config)
      .then((res) => res.data),
  delete: <Output = null>(url: string, config?: AxiosRequestConfig) =>
    axiosClient
      .delete<SuccessResponseBaseModel<Output>>(url, config)
      .then((res) => res.data),
  put: <Output, Input>(url: string, data: Input, config?: AxiosRequestConfig) =>
    axiosClient
      .put<
        SuccessResponseBaseModel<Output>,
        AxiosResponse<SuccessResponseBaseModel<Output>>,
        Input
      >(url, data, config)
      .then((res) => res.data),
  patch: <Output, Input>(
    url: string,
    data: Input,
    config?: AxiosRequestConfig
  ) =>
    axiosClient
      .patch<
        SuccessResponseBaseModel<Output>,
        AxiosResponse<SuccessResponseBaseModel<Output>>,
        Input
      >(url, data, config)
      .then((res) => res.data),
};
