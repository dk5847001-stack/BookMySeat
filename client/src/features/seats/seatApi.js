import { api } from '../api/apiSlice.js';

export const seatApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSeats: builder.query({
      query: (eventId) => `/seats/${eventId}`,
      providesTags: (_result, _error, eventId) => [{ type: 'Seat', id: eventId }]
    }),
    lockSeats: builder.mutation({
      query: ({ eventId, seats }) => ({
        url: `/seats/${eventId}/lock`,
        method: 'POST',
        body: { seats }
      }),
      invalidatesTags: (_result, _error, { eventId }) => [{ type: 'Seat', id: eventId }]
    }),
    releaseSeats: builder.mutation({
      query: ({ eventId, seats }) => ({
        url: `/seats/${eventId}/release`,
        method: 'POST',
        body: { seats }
      }),
      invalidatesTags: (_result, _error, { eventId }) => [{ type: 'Seat', id: eventId }]
    }),
    bookSeats: builder.mutation({
      query: ({ eventId, seats }) => ({
        url: `/seats/${eventId}/book`,
        method: 'POST',
        body: { seats }
      }),
      invalidatesTags: (_result, _error, { eventId }) => [
        { type: 'Seat', id: eventId },
        'Booking',
        'Event'
      ]
    })
  })
});

export const {
  useGetSeatsQuery,
  useLockSeatsMutation,
  useReleaseSeatsMutation,
  useBookSeatsMutation
} = seatApi;
