import React, { Component } from "react";
import axios from "axios";
import Modal from "./Modal";
import "./styles.css"; 
import { getToken } from "../services/LocalStorageService";
import "react-datepicker/dist/react-datepicker.css";
import TimeField from 'react-simple-timefield';
import "persian-date-picker-reactjs/styles.css";
import JalaliDatePicker from './JalaliDatePicker';
import moment from 'moment-jalaali';
import persianJs from 'persianjs';


class ATaskList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewCompleted: false,
      activeItem: {
        title: "",
        description: "",
        is_event: false, // Add the new is_event field to the state
        completed: false,
        send_email_notification: false,
        due_date: new Date(),
        end_time: "", 
        duration: "", 
        file: [],
        tags: [],
        task_list: ""
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
      endingSoonTasks: [], // To store tasks ending soon (within 1 hour)
      endedNotCompletedTasks: [], // To store tasks that have ended but not completed
      isDropdownOpen: false,
      searchQuery: "", // Initialize the search query state
      filtered: false,
      copyInNewDueDate: null,
    };
  }

  toggleDropdown = () => {
    this.setState((prevState) => ({ isDropdownOpen: !prevState.isDropdownOpen }));
  };  

  handleStartDateChange = (date) => {
    this.setState({ startDate: new Date(date) });
  };

  handleEndDateChange = (date) => {
    this.setState({ endDate: new Date(date) });
  };
  
  componentDidMount() {
    this.refreshList();
    this.calculateEndingSoonAndEndedNotCompletedTasks();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.todoList !== this.props.todoList ||
      prevState.viewCompleted !== this.state.viewCompleted ||
      prevState.filteredList !== this.state.filteredList
    ) {
      this.calculateEndingSoonAndEndedNotCompletedTasks();
    }
  }

  calculateEndingSoonAndEndedNotCompletedTasks = () => {
    const { todoList, filteredList } = this.state;
    const tasksToCheck = filteredList.length > 0 ? filteredList : todoList;
    const now = moment(); // Get the current time

    // Calculate tasks ending soon (within 1 hour) and tasks that have ended but not completed
    const endingSoonTasks = [];
    const endedNotCompletedTasks = [];

    tasksToCheck.forEach((item) => {
      const { end_time, completed, due_date } = item;
      const formattedDueDate = new Date(due_date).toISOString().slice(0, 10);

      const isDueToday = moment(formattedDueDate).isSame(now, 'day');
      const isDueLast = moment(formattedDueDate).isBefore(now, 'day');
      console.log('isDueLast: ', isDueLast)

      // Parse the end time (HH:mm:ss)
      let endHours, endMinutes;
      if (end_time) {
        [endHours, endMinutes] = end_time.split(':').map(Number);
      } else {
        // Handle the case when end_time is null
        endHours = 0;
        endMinutes = 0;
      }
      
      // Get the current time (HH:mm:ss)
      const now_time = new Date();
      const currentHours = now_time.getHours();
      const currentMinutes = now_time.getMinutes();

      // Calculate the remaining time in minutes
      const remainingMinutes = endHours * 60 + endMinutes - (currentHours * 60 + currentMinutes);

      // Check if the task's end time is 1 hour or less away from now
      const isEndingSoon = remainingMinutes > 0 && remainingMinutes <= 60;
      const isEnded = remainingMinutes < 0;

      if (isDueLast && !completed) {
        endedNotCompletedTasks.push(item);
      }

      
      if (isDueToday && isEnded && !completed) {
        endedNotCompletedTasks.push(item);
      }

      if (isDueToday && isEndingSoon && !completed) {
        endingSoonTasks.push(item);
      }

    });

    this.setState({
      endingSoonTasks,
      endedNotCompletedTasks,
    });
  };

  
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

  handleCopyInNewDueDateChange = (date) => {
    this.setState({ copyInNewDueDate: date });
  };

  handleChangeDueDate = () => {
    const { newDueDate, selectedTasks, todoList } = this.state;

    if (!newDueDate) {
      alert("لطفا یک تاریخ برای موعد جدید انتخاب کنید.");
      return;
    }

    if (selectedTasks.length === 0) {
      alert(" لطفا پیش از تعیین تاریخ برای موعد جدید حداقل یک کارانتخاب کنید.");
      return;
    }

    // Create an array to store the updated tasks
    const updatedTasks = [];

    // Update the due_date of the selected tasks
    const updatedTodoList = todoList.map((task) => {
      if (selectedTasks.includes(task.id)) {
        // Format the newDueDate to YYYY-MM-DD
        // const formattedDueDate = newDueDate.toISOString().slice(0, 10);
        const formattedDueDate = newDueDate;

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

    // Send the updated tasks to the backend
    this.updateTaskToBackend(updatedTasks);
  };

  copyTaskInNewDueDate = () => {
    const { copyInNewDueDate, selectedTasks, todoList } = this.state;
  
    if (!copyInNewDueDate) {
      alert("لطفا یک تاریخ برای موعد جدید انتخاب کنید.");
      return;
    }
  
    if (selectedTasks.length === 0) {
      alert(" لطفا پیش از تعیین تاریخ برای موعد جدید حداقل یک کار انتخاب کنید.");
      return;
    }
  
    const { access_token } = getToken();
  
    // Loop through the selected tasks and post each copied task
    selectedTasks.forEach(taskId => {
      const taskToCopy = todoList.find(task => task.id === taskId);
      if (taskToCopy) {
        const copiedTask = { ...taskToCopy, due_date: copyInNewDueDate };
        const formattedDueDate = new Date(copiedTask.due_date).toISOString().slice(0, 10);
        const formattedItem = { ...copiedTask, due_date: formattedDueDate, is_event: copiedTask.is_event };
  
        const formData = new FormData();
        formData.append("title", formattedItem.title);
        formData.append("description", formattedItem.description);
        formData.append("completed", formattedItem.completed);
        formData.append("due_date", formattedItem.due_date);
        formData.append("end_time", formattedItem.end_time || "");
        formData.append("duration", formattedItem.duration || "");
        formData.append("is_event", formattedItem.is_event); // Append is_event field
        formData.append("send_email_notification", formattedItem.send_email_notification); // Append is_event field
  
        // Append tags to formData
        formattedItem.tags.forEach(tag => {
          formData.append("tags", tag.text); // Assuming the tag object has a 'text' property
        });
  
        // Append files to formData
        formattedItem.files.forEach(fileObj => {
          if (fileObj.id) {
            // File from the server, use the file property
            formData.append("files", fileObj.file);
          } else {
            // Newly uploaded file, use the file property with its name
            formData.append("files", fileObj.file, fileObj.name);
          }
        });
  
        // Send the formData to the backend using post
        axios
          .post('http://127.0.0.1:8000/api/user/api/task/', formData, {
            headers: {
              'Authorization': `Bearer ${access_token}`,
              'Content-Type': 'multipart/form-data',
            }
          })
          .then(response => {
            console.log('Copied task posted successfully:', response);
            // Refresh the list or perform other actions as needed
          })
          .then(response => this.refreshList())
          .catch(error => {
            console.log('Error posting copied task:', error);
            // Handle the error if needed
          });
      }
    });
    this.setState({
      selectedTasks: [],
      copyInNewDueDate: null,
    });
  };


  handleTimeChange = (newTime) => {
    const { hour, minute } = newTime;
    const formattedTime = `${hour}:${minute}`;

    const activeItem = { ...this.state, timeInput: formattedTime };
    this.setState({ activeItem });
  };
  

  refreshList = () => {
    const { userId, taskListId } = this.props;
    const { access_token } = getToken();
  
    console.log(`UserId: ${userId}`);
    console.log("Fetching tasks for Task List ID:", taskListId);
  
    axios
      .get(`http://127.0.0.1:8000/api/user/api/task/`, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        },
        params: {
          task_list: taskListId
        }
      })
      .then(res => {
        // Set '00:00:00' for end_time and duration when they are null
        const todoList = res.data;
  
        // Sort the todoList array by due_date in ascending order,
        // and then by end_time in ascending order
        todoList.sort((a, b) => {
          const dueDateComparison = new Date(a.due_date) - new Date(b.due_date);
          if (dueDateComparison !== 0) {
            return dueDateComparison;
          } else {
            if (a.end_time === null && b.end_time === null) {
              return 0;
            } else if (a.end_time === null) {
              return -1;
            } else if (b.end_time === null) {
              return 1;
            } else {
              const endTimeA = a.end_time.split(':').map(Number);
              const endTimeB = b.end_time.split(':').map(Number);
              return endTimeA[0] - endTimeB[0] || endTimeA[1] - endTimeB[1];
            }
          }
        });
  
        this.setState({ todoList });
      })
      .catch(err => console.log(err));
  };

    // Add a method to update the search query
    handleSearchChange = (event) => {
      this.setState({ searchQuery: event.target.value }, () => {
        this.filterByDates(); // Call filterByDates after updating the search query
      });
    };
  
  renderTabList = () => {
    const { viewCompleted, selectedTags, searchQuery, } = this.state;
    const { todoList } = this.state;
    // Collect all unique tags from the todoList
    const allTags = [...new Set(todoList.flatMap((item) => {    
      return item.tags.map((tag) => {
        if (typeof tag == 'object'){
          return tag.text;
        } else {
          return tag;
        }
      });
    }))];
      return (
      <div className="tab-list" 
      style={{
        marginBottom: '0',
      }}>
        <div class="col-sm-17" style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center",
          border: '1px solid #d7d7d7',
          padding: '10px',
          borderRadius: '0.3rem',
          width: '98%',
          }}>
        <TimeField
          value={this.state.timeInput}
          onChange={(event, value) => {
            this.setState({ timeInput: value });
          }}
          colon=":"
          style={{
            fontSize: "16px", // Adjust the font size as needed
            // Add more styles as required
            marginLeft: "7px",
            border: '1px solid #dfdfdf',
            padding: '5px',
            width: '55px',
            borderRadius: '0.3rem',
          }}
        />
        <button onClick={() => this.handleTimeOperation("add")} className="btn btn-primary"  style={{ marginLeft: '3px', backgroundColor: 'green', border: 'green', borderRadius:'10rem' }}>افزودن زمان</button>
        <button onClick={() => this.handleTimeOperation("subtract")} className="btn btn-primary"  style={{ marginRight: '5px', backgroundColor: 'red', border: 'red', borderRadius:'10rem' }}>کاهش زمان</button>
        <label className="new-date" style={{marginLeft: '5px', marginRight: '20px'}}>تاریخ جدید: </label>
        {this.state.newDueDate ? (
          <JalaliDatePicker
          selected={this.state.newDueDate}
          onChange={this.handleNewDueDateChange}
          />
          ):(
            <JalaliDatePicker
            selected={this.state.newDueDate}
            onChange={this.handleNewDueDateChange}
            inputStyles={{ color: 'white', marginLeft: '5px' }}
          />
          )}
        <button onClick={this.handleChangeDueDate} className="btn btn-primary"  style={{ marginRight: '5px', backgroundColor: 'orange', border: 'orange', borderRadius: '10rem' }}>انتقال</button>
      <label className="new-date" style={{marginLeft: '5px', marginRight: '20px'}}>تاریخ جدید: </label>
        {this.state.copyInNewDueDate ? (
          <JalaliDatePicker
          selected={this.state.copyInNewDueDate}
          onChange={this.handleCopyInNewDueDateChange}
          />
          ):(
            <JalaliDatePicker
            selected={this.state.copyInNewDueDate}
            onChange={this.handleCopyInNewDueDateChange}
            inputStyles={{ color: 'white', marginLeft: '5px' }}
          />
          )}
        <button onClick={this.copyTaskInNewDueDate} className="btn btn-primary"  style={{ marginRight: '5px', backgroundColor: 'orange', border: 'orange', borderRadius: '10rem' }}>کپی</button>
        </div>
      <div style={{
        border: '1px solid #dcdcdc',
        borderRadius: '0.3rem',
        padding: '15px',
        marginTop: '10px',
        width: '98%',
        textAlign: 'center',
        }}>
        <div className="filter-container" 
        style={{ 
          marginTop: '5px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        >
          <label>از تاریخ:</label>
          {this.state.startDate ? (
          <JalaliDatePicker
          selected={this.state.startDate}
          onChange={this.handleStartDateChange}
          />
          ):(
            <JalaliDatePicker
            selected={this.state.startDate}
            onChange={this.handleStartDateChange}
            inputStyles={{ color: 'white' }}
          />
          )}
          <label style={{marginRight: '15%'}}>تا تاریخ:</label>
          {this.state.endDate ? (
          <JalaliDatePicker
          selected={this.state.endDate}
          onChange={this.handleEndDateChange}
          />
          ):(
            <JalaliDatePicker
            selected={this.state.endDate}
            onChange={this.handleEndDateChange}
            inputStyles={{ color: 'white' }}
          />
          )}
        </div>
        <div className="filter-container" style={{ marginTop: '8px'}}>
        <label style={{}}>برچسب ها:</label>
        <div className="tag-list">
          {allTags.map((tag) => (
            <span
              key={tag}
              className={`tag-item ${selectedTags.includes(tag) ? "selected" : ""}`}
              onClick={() => this.handleTagToggle(tag)}
              style={{ color: 'white' }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
        <button onClick={this.filterByDates} className="btn btn-primary" style={{ marginLeft: '5px', marginTop: '5px', backgroundColor: 'green', border: 'green', borderRadius:'10rem' }}>اعمال فیلترها</button>
        <button onClick={this.clearFilters} className="btn btn-primary" style={{ marginLeft: '5px', marginTop: '5px', backgroundColor: 'red', border: 'red', borderRadius:'10rem' }}>پاک کردن همه فیلترها</button> {/* Add the Clear Filters button */}
        </div>
        <div style={{ border: '1px solid #ccc', borderRadius: '0.3rem', width: '98%', marginTop: '10px'}}>
        <div className="filter-container" style={{ padding: '10px'}}>
          {/* Add the search input */}
          <label style={{}}>عنوان وظیفه یا رویداد:</label>
          <input
            type="text"
            value={searchQuery}
            onChange={this.handleSearchChange}
            placeholder=""
            style={{ marginLeft: '5px', padding: '5px', borderRadius: '0.3rem', border: '1px solid #ccc' }}
          />
        </div>
        </div>
        <div className="toggle-container" style={{ marginTop: '10px'}}>
          <span
            onClick={() => this.displayCompleted(true)}
            className={viewCompleted ? "active" : ""}
          >
            تمام شده
          </span>
          <span
            onClick={() => this.displayCompleted(false)}
            className={!viewCompleted ? "active" : ""}
          >
            ناتمام
          </span>
        </div>
      </div>
    );
  };
    
  
  filterByDates = () => {
    const { startDate, endDate, todoList, selectedTags, searchQuery } = this.state;
    let filteredList = todoList;
  
    if (startDate && endDate) {
      filteredList = filteredList.filter((item) => {
        const dueDate = new Date(item.due_date);
        return dueDate >= startDate && dueDate <= endDate;
      });
    }
  
    if (selectedTags.length > 0) {
      filteredList = filteredList.filter((item) =>
        item.tags.some((tag) => selectedTags.includes(tag))
      );
    }

    if (searchQuery) {
      filteredList = filteredList.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

  
    this.setState({ filteredList, filtered: true });
  };
  

  displayCompleted = (status) => {
    this.setState({ viewCompleted: status });
  };
  
  clearFilters = () => {
    this.setState({
      startDate: null,
      endDate: null,
      filteredList: [],
      selectedTags: [],
      searchQuery: "",
      filtered: false,
    });
  };

  addMinutesToDate = (date, minutes) => {
    const addedTime = new Date(date.getTime() + minutes * 60000)
    return addedTime;
  };

  subtractMinutesFromDate = (date, minutes) => {
    return new Date(date.getTime() - minutes * 60000);
  };

  handleTaskSelection = (taskId) => {
    const { selectedTasks } = this.state;
    if (selectedTasks.includes(taskId)) {
      this.setState({ selectedTasks: selectedTasks.filter((id) => id !== taskId) });
    } else {
      this.setState({ selectedTasks: [...selectedTasks, taskId] });
    }
  };

updateTaskToBackend = (updatedTasks) => {
  const { access_token } = getToken();

  // Loop through each task in the array and update them
  updatedTasks.forEach((updatedTask) => {
    // Update the task in the backend
    axios
      .put(`http://127.0.0.1:8000/api/user/api/task/${updatedTask.id}/`, updatedTask, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      .then((res) => {
        console.log("Task updated successfully:", res.data);
      })
      .catch((error) => {
        console.log("Error updating task:", error);
        // Handle the error if needed
      });
  });
};

  
handleTimeOperation = (operation) => {
  const { timeInput, selectedTasks, todoList } = this.state;

  // Validate the time input (HH:mm format)
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(timeInput)) {
    alert("Invalid time format. Please enter time in HH:mm format.");
    return;
  }

  if (selectedTasks.length === 0) {
    alert("لطفا حداقل یک وظیفه یا رویداد پیش از افزایش یا کاهش زمان انتخاب کنید");
    return;
  }

  // Convert the time input to minutes
  const [hours, minutes] = timeInput.split(":").map((part) => parseInt(part));
  const totalMinutes = hours * 60 + minutes;

  // Create an array to store the updated tasks
  const updatedTasks = [];

  // Update the end_time of the selected tasks based on the operation
  const updatedTodoList = todoList.map((task) => {
    if (selectedTasks.includes(task.id)) {
      const endTime = new Date(`${task.due_date}T${task.end_time}`);
      const newEndTime =
        operation === "add"
          ? this.addMinutesToDate(endTime, totalMinutes)
          : this.subtractMinutesFromDate(endTime, totalMinutes);

      // Format the newEndTime to 'hh:mm:ss'
      const hours = newEndTime.getHours().toString().padStart(2, "0");
      const minutes = newEndTime.getMinutes().toString().padStart(2, "0");
      const seconds = newEndTime.getSeconds().toString().padStart(2, "0");
      const formattedEndTime = `${hours}:${minutes}:${seconds}`;

      // Add the updated task to the array
      updatedTasks.push({ id: task.id, end_time: formattedEndTime });

      return { ...task, end_time: formattedEndTime }; // Store as Date object
    }
    return task;
  });

  // Update the state with the updated todoList and reset the selectedTasks and timeInput
  this.setState({
    todoList: updatedTodoList,
    selectedTasks: [],
    timeInput: "",
  });

  // Send the updated tasks to the backend
  this.updateTaskToBackend(updatedTasks);
};

  renderItems = () => {
    const { viewCompleted, filteredList, todoList, selectedTasks, filtered } = this.state;
    const tasksToRender = (filteredList.length > 0 || filtered) ? filteredList : todoList;

    const filteredAndCompleted = tasksToRender.filter(
      (item) => item.completed === viewCompleted
    );

    const now = moment(); // Get the current time

    return filteredAndCompleted.map(item => {
      const { id, title, description, due_date, end_time, duration, completed, is_event } = item;
      console.log('end_time ', end_time)
      const formattedDueDate = new Date(due_date).toISOString().slice(0, 10);
      const tgs = [];
      for (let i = 0; i < item.tags.length; i++) {
        const tag = item.tags[i];
        if (!tag.id) {
          tgs.push({ id: tag, text: tag });
        } else {
          tgs.push(tag);
        }
      }
      // Check if the task is due today
      const isDueToday = moment(formattedDueDate).isSame(now, 'day');
      const isDueLast = moment(formattedDueDate).isBefore(now, 'day');

      // Check if the task's end time is 1 hour or less away from now
      // Parse the end time (HH:mm:ss)
      const [endHours, endMinutes] = end_time
      ? end_time.split(':').map(Number)
      : [0, 0];
      
      // Get the current time (HH:mm:ss)
      const now_time = new Date();
      const currentHours = now_time.getHours();
      const currentMinutes = now_time.getMinutes();
      // Calculate the remaining time in minutes
      const remainingMinutes = endHours * 60 + endMinutes - (currentHours * 60 + currentMinutes);
      // Check if the task's end time is 1 hour or less away from now
      const isEndingSoon = remainingMinutes > 0 && remainingMinutes <= 60;
      const isEnded = remainingMinutes < 0;

      let hours, minutes;
      if (end_time !== null) {
        [hours, minutes] = end_time.split(":").map(Number);
      } else {
        hours = 0;
        minutes = 0;
      }
      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      const tagDivs = tgs.map((tag, index) => (
        <div
          key={index}
          style={{
            display: 'inline-block',
            border: '1px solid',
            borderRadius: '10px',
            padding: '5px',
            margin: '5px',
            color: 'white',
            backgroundColor: '#9c27b0'
          }}
        >
          {tag.text}
        </div>
      ));
      return (
        <li
          key={id}
          className={`list-group-item d-flex flex-column ${completed ? 'completed' : ''}`}
        >
          <label className="d-flex align-items-center">
            <input
              type="checkbox"
              checked={completed}
              onChange={() => this.handleCompleteToggle(item)}
              style={{marginLeft: '5px'}}
            />
            <span
              className={`todo-title ${viewCompleted ? "completed-todo" : ""}`}
              title={description}
            >
              {title}
            </span>
          </label>
          <div className="d-flex align-items-center">
            {is_event ? (
              <>
            <span className="mr-2" style={{ marginLeft: '15%' }}>
              تاریخ شروع: {persianJs(moment(formattedDueDate).format('jYYYY/jMM/jDD')).englishNumber().toString()}
            </span>
            {end_time ? (
                  <span className="mr-2 st-en-tm" style={{ marginLeft: '15%' }}>زمان شروع: {end_time && persianJs(formattedTime).englishNumber().toString()}</span>
                ) : (
                  <span className="mr-2 st-en-tm" style={{ marginLeft: '15%', visibility: 'hidden' }}>زمان شروع: {end_time && persianJs(formattedTime).englishNumber().toString()}</span>
                )}              
                </>
            ) : (
              <>
              <span className="mr-2" style={{marginLeft: '15%'}}>تاریخ انجام: {persianJs(moment(formattedDueDate).format('jYYYY/jMM/jDD')).englishNumber().toString()}</span>
              {end_time ? (
                  <span className="mr-2 st-en-tm" style={{ marginLeft: '15%' }}>زمان پایان: {end_time && persianJs(formattedTime).englishNumber().toString()}</span>
                ) : (
                  <span className="mr-2 st-en-tm" style={{ marginLeft: '15%', visibility: 'hidden' }}>زمان پایان: {end_time && persianJs(formattedTime).englishNumber().toString()}</span>
                )}
              </>
            )
            }
            {duration ? (<span className="mr-2 dur" style=
            {{marginLeft: '10%', 
            }}>مدت انجام: {persianJs(duration.toString()).englishNumber().toString()} دقیقه</span>) : (<span className="mr-2 dur" style=
            {{marginLeft: '10%', visibility: 'hidden',
            }}>مدت انجام: {duration} دقیقه</span>) }            
            <div className="edit-rmv-btn" style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => this.editItem(item)}
                className="btn btn-secondary mr-2"
                style={{ marginLeft: '5px' }}
              >
                ویرایش
              </button>
              <button
                onClick={() => this.handleDelete(item)}
                className="btn btn-danger"
                style={{ marginLeft: '5px' }}
              >
                حذف
              </button>
            </div>
          </div>
          <div className="d-flex align-items-center">
          <input
            type="checkbox"
            checked={selectedTasks.includes(id)}
            onChange={() => this.handleTaskSelection(id)}
            style={{marginLeft: '5px'}}
          />
          <span className="ml-2">انتخاب</span>
          <span className="mr-2"style={{fontSize: '12px', marginRight: '%'}}>{tagDivs}</span>
          </div>
        {/* Check if the task is due today and ending soon */}
        {isDueLast && !completed && (
          <div className="notification" title="مهلت به اتمام رسیده">
          <span className="notification-text"
          >
            <div className="btn" style={{ backgroundColor: 'red' }}></div>
          </span>
        </div>
        )}
        {end_time !== null && isDueToday && isEnded && !completed && (
          <div className="notification" title="مهلت به اتمام رسیده">
          <span className="notification-text">
            <div className="btn" style={{ backgroundColor: 'red' }}></div>
          </span>
        </div>
        )}
        {end_time !== null && isDueToday && isEndingSoon && !completed && (
          <div className="notification" title="مهلت نزدیک به اتمام">
          <span className="notification-text">
            <div className="btn" style={{ backgroundColor: 'orange' }}></div>
          </span>
        </div>
        )}
        </li>
      );
    });
  };
  
  handleCompleteToggle = (item) => {
    const { access_token } = getToken();
    const updatedItem = { ...item, completed: !item.completed };
    console.log('updatedItem: ', updatedItem)
    const formattedDueDate = new Date(item.due_date).toISOString().slice(0, 10);
    console.log('formattedDueDate: ', formattedDueDate)
  
    // Format the due_date to YYYY-MM-DD before sending to the backend
    const formattedItem = { ...item, due_date: formattedDueDate, is_event: item.is_event, completed: !item.completed }; // Include is_event field
    // Create a FormData object to include the file data
    const formData = new FormData();
    formData.append("title", formattedItem.title);
    formData.append("description", formattedItem.description);
    formData.append("completed", formattedItem.completed);
    formData.append("due_date", formattedItem.due_date);
    formData.append("end_time", formattedItem.end_time || "");
    formData.append("duration", formattedItem.duration || "");
    formData.append("is_event", formattedItem.is_event); // Append is_event field
    formData.append("send_email_notification", formattedItem.send_email_notification); // Append is_event field
    // formData.append("tags", formattedItem.tags); // Append is_event field
    // Append the tags data to the FormData object
    console.log('formattedItem.tags: ', formattedItem.tags)
    formattedItem.tags.forEach((tag) => {
      formData.append("tags", tag); // Assuming the tag object has a 'name' property
    });
  
  
    
    // Append the selected files to the FormData object
  formattedItem.files.forEach((fileObj) => {
    if (fileObj.id) {
      // File from the server, use the file property
      formData.append("files", fileObj.file);
    } else {
      // Newly uploaded file, use the file property with its name
      formData.append("files", fileObj.file, fileObj.name);
    }
  });
  
    // Append the tags data to the FormData object
    // formattedItem.tags.forEach((tag) => {
    //   formData.append("tags", tag.text); // Assuming the tag object has a 'name' property
    // });

    console.log('** formattedItem: ', formattedItem)
  
    axios
      .put(`http://127.0.0.1:8000/api/user/api/task/${item.id}/`, formData, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      })
      .then(res => {
        console.log("Task updated successfully:", res.data);
        this.refreshList();
      })
      .catch(error => {
        console.log("Error updating task:", error);
        // Handle the error if needed
      });
  };
  

  toggle = () => {
    this.setState({ modal: !this.state.modal });
  };

  handleSubmit =  item => {
    const { access_token } = getToken();
    // const { access_token } = useSelector((state) => state.auth);
    console.log(`Access Token Task: ${access_token}`)
    this.toggle();

          // Check if there are tasks to copy to a new due date
  if (this.state.selectedTasks.length > 0 && this.state.newDueDate) {
    // Call the function to copy tasks to the new due date
    this.copyTaskInNewDueDate();
  }
  
  const formattedDueDate = new Date(item.due_date).toISOString().slice(0, 10);
  console.log('formattedDueDate: ', formattedDueDate)

  // Format the due_date to YYYY-MM-DD before sending to the backend
  const formattedItem = { ...item, due_date: formattedDueDate, is_event: item.is_event }; // Include is_event field

  // Create a FormData object to include the file data
  const formData = new FormData();
  formData.append("title", formattedItem.title);
  formData.append("description", formattedItem.description);
  formData.append("completed", formattedItem.completed);
  formData.append("due_date", formattedItem.due_date);
  formData.append("end_time", formattedItem.end_time || "");
  formData.append("duration", formattedItem.duration || "");
  formData.append("is_event", formattedItem.is_event); // Append is_event field
  formData.append("send_email_notification", formattedItem.send_email_notification); // Append is_event field
  formData.append("task_list", formattedItem.task_list);


  
  // Append the selected files to the FormData object
formattedItem.files.forEach((fileObj) => {
  if (fileObj.id) {
    // File from the server, use the file property
    formData.append("files", fileObj.file);
  } else {
    // Newly uploaded file, use the file property with its name
    formData.append("files", fileObj.file, fileObj.name);
  }
});

  // Append the tags data to the FormData object
  formattedItem.tags.forEach((tag) => {
    formData.append("tags", tag.text); // Assuming the tag object has a 'name' property
  });

  
  // Log the contents of the FormData object
  for (const pair of formData.entries()) {
    console.log(pair[0], pair[1]);
  }
    if (item.id) {
      axios
        .put(`http://127.0.0.1:8000/api/user/api/task/${item.id}/`, formData, {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            "Content-Type": "multipart/form-data",
          }
        })
        .then(res => this.refreshList())
        .catch(error => {
          console.log("Error updating task:", error);
          // Handle the error if needed
        });
    } else {
      const { access_token } = getToken();
      axios
        .post(`http://127.0.0.1:8000/api/user/api/task/`, formData, {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            "Content-Type": "multipart/form-data",
          }
        })
        .then(res => this.refreshList())
        .catch(error => {
          console.log("Error creating task:", error);
          // Handle the error if needed
        });
    }
  };
  

  handleDelete = item => {
    const { access_token } = getToken();
    axios
      .delete(`http://127.0.0.1:8000/api/user/api/task/${item.id}`, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      })
      .then(res => this.refreshList());
  };

  createItem = () => {
    const date = new Date();
    date.setDate(date.getDate()+1);
    const { taskListId } = this.props;
    const formattedDueDate = date.toISOString().slice(0, 10);
    console.log('createItem:', formattedDueDate);
    const item = {
      title: "",
      description: "",
      completed: false,
      due_date: formattedDueDate,
      end_time: "", 
      duration: "", 
      files: [], // Initialize files as an empty array
      tags: [],
      is_event: false,
      send_email_notification: false,
      task_list: taskListId,
    };
    this.setState({ 
      activeItem: item, 
      modal: !this.state.modal,
      fileList: [], // Reset fileList when adding a new task
    });
  };

  createEvent = () => {
    const { taskListId } = this.props;
    const newEvent = {
      title: "",
      description: "",
      completed: false,
      due_date: new Date(),
      end_time: "",
      duration: "",
      files: [], // Initialize files as an empty array
      tags: [],
      is_event: true, // Set is_event to true for events
      send_email_notification: false,
      task_list: taskListId,
    };
    this.setState({
      activeItem: newEvent,
      modal: true, // Show the modal to add/edit the event details
      fileList: [], // Reset fileList when adding a new task
    });
  };

  editItem = (item) => {
    // Parse the due_date string and create a new Date object
    const due_date = new Date(item.due_date);
  
    // Check if the parsed date is valid
    if (!isNaN(due_date)) {
      item.due_date = due_date;
    } else {
      // If the parsed date is not valid, set the due_date to the current date
      item.due_date = new Date();
    }
    // Populate the fileList state with the selected files
    const fileList = item.files.map(file => file.id);
    

    this.setState({ 
      activeItem: item, 
      modal: !this.state.modal,
      fileList,
    });
  };
  
  countEndedNotCompletedTasks = () => {
    const { endedNotCompletedTasks } = this.state;
    return endedNotCompletedTasks.length;
  };

  countEndingSoonTasks = () => {
    const { endingSoonTasks } = this.state;
    return endingSoonTasks.length;
  };

  render() {
    const {isDropdownOpen } = this.state;

    const tasksToCheck = this.state.todoList;
    const now = moment(); // Get the current time

    // Calculate tasks ending soon (within 1 hour) and tasks that have ended but not completed
    const endingSoonTasks = [];
    const endedNotCompletedTasks = [];

    tasksToCheck.forEach((item) => {
      const { end_time, completed, due_date } = item;
      const formattedDueDate = new Date(due_date).toISOString().slice(0, 10);

      const isDueToday = moment(formattedDueDate).isSame(now, 'day');
      const isDueLast = moment(formattedDueDate).isBefore(now, 'day');
      // Parse the end time (HH:mm:ss)
      const [endHours, endMinutes] = end_time
      ? end_time.split(':').map(Number)
      : [0, 0];
    
      // Get the current time (HH:mm:ss)
      const now_time = new Date();
      const currentHours = now_time.getHours();
      const currentMinutes = now_time.getMinutes();

      // Calculate the remaining time in minutes
      const remainingMinutes = endHours * 60 + endMinutes - (currentHours * 60 + currentMinutes);

      // Check if the task's end time is 1 hour or less away from now
      const isEndingSoon = remainingMinutes > 0 && remainingMinutes <= 60;
      const isEnded = remainingMinutes < 0;

      if (isDueLast && !completed) {
        endedNotCompletedTasks.push(item);
      }

      
      if (isDueToday && isEnded && !completed) {
        endedNotCompletedTasks.push(item);
      }

      if (isDueToday && isEndingSoon && !completed) {
        endingSoonTasks.push(item);
      }

    });

    console.log(this.state.activeItem)

    return (
      <>
      <div
        className={`notification ${isDropdownOpen ? "active" : ""}`}
        onClick={this.toggleDropdown}
      >
      </div>

        <div className="row">
        <div className="col-md-0 col-sm-11 mx-auto p-0">
            <div className="card p-3">
            <div className="mb-3" style={{ marginRight: '1%', }}>
                <button onClick={this.createItem} className="btn btn-primary" style={{ marginLeft: '10px' }}>
                افزودن وظیفه | رویداد
                </button>
              </div>
              {this.renderTabList()}
              <ul className="list-group list-group-flush">
                {this.renderItems()}
              </ul>
            </div>
          </div>
        </div>
        {this.state.modal ? (
          <div dir="rtl">
          <Modal
            activeItem={this.state.activeItem}
            toggle={this.toggle}
            onSave={this.handleSubmit}
          />
          </div>
        ) : null}
      </>
    );
  }
}

export default ATaskList;
