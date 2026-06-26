import { api } from '../api/apiSlice.js';

export const bookingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createBooking: builder.mutation({
      query: (body) => ({
        url: '/bookings',
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
    getMyBookings: builder.query({
      query: () => '/bookings/mine',
      providesTags: ['Booking']
    }),
    validateTicket: builder.mutation({
      query: (ticketCode) => ({
        url: `/bookings/validate/${ticketCode}`,
        method: 'POST'
      }),
      invalidatesTags: ['Booking']
    })
  })
});

export const {
  useCreateBookingMutation,
  useGetMyBookingsQuery,
  useValidateTicketMutation
} = bookingApi;
