import React, { Component } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from "axios";
import { getToken } from "../services/LocalStorageService";

class DragDropList extends Component {
  state = {
    items: []
  };

  componentDidMount() {
    this.refreshList();
  }

  refreshList = () => {
    const { access_token } = getToken();

    axios
      .get(`http://127.0.0.1:8000/api/user/api/task/`, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      })
      .then(res => {
        // Set '00:00:00' for end_time and duration when they are null
        const todoList = res.data.map(task => {
          if (!task.end_time) task.end_time = '00:00:00';
          if (!task.duration) task.duration = '00:00:00';
          return task;
        });

        this.setState({ items: todoList });
      })
      .catch(err => console.log(err));
  };

  handleDragEnd = (result) => {
    if (!result.destination) return;

    const newItems = Array.from(this.state.items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    this.setState({ items: newItems });
  };

  render() {
    const { items } = this.state;

    return (
      <DragDropContext onDragEnd={this.handleDragEnd}>
        <Droppable droppableId="list">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                  {(provided) => (
                    <div
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      ref={provided.innerRef}
                    >
                      {item.title}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }
}

export default DragDropList;