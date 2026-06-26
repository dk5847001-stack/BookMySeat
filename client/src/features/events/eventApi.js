import { api } from '../api/apiSlice.js';

const toFormData = (values) => {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (key === 'imageFile') {
      if (value) formData.append('image', value);
      return;
    }
    if (Array.isArray(value)) {
      formData.append(key, value.join(','));
      return;
    }
    formData.append(key, value);
  });

  return formData;
};

export const eventApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query({
      query: (params) => ({
        url: '/events',
        params
      }),
      providesTags: ['Event']
    }),
    getFeaturedEvents: builder.query({
      query: () => '/events/featured',
      providesTags: ['Event']
    }),
    getTrendingEvents: builder.query({
      query: () => '/events/trending',
      providesTags: ['Event']
    }),
    createEvent: builder.mutation({
      query: (body) => ({
        url: '/events',
        method: 'POST',
        body: toFormData(body)
      }),
      invalidatesTags: ['Event']
    }),
    updateEvent: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/events/${id}`,
        method: 'PATCH',
        body: toFormData(body)
      }),
      invalidatesTags: ['Event']
    }),
    deleteEvent: builder.mutation({
      query: (id) => ({
        url: `/events/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Event']
    })
  })
});

export const {
  useGetEventsQuery,
  useGetFeaturedEventsQuery,
  useGetTrendingEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation
} = eventApi;
