import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const taskApi = createApi({
  reducerPath: "taskApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://127.0.0.1:8000/api/user/task/" }), // Replace with your API base URL for tasks
  endpoints: (builder) => ({
    createTask: builder.mutation({
      query: (taskData, access_token) => ({
        url: "create/",
        method: "POST",
        body: taskData,
        headers: {
          authorization: `Bearer ${access_token}`,
        },
      }),
    }),
    updateTask: builder.mutation({
      query: ({ taskId, taskData, access_token }) => ({
        url: `update/${taskId}/`,
        method: "PUT",
        body: taskData,
        headers: {
          authorization: `Bearer ${access_token}`,
        },
      }),
    }),
    deleteTask: builder.mutation({
      query: (taskId, access_token) => ({
        url: `delete/${taskId}/`,
        method: "DELETE",
        headers: {
          authorization: `Bearer ${access_token}`,
        },
      }),
    }),
  }),
});

export const { useCreateTaskMutation, useUpdateTaskMutation, useDeleteTaskMutation } = taskApi;
