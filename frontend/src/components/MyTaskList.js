import React, { Component } from "react";
import axios from "axios";
import "./styles.css"; 
import { getToken } from "../services/LocalStorageService";
import "react-datepicker/dist/react-datepicker.css";
import { Link } from "react-router-dom";


class MyTaskList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewCompleted: false,
      activeItem: {
        title: "",
        description: "",
        completed: false,
        send_email_notification: false,
        due_date: new Date(),
        end_time: "", 
        duration: "", 
        file: [],
        tags: [],
        task_list: "",
      },
      todoList: [],
      modal: false, // To control the modal visibility
      fileList: [], // To store the selected files in the modal
      startDate: null, // Start date for filtering
      endDate: null,   // End date for filtering
      filteredList: [], // Filtered tasks based on date and completion status
      selectedTags: [], // To store the selected tags for filtering
      timeInput: "", // Initialize timeInput state to an empty string
      selectedTasks: [], // Initialize selectedTasks as an empty array     
      newDueDate: null, // Initialize newDueDate state to null
      tasksList: [],
      newTaskListName: "", // Initialize newTaskListName state to an empty string
      showNewTaskListInput: false,
    };
  }

  handleStartDateChange = (date) => {
    this.setState({ startDate: date });
  };

  handleEndDateChange = (date) => {
    this.setState({ endDate: date });
  };
  
  componentDidMount() {
    this.refreshList();    
  }
  
  handleTagToggle = (tag) => {
    const { selectedTags } = this.state;
    if (selectedTags.includes(tag)) {
      this.setState({ selectedTags: selectedTags.filter((t) => t !== tag) });
    } else {
      this.setState({ selectedTags: [...selectedTags, tag] });
    }
  };
  
  handleTagRemove = (tag) => {
    const { selectedTags } = this.state;
    this.setState({ selectedTags: selectedTags.filter((t) => t !== tag) });
  };

  handleTimeInputChange = (event) => {
    this.setState({ timeInput: event.target.value });
  };

  handleNewDueDateChange = (date) => {
    this.setState({ newDueDate: date });
  };

  handleChangeDueDate = () => {
    const { newDueDate, selectedTasks, todoList } = this.state;

    if (!newDueDate) {
      alert("Please select a new due date.");
      return;
    }

    if (selectedTasks.length === 0) {
      alert("Please select at least one task before changing the due date.");
      return;
    }

    // Create an array to store the updated tasks
    const updatedTasks = [];

    // Update the due_date of the selected tasks
    const updatedTodoList = todoList.map((task) => {
      if (selectedTasks.includes(task.id)) {
        // Format the newDueDate to YYYY-MM-DD
        const formattedDueDate = newDueDate.toISOString().slice(0, 10);

        // Add the updated task to the array
        updatedTasks.push({ id: task.id, due_date: formattedDueDate });

        return { ...task, due_date: formattedDueDate }; // Store as Date object
      }
      return task;
    });

    // Update the state with the updated todoList and reset the selectedTasks and newDueDate
    this.setState({
      todoList: updatedTodoList,
      selectedTasks: [],
      newDueDate: null,
    });

    console.log('updatedTodoList: ', updatedTodoList);

    // Send the updated tasks to the backend
    this.updateTaskToBackend(updatedTasks);
  };
  

  refreshList = () => {
    const { userId } = this.props;
    const { access_token } = getToken();

    console.log(`UserId: ${userId}`)
    axios
      .get(`http://127.0.0.1:8000/api/user/api/task/`, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      })
      .then(res => {
        // Log the data received from the GET request
        console.log("Data from GET request:", res.data);
        this.setState({ todoList: res.data });
      })      
      .catch(err => console.log(err));

      axios
      .get(`http://127.0.0.1:8000/api/user/tasklists/`, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      })
      .then(res => {
        // Log the data received from the GET request
        console.log("Task List from GET request:", res.data);
        this.setState({ tasksList: res.data });
      })      
      .catch(err => console.log(err));

  };

  deleteTaskList = (taskListId) => {
    const { access_token } = getToken();
    axios
      .delete(`http://127.0.0.1:8000/api/user/tasklists/${taskListId}`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      .then(res => {
        console.log("Task List deleted successfully:", res.data);
        // Update the state to remove the deleted Task List
        this.setState(prevState => ({
          tasksList: prevState.tasksList.filter(taskList => taskList.id !== taskListId),
        }));
      })
      .catch(error => {
        console.log("Error deleting Task List:", error);
        // Handle the error if needed
      });
  };
  
  handleTaskListNameChange = (event, taskListId) => {
    console.log('handleTaskListNameChange triggered with taskListId:', taskListId);
    const { tasksList } = this.state;
  
    const updatedTasksList = tasksList.map((taskList) => {
      if (taskList.id === taskListId) {
        return {
          ...taskList,
          name: event.target.value,
        };
      }
      return taskList;
    });
  
    this.setState({ tasksList: updatedTasksList });
  };
  

  handleTaskListEdit = (event) => {
    event.preventDefault();
    const { access_token } = getToken();
    const { tasksList, editingTaskListId } = this.state;
    const taskListData = tasksList.find((taskList) => taskList.id === editingTaskListId);
    
    // Make sure taskListData is correctly populated with the changes

    axios
      .put(`http://127.0.0.1:8000/api/user/tasklists/${taskListData.id}/`, taskListData, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      .then(res => {
        console.log("Task List updated successfully:", res.data);
        // Update the state with the edited Task List
        this.setState({ editingTaskListId: null });
      })
      .catch(error => {
        console.log("Error updating Task List:", error);
        // Handle the error if needed
      });
  };

  editTaskList = (taskList) => {
    this.setState({ editingTaskListId: taskList.id });
  };

  handleNewTaskListNameChange = (event) => {
    this.setState({ newTaskListName: event.target.value });
  };
  
  handleNewTaskListSubmit = (event) => {
    event.preventDefault();
    const { access_token } = getToken();
    const { newTaskListName } = this.state;
    const taskListData = { name: newTaskListName };
    axios
      .post(`http://127.0.0.1:8000/api/user/tasklists/`, taskListData, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      .then(res => {
        console.log("Task List created successfully:", res.data);
        // Update the state with the new Task List
        this.setState(prevState => ({
          tasksList: [...prevState.tasksList, res.data],
          newTaskListName: "",
          showNewTaskListInput: false,
        }));
      })
      .catch(error => {
        console.log("Error creating Task List:", error);
        // Handle the error if needed
      });
  };

  handleCancelNewTaskList = () => {
    this.setState({ showNewTaskListInput: false });
  };
  
  renderTaskLists = () => {
    const { tasksList, editingTaskListId, newTaskListName, showNewTaskListInput } = this.state;
    return (
      <ul>
        {tasksList.map((taskList) => (
          <li key={taskList.id}>
            {editingTaskListId === taskList.id ? (
              <form onSubmit={this.handleTaskListEdit}>
              <input
                type="text"
                value={taskList.name}
                onChange={(event) => this.handleTaskListNameChange(event, taskList.id)}
                style={{
                  border: '1px solid #a3a8ad',
                  borderRadius: '0.5rem',
                  padding: '5px',
                  marginLeft: '5px',
                  marginBottom: '10px'
                }}
              />
              <button className="btn btn-success" type="submit">ذخیره</button>
            </form>

            ) : (
              <>
              <div style={{ backgroundColor: '#dddddd', marginBottom: '10px', borderRadius: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Link style={{ marginRight: '10px', textDecoration: 'none' }} to={`/task-lists/${taskList.id}/${taskList.name}`}>{taskList.name}</Link>
                </div>
                <div>
                  <button onClick={() => this.editTaskList(taskList)} className="btn btn-primary" style={{ border: 'none', marginLeft: '5px', marginBottom: '20px', marginRight: '5px', marginTop: '20px' }}>ویرایش</button>
                  <button onClick={() => this.deleteTaskList(taskList.id)} className="btn btn-secondary" style={{ backgroundColor: 'red', border: 'none', marginLeft: '20px', marginBottom: '20px', marginTop: '20px' }}>حذف</button>
                </div>
              </div>
              </>
            )}
          </li>
        ))}
        {showNewTaskListInput ? (
          <li>
            <form onSubmit={this.handleNewTaskListSubmit}>
              <input
                type="text"
                value={newTaskListName}
                onChange={this.handleNewTaskListNameChange}
                style={{ border: '1px solid #dddddd', borderRadius: '0.3rem', padding: '5px'}}
              />
              <button type="submit" className="btn btn-secondary" style={{backgroundColor: 'green', border: 'green', margin: '10px'}} >ایجاد لیست جدید</button>
              <button type="button" className="btn btn-secondary" style={{backgroundColor: 'red', border: 'red'}} onClick={this.handleCancelNewTaskList}>لغو</button>
            </form>
          </li>
        ) : (
          <li>
            <button className="btn btn-secondary" onClick={() => this.setState({ showNewTaskListInput: true })}>
            ایجاد لیست جدید
            </button>
          </li>
        )}
      </ul>
    );
  };
  
  render() {
    return (
      <div>
        {this.renderTaskLists()}
      </div>
    );
  }
}

export default MyTaskList;
