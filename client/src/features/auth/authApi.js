import { api } from '../api/apiSlice.js';

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Auth']
    }),
    login: builder.mutation({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Auth']
    }),
    forgotPassword: builder.mutation({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body
      })
    }),
    resetPassword: builder.mutation({
      query: ({ token, password }) => ({
        url: `/auth/reset-password/${token}`,
        method: 'POST',
        body: { password }
      })
    }),
    verifyEmail: builder.mutation({
      query: (token) => ({
        url: `/auth/verify-email/${token}`,
        method: 'GET'
      })
    }),
    resendVerification: builder.mutation({
      query: (body) => ({
        url: '/auth/resend-verification',
        method: 'POST',
        body
      })
    }),
    getMe: builder.query({
      query: () => '/auth/me',
      providesTags: ['Auth']
    })
  })
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useGetMeQuery
} = authApi;
