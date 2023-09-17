import React, { Component } from 'react';
import moment from 'jalali-moment';
import { getToken } from "../services/LocalStorageService";
import axios from "axios";
import * as shamsi from 'shamsi-date-converter';
import Modal from "./Modal";
import TimeField from 'react-simple-timefield';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// import "./styles.css"; 
import './Calendar.css';
import { FaTimes } from 'react-icons/fa';
import persianJs from 'persianjs';


class MyCalendar extends Component {
  constructor(props) {
    super(props);
    const { access_token } = getToken();

    this.state = {
      currentDate: moment(),
      currentView: 'month',
      selectedDate: null,
      monthDropdown: false,
      yearDropdown: false,
      viewCompleted: false,
      showAllTasks: false,
      expandedDays: {}, // Use an object to track expanded state for each day
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
      },
      todoList: [],
      modal: false,
      fileList: [],
      startDate: null,
      endDate: null,
      filteredList: [],
      selectedTags: [],
      timeInput: "",
      selectedTasks: [],
      newDueDate: null,
      access_token,
      userData: {
        email: "",
        name: "",
      },
    };
    // Set the locale to 'fa' (Persian)
    moment.locale('fa');
  }

  componentDidMount() {
    this.refreshList();
  }


  handleStartDateChange = (date) => {
    this.setState({ startDate: date });
  };

  handleEndDateChange = (date) => {
    this.setState({ endDate: date });
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
  };


  renderTabList = () => {
    const { viewCompleted, selectedTags } = this.state;
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
        // console.log('allTags: ', allTags)
      return (
      <div className="my-5 tab-list">
        <div className="toggle-container">
          <span
            onClick={() => this.displayCompleted(true)}
            className={viewCompleted ? "active" : ""}
          >
            Complete
          </span>
          <span
            onClick={() => this.displayCompleted(false)}
            className={!viewCompleted ? "active" : ""}
          >
            Incomplete
          </span>
        </div>

        <div>
        <div className="time-field-container">
      <TimeField
        value={this.state.timeInput}
        onChange={(event, value) => {
          this.setState({ timeInput: value });
        }}
        colon=":"
        style={{
          width: '45px', // Adjust the width as needed
          fontSize: '16px', // Adjust the font size as needed
          // Add more styles as required
        }}
      />
      </div>
        <button onClick={() => this.handleTimeOperation("add")}>Add Time</button>
        <button onClick={() => this.handleTimeOperation("subtract")}>Subtract Time</button>
      </div>


      <div className="due-date-container">
        <label>New Due Date:</label>
        <DatePicker
          selected={this.state.newDueDate}
          onChange={this.handleNewDueDateChange}
          dateFormat="yyyy-MM-dd"
        />
        <button onClick={this.handleChangeDueDate}>Change Due Date</button>
      </div>

        <div className="filter-container">
          <label>Start Date:</label>
          <DatePicker
            selected={this.state.startDate}
            onChange={this.handleStartDateChange}
            dateFormat="yyyy-MM-dd"
          />
        </div>
        <div className="filter-container">
          <label>End Date:</label>
          <DatePicker
            selected={this.state.endDate}
            onChange={this.handleEndDateChange}
            dateFormat="yyyy-MM-dd"
          />
        </div>
        <div className="filter-container">
        <label>Tags:</label>
        <div className="tag-list">
          {allTags.map((tag) => (
            <span
              key={tag}
              className={`tag-item ${selectedTags.includes(tag) ? "selected" : ""}`}
              onClick={() => this.handleTagToggle(tag)}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
        <button onClick={this.filterByDates}>Apply Filters</button>
        <button onClick={this.clearFilters}>Clear Filters</button> {/* Add the Clear Filters button */}
      </div>

    );
  };
  
  
  filterByDates = () => {
    const { startDate, endDate, todoList, selectedTags } = this.state;
  
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

    console.log('filteredList by Tag', filteredList)
  
    this.setState({ filteredList });
  };
  

  displayCompleted = (status) => {
    this.setState({ viewCompleted: status });
  };
  
  clearFilters = () => {
    this.setState({
      startDate: null,
      endDate: null,
      filteredList: [],
    });
  };

  addMinutesToDate = (date, minutes) => {
    console.log('date: ', date)
    const addedTime = new Date(date.getTime() + minutes * 60000)
    console.log('addedTime: ', addedTime)
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
    console.log('updatedTask.id: ', updatedTask.id);
    console.log('updatedTask: ', updatedTask);

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

  console.log('updatedTodoList: ', updatedTodoList);

  // Send the updated tasks to the backend
  this.updateTaskToBackend(updatedTasks);
};

  renderItems = () => {
    const { viewCompleted, filteredList, todoList, selectedTasks } = this.state;
    const tasksToRender = filteredList.length > 0 ? filteredList : todoList;
  
    const filteredAndCompleted = tasksToRender.filter(
      (item) => item.completed === viewCompleted
    );

    return filteredAndCompleted.map(item => {
      const { id, title, description, due_date, end_time, duration, completed } = item;
      const formattedDueDate = new Date(due_date).toISOString().slice(0, 10);
      const tgs = [];
      // console.log('ITEMS: ', item)
      for (let i = 0; i < item.tags.length; i++) {
        const tag = item.tags[i];
        // console.log('Tag Err: ', tag)
        if (!tag.id) {
          tgs.push({ id: tag, text: tag });
        } else {
          tgs.push(tag);
        }
      }
      const tagTexts = tgs.map(tag => tag.text).join(", ");
      // console.log('tagTexts: ', tagTexts)

  
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
            />
            <span
              className={`todo-title ${viewCompleted ? "completed-todo" : ""}`}
              title={description}
            >
              {title}
            </span>
          </label>
          <div className="d-flex align-items-center">
            <span className="mr-2">Due Date: {formattedDueDate}</span>
            <span className="mr-2">End Time: {end_time}</span>
            <span className="mr-2">Duration: {duration}</span>
            <span className="mr-2">Tags: {tagTexts}</span>
            <button
              onClick={() => this.editItem(item)}
              className="btn btn-secondary mr-2"
            >
              Edit
            </button>
            <button
              onClick={() => this.handleDelete(item)}
              className="btn btn-danger"
            >
              Delete
            </button>
          </div>
          <div className="d-flex align-items-center">
          <input
            type="checkbox"
            checked={selectedTasks.includes(id)}
            onChange={() => this.handleTaskSelection(id)}
          />
          <span className="ml-2">Selected</span>
          </div>
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

// Assuming item.due_date is a string in the format "YYYY-MM-DD"
const originalDate = new Date(item.due_date);
const modifiedDate = new Date(originalDate);
modifiedDate.setDate(originalDate.getDate() + 1);
  
console.log('Due Date: ', item.due_date)
  // Format the due_date to YYYY-MM-DD before sending to the backend
  const formattedDueDate = new Date(item.due_date).toISOString().slice(0, 10);
  console.log('formattedDueDate: ', formattedDueDate)
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

  
  // Append the selected files to the FormData object
formattedItem.files.forEach((fileObj) => {
  console.log(fileObj)
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

  createItem = (day) => {
    const date = new Date(day._d);
    date.setDate(date.getDate() + 1);
    
    const formattedDueDate = date.toISOString().slice(0, 10);
    console.log('createItem:', formattedDueDate);
    
    const item = {
      title: "",
      description: "",
      completed: false,
      send_email_notification: false,
      due_date: new Date(formattedDueDate),
      end_time: "", 
      duration: "", 
      files: [], // Initialize files as an empty array
      tags: [],
      is_event: false,
    };
    this.setState({ 
      activeItem: item, 
      modal: !this.state.modal,
      fileList: [], // Reset fileList when adding a new task
    });
  };

  createItemDay = (day) => {
    const date = new Date(day._d);
    date.setDate(date.getDate());
    
    const formattedDueDate = date.toISOString().slice(0, 10);
    console.log('createItem:', formattedDueDate);
    
    const item = {
      title: "",
      description: "",
      completed: false,
      send_email_notification: false,
      due_date: new Date(formattedDueDate),
      end_time: "", 
      duration: "", 
      files: [], // Initialize files as an empty array
      tags: [],
      is_event: false,
    };
    this.setState({ 
      activeItem: item, 
      modal: !this.state.modal,
      fileList: [], // Reset fileList when adding a new task
    });
  };

  createEvent = (day) => {
    const date = new Date(day._d);
    date.setDate(date.getDate() + 1);
    
    const formattedDueDate = date.toISOString().slice(0, 10);
    console.log('createItem:', formattedDueDate);
    
    const item = {
      title: "",
      description: "",
      completed: false,
      send_email_notification: false,
      due_date: new Date(formattedDueDate),
      end_time: "", 
      duration: "", 
      files: [], // Initialize files as an empty array
      tags: [],
      is_event: true,
    };
    this.setState({ 
      activeItem: item, 
      modal: !this.state.modal,
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
  
  handlePrev = () => {
    switch (this.state.currentView) {
      case 'month':
        this.setState({ currentDate: moment(this.state.currentDate).subtract(1, 'jMonth') });
        break;
      case 'week':
        this.setState({ currentDate: moment(this.state.currentDate).add(-1, 'jWeek') });
        break;
      case 'day':
        this.setState({ currentDate: moment(this.state.currentDate).add(-1, 'jDay') });
        break;
      default:
        break;
    }
  };
  
  handleNext = () => {
    switch (this.state.currentView) {
      case 'month':
        this.setState({ currentDate: moment(this.state.currentDate).add(1, 'jMonth') });
        break;
      case 'week':
        this.setState({ currentDate: moment(this.state.currentDate).add(1, 'jWeek') });
        break;
      case 'day':
        this.setState({ currentDate: moment(this.state.currentDate).add(1, 'jDay') });
        break;
      default:
        break;
    }
  };
  
  handleViewChange = (view) => {
    this.setState({ currentView: view });
    this.setState({ selectedDate: null }); // Reset selectedDate to null when switching views
    if (view === 'day') {
      this.setState({ selectedDate: moment() });
    }
  };

  handleMonthSelect = (month) => {
    this.setState({ currentDate: moment(this.state.currentDate).month(month) });
    this.setState({ monthDropdown: false });
  };
  
  handleYearSelect = (year) => {
    this.setState({ currentDate: moment(this.state.currentDate).year(year) });
    this.setState({ yearDropdown: false });
  };
  
  // Function to handle "Today" click
  handleTodayClick = () => {
    this.setState({ currentDate: moment() }); // Set currentDate to the current date
    this.setState({ selectedDate: null }); // Reset selectedDate to null
  };

  startOfView = () => {
    switch (this.state.currentView) {
      case 'month':
        return moment(this.state.currentDate).startOf('jMonth');
      case 'week':
        return moment(this.state.currentDate).startOf('jWeek'); // Start of the week at the beginning of the day
      case 'day':
        return moment(this.state.selectedDate).startOf('day'); // Start of the selected day at the beginning of the day
      default:
        return moment();
    }
  };
  
  endOfView = () => {
    switch (this.state.currentView) {
      case 'month':
        return moment(this.state.currentDate).endOf('jMonth');
      case 'week':
        return moment(this.state.currentDate).endOf('jWeek').endOf('day'); // End of the week at the end of the day
      case 'day':
        return moment(this.state.selectedDate).endOf('day'); // End of the selected day at the end of the day
      default:
        return moment();
    }
  };

  toggleShowAllTasks = (day) => {
    this.setState((prevState) => ({
      expandedDays: {
        ...prevState.expandedDays,
        [day]: !prevState.expandedDays[day], // Toggle the expanded state for the specific day
      },
    }));
  };

  renderWeek = (weekStart) => {
    const week = [];
    const jalaliTasks = this.state.todoList.map((task) => {
      const jalaliDueDate = shamsi.gregorianToJalali(task.due_date).join('-');
      return {
        ...task,
        jalaliDueDate,
      };
    });
    
    for (let i = 0; i < 7; i++) {
      const day = moment(weekStart).add(i, 'jDay');
      let cellContent = day.format('jD');
      let persianNumber = persianJs(cellContent).englishNumber().toString();
      // console.log(persianNumber); // Output: '۱۲۳۴'
      // console.log('cellContent: ', cellContent)
      const tasksForDay = jalaliTasks.filter((task) => {
        return day.isSame(moment(task.jalaliDueDate, 'jYYYY-jMM-jDD'), 'day');
      });
  
      if (tasksForDay.length > 0) {
        persianNumber = (
          <>
            <span>{persianNumber}</span>
            <br />
            <div className="task-container">
              {tasksForDay
              .slice(0, this.state.expandedDays[day] ? tasksForDay.length : 2)
              .map((task) => (
                <div
                  key={task.id}
                  className={`task-box list-group-item ${task.completed ? 'completed' : ''}`}
                  style={{ backgroundColor: 'gray', display: 'flex', alignItems: 'center', borderRadius: '10rem' }} // Add the inline style for the background color here
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent the click event from propagating
                      this.editItem(task);
                    }}
                    className="mr-2 task-title"
                    style={{color: 'white', fontSize: '14px', padding: '2px 5px'}}
                  >
                   {task.title.length > 10 ? task.title.substring(0, 10) + '...' : task.title}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent the click event from propagating
                      this.handleDelete(task);
                    }}
                    className="btn btn-danger btn-sm mr-2"
                    style=
                    {{
                      height: '20px',
                      width: '20px',
                      fontSize: '10px',
                      padding: 'revert',
                    }}
                  >
                    <FaTimes />
                  </button>
                  <label className="d-flex align-items-center mb-0">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={(e) => {
                        e.stopPropagation(); // Prevent the click event from propagating
                        this.handleCompleteToggle(task);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();}}
                      style={{
                        marginLeft: '10px', 
                        marginRight: '5px',
                        width: '20px',
                        height: '20px',
                        fontSize: '10px',
                        padding: 'revert',
                      }}
                    />
                  </label>
                </div>
              ))}
            </div>
            <br />
            {tasksForDay.length > 2 && (
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent the click event from propagating
                this.toggleShowAllTasks(day);
              }}
              className="show-more-button button-link-hover"
              style={{

              }}
            >
              {this.state.expandedDays[day] ? 'نمایش کمتر' : 'نمایش بیشتر'}
            </button>
          )}
          </>
        );
      }

  
      week.push(
        <td
          key={day.format('jD')}
          className={`${
            day.month() !== this.state.currentDate.month() ? 'other-month' : ''
          } ${day.isSame(moment(), 'day') ? 'today' : ''}`}
          onClick={() => this.createItem(day)} 
            data-tooltip="ایجاد وظیفه / رویداد"
            style={{
              cursor: 'pointer',
              
            }}
        >
          <div className="day-container">
            <div className="cell-content">
              {persianNumber}
            </div>
            {/* <button onClick={() => this.createItem(day)} className="btn btn-primary custom-tooltip" 
            data-tooltip="ایجاد وظیفه"
            style={{
              borderRadius: '5rem', 
              marginLeft: '5px', 
              padding: '0px', 
              height: '23px',
              width: '23px',
              }}
              >
              +
            </button> */}
            {/* <button onClick={() => this.createEvent(day)} className="btn btn-info custom-tooltip" 
            data-tooltip="ایجاد رویداد"
            style={{  
              color: 'white',
              borderRadius: '5rem',
              padding: '0px', 
              height: '23px',
              width: '23px',
              }}
              >
              +
            </button> */}
          </div>
        </td>
      );
    }
  
    return week;
  };

  renderDay = (day) => {
    const jalaliTasks = this.state.todoList.map((task) => {
      const jalaliDueDate = shamsi.gregorianToJalali(task.due_date).join('-');
      return {
        ...task,
        jalaliDueDate,
      };
    });
  
    const tasksForDay = jalaliTasks.filter((task) => {
      return day.isSame(moment(task.jalaliDueDate, 'jYYYY-jMM-jDD'), 'day');
    });
  
    let cellContent = day.format('jD');
    let persianNumber = persianJs(cellContent).englishNumber().toString();
    // console.log(persianNumber); // Output: '۱۲۳۴'
    // console.log('cellContent: ', cellContent);
    
  
    if (tasksForDay.length > 0) {
      persianNumber = (
        <>
          <span>{persianNumber}</span>
          <br />
          <div className="task-container" style={{ display: 'block'}}>
            {tasksForDay.map((task) => (
              // Check if end_time is null before rendering the task div
              task.end_time === null && (
                <div
                  key={task.id}
                  className={`task-box list-group-item ${task.completed ? 'completed' : ''}`}
                  style={{ backgroundColor: 'gray', display: 'flex', alignItems: 'center', borderRadius: '0.3rem', padding: '5px'}} // Add the inline style for the background color here
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent the click event from propagating
                      this.editItem(task);
                    }}
                    className="mr-2 task-title"
                    style={{ color: 'white', fontSize: '14px', padding: '2px 5px' }}
                  >
                    {task.title}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent the click event from propagating
                      this.handleDelete(task);
                    }}
                    className="btn btn-danger btn-sm mr-2"
                    style={{
                      height: '20px',
                      width: '20px',
                      fontSize: '10px',
                      padding: 'revert',
                    }}
                  >
                    <FaTimes />
                  </button>
                  <label className="d-flex align-items-center mb-0">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={(e) => {
                        e.stopPropagation(); // Prevent the click event from propagating
                        this.handleCompleteToggle(task);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();}}
                      style={{
                        marginLeft: '10px',
                        marginRight: '5px',
                        width: '20px',
                        height: '20px',
                        fontSize: '10px',
                        padding: 'revert',
                      }}
                    />
                  </label>
                </div>
              )
            ))}
          </div>
        </>
      );
    } else {
      persianNumber = (
        <span>{persianNumber}</span>
      );
    }
    
    const hours = [];
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, '0');
      const tasksForHour = tasksForDay.filter((task) => {
        const taskEndTime = moment(task.end_time, 'HH:mm');
        return taskEndTime.hour() === i;
      });
    
      hours.push(
        <tr key={hour} className="hour-row">
          <td
            style={{
              width: '10%',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            {persianJs(hour).englishNumber().toString()}:۰۰
          </td>
          <td
            style={{
              textAlign: 'right',
              position: 'relative',
              height: '50px',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                overflow: 'visible',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
                flexWrap: 'nowrap',
              }}
            >
              {tasksForHour.map((task) => {
                const taskEndTime = moment(task.end_time, 'HH:mm');
                const endTimeFormatted = taskEndTime.format('HH:mm');
                const endTimeInMinutes = taskEndTime.minutes();
                const marginBottom = -(endTimeInMinutes); // Assuming taskHeight is 50
                console.log('endTimeInMinutes: ', endTimeInMinutes)
                console.log('marginBottom: ', marginBottom)
                let tooltipContent = task.is_event ? `زمان شروع: ${persianJs(endTimeFormatted).englishNumber().toString()}` : `زمان پایان: ${persianJs(endTimeFormatted).englishNumber().toString()}`;
                if (task.duration) {
                  tooltipContent = `مدت: ${persianJs(task.duration).englishNumber().toString()} دقیقه - ${tooltipContent}`;
                }
                console.log('tasksForHour: ', tasksForHour)
                return (
                  <div
                    key={task.id}
                    className="task-container"
                    style={{
                      position: 'relative',
                      marginRight: '10px',
                      marginBottom: `${marginBottom}px`,
                    }}
                  >
                    <div
                      key={task.id}
                      className={`custom-tip task-box list-group-item ${task.completed ? 'completed' : ''}`}
                      style={{
                        backgroundColor: 'gray',
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: '0.3rem',
                        marginBottom: '25px',
                        transform: 'translateY(-50%)',
                        zIndex: 1,
                      }}
                      data-tooltip={tooltipContent}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          this.editItem(task);
                        }}
                        className="mr-2 task-title"
                        style={{ 
                          color: 'white', 
                          fontSize: '14px', 
                          padding: '2px 5px',
                          height: `${task.duration}px`, 
                          paddingRight: '10px',
                        }}
                      >
                        {task.title}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          this.handleDelete(task);
                        }}
                        className="btn btn-danger btn-sm mr-2"
                        style={{
                          height: '20px',
                          width: '20px',
                          fontSize: '10px',
                          padding: 'revert',
                        }}
                      >
                        <FaTimes />
                      </button>
                      <label className="d-flex align-items-center mb-0">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={(e) => {
                            e.stopPropagation();
                            this.handleCompleteToggle(task);
                          }}
                          onClick={(e) => {
                            e.stopPropagation();}}                          
                            style={{
                            marginLeft: '10px',
                            marginRight: '5px',
                            width: '20px',
                            height: '20px',
                            fontSize: '10px',
                            padding: 'revert',
                          }}
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </td>
        </tr>
      );
    }
    
    return (
      <td
        key={day.format('jD')}
        className={`${
          day.month() !== this.state.currentDate.month() ? 'other-month' : ''
        } ${day.isSame(moment(), 'day') ? 'today' : ''}`}
        onClick={() => this.createItemDay(day)}
        style={{
          cursor: 'pointer',
        }}
      >
        <div className="day-container">
          <div className="cell-content">{persianNumber}</div>
          <div onClick={(e) => { e.stopPropagation(); }} className="scrollable-container">
            <table style={{ tableLayout: 'fixed', width: '100%' }}>
              <tbody>{hours}</tbody>
            </table>
          </div>
        </div>
      </td>
    );
  }
  

  renderCalendar = () => {
    if (this.state.currentView === 'day') {
      return <tr>{this.renderDay(this.state.currentDate)}</tr>;
    } else {
      const weeks = [];
      let weekStart = moment(this.startOfView()).startOf('jWeek');
      while (weekStart.isSameOrBefore(this.endOfView())) {
        weeks.push(
          <tr key={weekStart.format('jW')}>{this.renderWeek(weekStart)}</tr>
        );
        weekStart = moment(weekStart).add(1, 'jWeek');
      }
      return weeks;
    }
  };

  render() {
    const currMonth = this.state.currentDate.format('jMMMM');
    let persianMonth;

    switch (currMonth) {
      case 'Mordaad':
        persianMonth = 'مرداد';
        break;
      case 'Tir':
        persianMonth = 'تیر';
        break;
      case 'Mehr':
        persianMonth = 'مهر';
        break;
      case 'Farvardin':
        persianMonth = 'فروردین';
        break;
      case 'Ordibehesht':
        persianMonth = 'اردیبهشت';
        break;
      case 'Aban':
        persianMonth = 'آبان';
        break;
      case 'Azar':
        persianMonth = 'آذر';
        break;
      case 'Dey':
        persianMonth = 'دی';
        break;
      case 'Bahman':
        persianMonth = 'بهمن';
        break;
      case 'Esfand':
        persianMonth = 'اسفند';
        break;
      case 'Shahrivar':
        persianMonth ='شهریور';
        break;
      default:
        persianMonth = currMonth;
    }

    return (
      <div className="calendar-container" style={{  overflow: 'scroll' }}>
      <div className="calendar-header">
          <button onClick={this.handlePrev} 
          style={{
            backgroundColor: '#9c27b0',
            padding: '5px 20px',
            color: 'white',
            borderRadius: '1rem'
          }}
          >
            قبل
          </button>
          <span
            onClick={() => this.setState({ monthDropdown: !this.state.monthDropdown })}
          >
            <select value={persianMonth} style={{ marginLeft: '5px', padding: '5px', borderRadius: '0.5rem'}}>
              {moment.localeData('fa').jMonths().map((month, index) => (
                <option key={index} onClick={() => this.handleMonthSelect(index)}>
                  {month}
                </option>
              ))}
            </select>
          </span>
          <span
            onClick={() => this.setState({ yearDropdown: !this.state.yearDropdown })}
          >
            <select value={this.state.currentDate.format('jYYYY')} style={{ padding: '5px', borderRadius: '0.5rem'}}>
              {Array.from({ length: 11 }, (_, i) => this.state.currentDate.jYear() - 5 + i).map((year) => (
                <option key={year} onClick={() => this.handleYearSelect(year)}>
                  {year}
                </option>
              ))}
            </select>
            </span>
          <button onClick={this.handleNext}
          style={{
            backgroundColor: '#9c27b0',
            padding: '5px 20px',
            color: 'white',
            borderRadius: '1rem'
          }}
          >بعد</button>
          <button onClick={this.handleTodayClick}
          style={{
            backgroundColor: '#4b2562',
            padding: '5px 20px',
            color: 'white',
            borderRadius: '1rem'
          }}
          >امروز</button>
          <button onClick={() => this.handleViewChange('month')}
          style={{
            backgroundColor: '#762f74',
            padding: '5px 20px',
            color: 'white',
            borderRadius: '1rem'
          }}
          >ماهانه</button>
          <button onClick={() => this.handleViewChange('week')}
          style={{
            backgroundColor: '#96497d',
            padding: '5px 20px',
            color: 'white',
            borderRadius: '1rem'
          }}
          >هفتگی</button>
          <button onClick={() => this.handleViewChange('day')}
          style={{
            backgroundColor: '#9757a8',
            padding: '5px 20px',
            color: 'white',
            borderRadius: '1rem'
          }}          >روزانه</button>
        </div>

        <table className="calendar-table">
          {this.state.currentView === 'day' ? null : (
            <thead>
              <tr>
                <th style={{ color: 'black'}}>شنبه</th>
                <th style={{ color: 'black'}}>یکشنبه</th>
                <th style={{ color: 'black'}}>دوشنبه</th>
                <th style={{ color: 'black'}}>سه‌شنبه</th>
                <th style={{ color: 'black'}}>چهارشنبه</th>
                <th style={{ color: 'black'}}>پنج‌شنبه</th>
                <th style={{ color: 'black'}}>جمعه</th>
              </tr>
            </thead>
          )}
          <tbody>{this.renderCalendar()}</tbody>
        </table>
        <div>
        </div>
        <main className="content">
        {this.state.modal ? (
          <Modal
            activeItem={this.state.activeItem}
            toggle={this.toggle}
            onSave={this.handleSubmit}
          />
        ) : null}
      </main>     
      </div>
    );
  }
}

export default MyCalendar;
