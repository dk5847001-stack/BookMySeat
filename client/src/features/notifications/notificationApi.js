import { api } from '../api/apiSlice.js';

export const notificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: () => '/notifications',
      providesTags: ['Notification']
    }),
    markNotificationsRead: builder.mutation({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PATCH'
      }),
      invalidatesTags: ['Notification']
    }),
    sendReminderEmails: builder.mutation({
      query: () => ({
        url: '/notifications/send-reminders',
        method: 'POST'
      }),
      invalidatesTags: ['Notification']
    })
  })
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationsReadMutation,
  useSendReminderEmailsMutation
} = notificationApi;
