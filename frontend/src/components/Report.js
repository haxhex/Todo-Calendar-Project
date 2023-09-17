import React, { Component } from "react";
import axios from "axios";
import "./report_styles.css"; 
import { getToken } from "../services/LocalStorageService";
import "react-datepicker/dist/react-datepicker.css";
import Diagram from './Diagram';
import CircleChart from "./CircleChart";
import JalaliDatePicker from './JalaliDatePicker';
import moment from 'moment-jalaali';
import persianJs from 'persianjs';


class Report extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewCompleted: false,
      activeItem: {
        title: "",
        description: "",
        completed: false,
        is_event: false, // Add the new is_event field to the state
        due_date: new Date(),
        end_time: "", 
        duration: "", 
        file: [],
        tags: [],
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
      selectedTaskListId: "", // Initialize the selectedTaskListId state to an empty string
      selectedTaskListName: "", // Initialize the selectedTaskListName state to an empty string
    };
  }

  handleStartDateChange = (date) => {
    this.setState({ startDate: new Date (date) });
  };

  handleEndDateChange = (date) => {
    this.setState({ endDate: new Date(date) });
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

  // filterByTasks = () => {
  //   const { selectedTaskListName, todoList, selectedTaskListId } = this.state;
  
  //   console.log("---selectedTasks: ", selectedTaskListId);
  
  //   console.log("todoList: ", todoList);
  
  //   // Log the task_list property of each item in the todoList
  //   todoList.forEach((item) => {
  //     console.log(item.task_list === selectedTaskListId)
  //   });

  //   // Convert selectedTaskListId to a number before comparison
  //   const selectedTaskListIdNumber = parseInt(selectedTaskListId, 10);
  //   const filteredByTaskList = todoList.filter(
  //     (item) => item.task_list === selectedTaskListIdNumber
  //   );
    
  //   this.setState({ filteredList: filteredByTaskList });
  // };
  
  handleTaskListChange = (event) => {
    const selectedTaskListId = event.target.value;
    const selectedTaskListName = event.target.options[event.target.selectedIndex].text;
    this.setState({ selectedTaskListId, selectedTaskListName }, () => {
      // this.filterByTasks(); // Call filterByTasks when the task list changes
    });
  };

refreshList = () => {
  const { userId } = this.props;
  const { access_token } = getToken();

  console.log(`UserId: ${userId}`);

  // Fetch tasks and task lists
  const fetchTasks = axios.get(`http://127.0.0.1:8000/api/user/api/task/`, {
    headers: {
      'Authorization': `Bearer ${access_token}`
    }
  });

  const fetchTaskLists = axios.get(`http://127.0.0.1:8000/api/user/tasklists/`, {
    headers: {
      'Authorization': `Bearer ${access_token}`
    }
  });

  // Fetch tasks and task lists concurrently
  axios.all([fetchTasks, fetchTaskLists])
    .then(axios.spread((tasksResponse, taskListsResponse) => {
      // Set '00:00:00' for end_time and duration when they are null
      const todoList = tasksResponse.data;

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

      this.setState({ todoList: todoList, fileList: todoList, tasksList: taskListsResponse.data });

      this.setState({ }, () => {
        this.filterByDates();
      });
    }))
    .catch(err => console.log(err));
};

  renderTabList = () => {
    const { viewCompleted, selectedTags, tasksList, selectedTaskListId } = this.state;
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
      <div className="my-3 tab-list">

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
        }}>
          <label>از تاریخ:‌</label>
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
          <label style={{marginRight: '10%'}}>تا تاریخ:</label>
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
        {/* </div> */}
      {/* <div className="filter-container"> */}
        <label style={{marginRight: '10%'}}>لیست ها:</label>
        <select
          value={selectedTaskListId}
          onChange={this.handleTaskListChange}
          style={{ marginBottom: '5px', padding: '5px', borderRadius: '0.5rem'}}
        >
          <option value="">همه</option>
          {tasksList.map((taskList) => (
            <option key={taskList.id} value={taskList.id}>
              {taskList.name}
            </option>
          ))}
        </select>
        </div>

        <div className="filter-container" style={{marginTop: '20px'}}>
        <label  style={{width: '100px'}}>برچسب ها:‌</label>
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
        <button className="btn btn-success" onClick={this.filterByDates} style={{marginTop: '5px', paddingLeft: '17px', paddingRight: '17px', borderRadius: '10rem', marginLeft: '5px'}}>اعمال فیلتر ها </button>
        <button className="btn btn-danger" onClick={this.clearFilters} style={{marginTop: '5px', borderRadius: '10rem'}}>برداشتن فیلتر ها</button> {/* Add the Clear Filters button */}
        </div>

        <div className="toggle-container" style={{marginTop: '20px'}}>
          <span
            onClick={() => this.displayCompleted(true)}
            className={viewCompleted === true ? "active" : ""}
            >
            تمام شده
          </span>
          <span
            onClick={() => this.displayCompleted(false)}
            className={viewCompleted === false ? "active" : ""}
            >
            نا تمام
          </span>
          <span
          onClick={() => this.displayCompleted(null)} // Add onClick handler for "All"
          className={viewCompleted === null ? "active" : ""}
        >
          همه
        </span>
        </div>
     
      </div>

    
    );
  };
  
  
  filterByDates = () => {
    const { startDate, endDate, todoList, selectedTags, selectedTaskListId } = this.state;
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

    const selectedTaskListIdNumber = parseInt(selectedTaskListId, 10);
    // Check if selectedTaskListIdNumber is not NaN
    if (!isNaN(selectedTaskListIdNumber)) {
      filteredList = filteredList.filter(
        (item) => item.task_list === selectedTaskListIdNumber
      );
    }
    

    // if (viewCompleted !== null) {
    //   filteredList = filteredList.filter((item) => item.completed === viewCompleted);
    // }

  // Filter based on the selected task list
  // console.log('selectedTasks: ', selectedTasks)
  // if (selectedTasks) {
  //   filteredList = filteredList.filter((item) => item.task_list === selectedTasks);
  // }    
    this.setState({ filteredList });
  };
  
  
  displayCompleted = (status) => {
    this.setState({ viewCompleted: status }, () => {
      this.filterByDates();
    });
  };
  
  
  clearFilters = () => {
    // const { todoList } = this.state;
  
    // let filteredList = todoList; 
  
    // if (viewCompleted === true || viewCompleted === false) {
    //   filteredList = filteredList.filter((item) => item.completed === viewCompleted);
    // }
  
    this.setState({
      startDate: null,
      endDate: null,
      filteredList: this.state.todoList,
      selectedTags: [], // Clear the selectedTags state when clearing filters
      selectedTasks: "", // Clear the selectedTasks state when clearing filters
    });
  };
  

  handleCompleteToggle = (item) => {
    console.log("Toggling completion for item:", item);
    const { access_token } = getToken();
    const updatedItem = { ...item, completed: !item.completed };
    console.log("Updated item:", updatedItem);
  
    axios
      .put(`http://127.0.0.1:8000/api/user/api/task/${item.id}/`, updatedItem, {
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

  renderItems = () => {
    const { viewCompleted, filteredList } = this.state;
    const tasksToRender = filteredList;

    let filteredAndCompleted;
    if (viewCompleted === null) {
        // Display all tasks when viewCompleted is null
        filteredAndCompleted = tasksToRender;
      } else {
        // Filter based on the viewCompleted value (true for completed, false for incomplete)
        filteredAndCompleted = tasksToRender.filter(
          (item) => item.completed === viewCompleted
        );
      }

    return filteredAndCompleted.map(item => {
      const { id, title, description, due_date, end_time, duration, completed, is_event } = item;

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

      let hours, minutes;
      if (end_time !== null) {
        // [hours, minutes, seconds] = end_time.split(":").map(Number);
        [hours, minutes] = end_time.split(":").map(Number);
      } else {
        hours = 0;
        minutes = 0;
        // seconds = 0; 
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
              <span className="mr-2" style={{marginLeft: '15%'}}>
                تاریخ شروع:
              <br /> 
              {persianJs(moment(formattedDueDate).format('jYYYY/jMM/jDD')).englishNumber().toString()}              
              </span>
              <span className="mr-2" style={{marginLeft: '14%', visibility: end_time ? '': 'hidden'}}>زمان شروع:<br /> {end_time && persianJs(formattedTime).englishNumber().toString()}</span>
              </>
            ) : (
              <>
              <span className="mr-2" style={{marginLeft: '15%'}}>تاریخ انجام:<br /> 
              {persianJs(moment(formattedDueDate).format('jYYYY/jMM/jDD')).englishNumber().toString()}              </span>
              <span className="mr-2" style={{marginLeft: '15%', visibility: end_time ? '': 'hidden' }}>زمان پایان:<br /> {end_time && persianJs(formattedTime).englishNumber().toString()}</span>
              </>
            )
            }
            <span className="mr-2" style={{ marginLeft: '13%', visibility: duration ? '': 'hidden' }}>مدت انجام:<br /> 
            {duration && persianJs(duration.toString()).englishNumber().toString()} دقیقه</span>
            </div>
          <div className="d-flex align-items-center">
          <span className="mr-2" style={{fontSize: '12px'}}>{tagDivs}</span>
          </div>
        </li>
      );
    });
  };

  toggle = () => {
    this.setState({ modal: !this.state.modal });
  };
  
  render() {
    const { filteredList, todoList, viewCompleted } = this.state;
    const completedCount = todoList.filter((item) => item.completed).length;
    const incompleteCount = todoList.filter((item) => !item.completed).length;
    let diagList = [];
    if (viewCompleted === null) {
      // Display all tasks when viewCompleted is null
      diagList = filteredList;
    } else {
      // Filter based on the viewCompleted value (true for completed, false for incomplete)
        diagList = filteredList.filter(
        (item) => item.completed === viewCompleted
      );
    }


    return (
        <main className="content">
        {this.renderTabList()}
        <div className="container">
          <div className="diagram-container">
          <h3>نمودار میزان کارکرد </h3>
          <div style={{
            border: '1px solid #e2e2e2',
            borderRadius: '0.3rem',
            paddingRight: '10%',
            paddingTop: '10%',
            marginBottom: '10px'
          }}>
          <Diagram filteredList={diagList} />
          </div>
          <div style={{
            border: '1px solid #e2e2e2',
            borderRadius: '0.3rem',
            paddingRight: '0%',
            paddingTop: '0%'
          }}>
          <CircleChart completedCount={completedCount} incompleteCount={incompleteCount} />
          </div>
          </div>
          <div className="task-list-container">
            <div className="row">
              <div className="col-md-10 col-sm-10 mx-auto p-0">
                <h3>لیست کارها</h3>
                <div className="card p-3">
                  <ul className="list-group list-group-flush">
                    {this.renderItems()}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }
}

export default Report;
