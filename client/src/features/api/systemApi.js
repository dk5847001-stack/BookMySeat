import { api } from './apiSlice.js';

export const systemApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getHealth: builder.query({
      query: () => '/health'
    })
  })
});

export const { useGetHealthQuery } = systemApi;
