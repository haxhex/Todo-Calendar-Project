import React, { useState, useEffect } from "react";
import { Typography, TextField, Button, Box, Alert, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, CircularProgress } from "@mui/material";
import { useSelector } from "react-redux";
import { useGetLoggedUserQuery } from "../services/userAuthApi";
import { useCreateTaskMutation, useUpdateTaskMutation, useDeleteTaskMutation } from "../services/taskApi";

const TaskManager = () => {
  const { access_token } = useSelector((state) => state.auth);
  const { data: userData, isSuccess, isError } = useGetLoggedUserQuery(access_token);

  const [tasks, setTasks] = useState([]);
  const [taskData, setTaskData] = useState({ title: "", description: "", due_date: "" });
  const [editTaskId, setEditTaskId] = useState(null);
  const [serverError, setServerError] = useState({});
  const [serverMsg, setServerMsg] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const [createTask, createTaskStatus] = useCreateTaskMutation();
  const [updateTask, updateTaskStatus] = useUpdateTaskMutation();
  const [deleteTask, deleteTaskStatus] = useDeleteTaskMutation();

  console.log("userData:", userData); // Check the value of userData

  useEffect(() => {
    if (isSuccess && userData?.tasks) { // Use optional chaining operator
      setTasks(userData.tasks);
    }
  }, [userData, isSuccess]);

  useEffect(() => {
    if (isError) {
      console.error("Error fetching user data");
      // You can show an error message to the user here, or handle the error in any other way.
      // For example, you can display an Alert or Snackbar component with the error message.
    }
  }, [isError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await createTask(taskData, access_token);
      if (res.error) {
        setServerMsg({});
        setServerError(res.error.data);
      } else if (res.data) {
        setServerError({});
        setServerMsg(res.data);
        setTaskData({ title: "", description: "", due_date: "" });
        setTasks((prevTasks) => [...prevTasks, res.data]);
      }
    } catch (error) {
      console.error(error);
      setServerError({ non_field_errors: ["An error occurred while creating the task."] });
    }
    setIsLoading(false);
  };

  const handleEditTask = async () => {
    setIsLoading(true);
    try {
      const res = await updateTask({ taskId: editTaskId, taskData, access_token });
      if (res.error) {
        setServerMsg({});
        setServerError(res.error.data);
      } else if (res.data) {
        setServerError({});
        setServerMsg(res.data);
        setEditTaskId(null);
        setTaskData({ title: "", description: "", due_date: "" });
        setTasks((prevTasks) => prevTasks.map((task) => (task.id === res.data.id ? res.data : task)));
      }
    } catch (error) {
      console.error(error);
      setServerError({ non_field_errors: ["An error occurred while updating the task."] });
    }
    setIsLoading(false);
  };

  const handleDeleteTask = async (taskId) => {
    setIsLoading(true);
    try {
      const res = await deleteTask(taskId, access_token);
      if (res.error) {
        setServerMsg({});
        setServerError(res.error.data);
      } else if (res.data) {
        setServerError({});
        setServerMsg(res.data);
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      }
    } catch (error) {
      console.error(error);
      setServerError({ non_field_errors: ["An error occurred while deleting the task."] });
    }
    setIsLoading(false);
  };

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "column", flexWrap: "wrap", maxWidth: 600, mx: 4 }}>
        <Typography variant="h4">Task Manager</Typography>
        <Box component="form" noValidate onSubmit={editTaskId ? handleEditTask : handleCreateTask}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="title"
            name="title"
            label="Title"
            value={taskData.title}
            onChange={handleInputChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="description"
            name="description"
            label="Description"
            multiline
            rows={4}
            value={taskData.description}
            onChange={handleInputChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="due_date"
            name="due_date"
            label="Due Date"
            type="date"
            value={taskData.due_date}
            onChange={handleInputChange}
          />
          <Box textAlign="center">
            <Button type="submit" variant="contained" sx={{ mt: 3, mb: 2, px: 5 }} disabled={isLoading}>
              {isLoading ? "Saving..." : editTaskId ? "Update Task" : "Create Task"}
            </Button>
          </Box>
          {serverError.non_field_errors ? (
            <Alert severity="error">{serverError.non_field_errors[0]}</Alert>
          ) : (
            ""
          )}
          {serverMsg.msg ? <Alert severity="success">{serverMsg.msg}</Alert> : ""}
        </Box>

        {createTaskStatus.isLoading || updateTaskStatus.isLoading || deleteTaskStatus.isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100px" }}>
            <CircularProgress />
          </Box>
        ) : (
          <List sx={{ mt: 4 }}>
            {tasks.map((task) => (
              <ListItem key={task.id}>
                <ListItemText primary={task.title} secondary={`Due Date: ${task.due_date}`} />
                <ListItemSecondaryAction>
                  <IconButton onClick={() => setEditTaskId(task.id)} disabled={isLoading}>
                    Edit
                  </IconButton>
                  <IconButton onClick={() => handleDeleteTask(task.id)} disabled={isLoading}>
                    Delete
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </>
  );
};

export default TaskManager;
