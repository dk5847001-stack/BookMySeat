import { api } from '../api/apiSlice.js';

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUserDashboard: builder.query({
      query: () => '/dashboard/me',
      providesTags: ['Dashboard', 'Booking']
    }),
    getAdminDashboard: builder.query({
      query: () => '/dashboard/admin',
      providesTags: ['Dashboard', 'Booking', 'Event', 'User']
    }),
    updateProfile: builder.mutation({
      query: (body) => ({
        url: '/dashboard/profile',
        method: 'PATCH',
        body
      }),
      invalidatesTags: ['Auth', 'Dashboard']
    })
  })
});

export const {
  useGetUserDashboardQuery,
  useGetAdminDashboardQuery,
  useUpdateProfileMutation
} = dashboardApi;
