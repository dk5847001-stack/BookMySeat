import { api } from '../api/apiSlice.js';

export const paymentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createPaymentOrder: builder.mutation({
      query: (body) => ({
        url: '/payments/orders',
        method: 'POST',
        body
      })
    }),
    verifyPayment: builder.mutation({
      query: (body) => ({
        url: '/payments/verify',
        method: 'POST',
        body
      }),
      invalidatesTags: (_result, _error, { eventId }) => [
        'Booking',
        'Event',
        'Notification',
        { type: 'Seat', id: eventId }
      ]
    }),
    getMyOrders: builder.query({
      query: () => '/payments/orders/mine',
      providesTags: ['Booking']
    }),
    refundOrder: builder.mutation({
      query: (orderId) => ({
        url: `/payments/refund/${orderId}`,
        method: 'POST'
      }),
      invalidatesTags: ['Booking', 'Event', 'Notification', 'Seat']
    })
  })
});

export const {
  useCreatePaymentOrderMutation,
  useVerifyPaymentMutation,
  useGetMyOrdersQuery,
  useRefundOrderMutation
} = paymentApi;
