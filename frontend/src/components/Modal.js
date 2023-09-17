import React, { Component } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { WithContext as ReactTags } from 'react-tag-input';
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import TimePicker from 'react-times';

// use material theme
import 'react-times/css/material/default.css';
// or you can use classic theme
import 'react-times/css/classic/default.css';
import './modal.css';

import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Input,
  Label
} from "reactstrap";
import JalaliDatePicker from './JalaliDatePicker';


export default class CustomModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeItem: this.props.activeItem,
      activeMode: 'task',
    };
  }
  
  handleChange = (e) => {
    let { name, value } = e.target;
    if (e.target.type === "checkbox") {
      value = e.target.checked;
    }
    const activeItem = { ...this.state.activeItem };
    if (name === "duration") {
      activeItem.duration = value;
    } else if (name === "end_time") {
      activeItem.end_time = value;
    } else {
      activeItem[name] = value;
    }
    this.setState({ activeItem });
  };

  handleQuillChange = (content) => {
    this.setState((prevState) => ({
      activeItem: {
        ...prevState.activeItem,
        description: content,
      },
    }));
    };
    

  handleEndTimeChange = (date) => {
    const activeItem = { ...this.state.activeItem, end_time: date };
    this.setState({ activeItem });
  };

  // handleDurationChange = (date) => {
  //   const activeItem = { ...this.state.activeItem, duration: date };
  //   this.setState({ activeItem });
  // };

  getFileNameFromUrl(url) {
    const parts = url.split("/");
    return parts[parts.length - 1];
  }

  async getFilesFromUrls(urls) {
    const promises = urls.map(async (url) => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch the file from URL.");
        }
        const blob = await response.blob();
        console.log('Blob: ', blob)
        return { file: blob, name: this.getFileNameFromUrl(url) };
      } catch (error) {
        console.error(error);
        return null;
      }
    });
  
    const files = await Promise.all(promises);
    return files.filter((file) => file !== null);
  }


  

  handleFileChange = async (e) => {
    const files = e.target.files;
    console.log('**files: ', files)
    const activeItem = { ...this.state.activeItem };
  
    // Convert the FileList to an array and create new file objects with the correct properties
    const newFiles = Array.from(files).map((file) => {
      return { file, name: file.name }; // Store the actual File object and its name
    });
  
    // Convert file URLs to file objects
    for (const fileUrl of activeItem.files) {
      if (fileUrl.id) {
        console.log('fileUrl:', fileUrl)
        const parts = fileUrl.file.split("/");
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        const file = new File([blob], parts[parts.length - 1], { type: blob.type });
        newFiles.push({ file, name: file.name });
      }
    }
  
    // Concatenate the newFiles array with the existing files array in the activeItem state
    activeItem.files = [...activeItem.files, ...newFiles];
    this.setState({ activeItem });
  };
  
  
  handleFileRemove = (index) => {
    const activeItem = { ...this.state.activeItem };
    activeItem.files.splice(index, 1);
    this.setState({ activeItem });
  };  
  
  handleDownload = (event, file) => {
    console.log('FILE: ', file)
    event.preventDefault();
  
    if (file.id) {
    const url = file.file;
    const fileName = file.name && file.name !== '' ? file.name : file.file.split("/")[file.file.split("/").length - 1];
    console.log('file-name: ', fileName);
    console.log('URL: ', url);
  
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Network response was not ok. Status: ${response.status}`);
        }
        return response.blob();
      })
      .then(blob => {
        let url = window.URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
  
        // Clean up the object URL after the download starts
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error('Error downloading file:', error);
      });
    }
    else{
      const blob = new Blob([file.file], { type: file.file.type });
      const url = URL.createObjectURL(blob);
      const fileName = file.name && file.name !== '' ? file.name : file.file.name;
    
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
    
      // Clean up the object URL after the download starts
      URL.revokeObjectURL(url);
    }
  };

    // Code for rendering file previews
    renderFilePreviews = () => {
      const { activeItem } = this.state;
      return activeItem.files.map((file, index) => (
        <div key={index}>
          <span>{file.name}</span>
          <button onClick={() => this.handleFileRemove(index)}>Remove</button>
          {file.file && <buttton onClick={() => this.handleDownload(file)}>Download</buttton>}
        </div>
      ));
    };

    handleTagChange = (tags) => {
      const activeItem = { ...this.state.activeItem, tags: tags };
      this.setState({ activeItem });
    };

    handleDateChange = (date) => {
      console.log('J Date: ', date)
      const activeItem = { ...this.state.activeItem, due_date: date };
      this.setState({ activeItem });
    };

    handleTimeChange = (newTime) => {
      const { hour, minute } = newTime;
      const formattedTime = `${hour}:${minute}`;
  
      const activeItem = { ...this.state.activeItem, end_time: formattedTime };
      this.setState({ activeItem });
    };

    handleDurationChange = (event) => {
      const formattedDuration = event.target.value;
    
      const activeItem = { ...this.state.activeItem, duration: formattedDuration };
      this.setState({ activeItem });
    };
    

    toggleMode = () => {
      this.setState((prevState) => ({
        isEventMode: !prevState.isEventMode,
      }));
    };

    handleActiveItemChange = (changes) => {
      this.setState(prevState => {
        const updatedActiveItem = {
          ...prevState.activeItem,
          ...changes,
          // is_event: prevState.activeMode === 'event', // Update is_event based on activeMode
        };
        
        console.log('Updated active item:', updatedActiveItem);
        
        return { activeItem: updatedActiveItem };
      });
    };
    
    

  render() {
    const { toggle, onSave } = this.props;
    console.log('ActiveItem:', this.state.activeItem)
    const isEvent = this.state.activeItem.is_event; // Check if it's an event
    console.log('isEvent: ', isEvent)

    const tgs = []
    for (let i = 0; i < this.state.activeItem.tags.length; i++) {
      const tag = this.state.activeItem.tags[i];
      if (!tag.id) {
        tgs.push({ id: tag, text: tag});
      }
      else {
        tgs.push(tag);
      }
    }
    this.state.activeItem.tags = tgs; 

    const  modules  = {
      toolbar: [
          [{ font: [] }],
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ script:  "sub" }, { script:  "super" }],
          ["blockquote", "code-block"],
          [{ list:  "ordered" }, { list:  "bullet" }],
          [{ indent:  "-1" }, { indent:  "+1" }, { align: [] }],
          ["link", "image", "video"],
          ["clean"],
          [{ 'direction': 'rtl' }] // this is rtl support
      ],
  };

    return (
      <Modal isOpen={true} toggle={toggle} dir="rtl">
<ModalHeader toggle={toggle} dir="ltr">
  <div style={{ textAlign: 'center' }}>
    <span
      onClick={() => {
        this.handleActiveItemChange({ is_event: false }, () => {
          this.setState({ activeMode: 'task' });
        });
      }}
      style={{
        cursor: 'pointer',
        color: !isEvent ? 'white' : '#333',
        border: '1px solid #9c27b0',
        backgroundColor: !isEvent ? '#9c27b0' : 'white',
        borderRadius: '4px',
        padding: '4px 8px',
        marginLeft: '5px'
      }}
    >
   وظیفه&#160;
</span>
    <span
      onClick={() => {
        this.handleActiveItemChange({ is_event: true }, () => {
          this.setState({ activeMode: 'event' });
        });
      }}
      style={{
        cursor: 'pointer',
        color: isEvent ? 'white' : '#333',
        backgroundColor: isEvent ? '#9c27b0' : 'white',
        border: '1px solid #9c27b0',
        borderRadius: '4px',
        padding: '4px 8px',
      }}
    >
        رویداد  
    </span>
  </div>
</ModalHeader>

        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="title">عنوان</Label>
              <Input
                type="text"
                name="title"
                value={this.state.activeItem.title}
                onChange={this.handleChange}
                placeholder="عنوان کار خود را وارد کنید"
              />
            </FormGroup>
            <FormGroup>
        <Label for="description">توضیحات</Label>
        <ReactQuill
          modules={modules} theme="snow"
          style={{ direction: 'rtl' }}
          name="description"
          value={this.state.activeItem.description}
          onChange={this.handleQuillChange}
          placeholder="توضیحات کار خود را وارد کنید"
        />
      </FormGroup>
            <FormGroup>
            {this.state.activeItem.is_event ? (
                <>
                  <Label for="start_date">تاریخ شروع</Label>
                  <br />
                  <JalaliDatePicker
                    selectedDate={this.state.activeItem.due_date}
                    onChange={(date) => {
                      const activeItem = { ...this.state.activeItem, due_date: date };
                      this.setState({ activeItem });
                    }}
                    placeholderText="تاریخ شروع را انتخاب کنید"
                  />
                </>
              ) : (
                <>
                  <Label for="due_date">تاریخ انجام</Label>
                  <br />
                  <JalaliDatePicker
                    selectedDate={this.state.activeItem.due_date}
                    onChange={(date) => {
                      const activeItem = { ...this.state.activeItem, due_date: date };
                      this.setState({ activeItem });
                    }}
                    placeholderText="تاریخ انجام را انتخاب کنید"
                  />
                </>
              )}
            </FormGroup>
            <FormGroup>
            {this.state.activeItem.is_event ? (
                <>
                  <Label for="start_time">زمان شروع</Label>
                  <br />
                  <div style={{dir: 'ltr'}}>
                  <TimePicker
                    theme="material"
                    time={this.state.activeItem.end_time ? this.state.activeItem.end_time : "00:00"}
                    onTimeChange={this.handleTimeChange}
                  />
                  </div>
                </>
              ) : (
                <>
                  <Label for="end_time">زمان پایان</Label>
                  <br />
                  <div style={{dir: 'ltr'}}>
                  <TimePicker
                    theme="material"
                    time={this.state.activeItem.end_time ? this.state.activeItem.end_time : "00:00"}
                    onTimeChange={this.handleTimeChange}
                  />
                  </div>
                </>
              )}
            </FormGroup>
            <FormGroup>
            <Label for="duration">مدت انجام</Label>
            <br />
            <input
              type="number"
              min="0"
              value={this.state.activeItem.duration ? this.state.activeItem.duration : "0"}
              onChange={this.handleDurationChange}
              style={{
                border: '1px solid #d2d2d2',
                borderRadius: '5px',
                padding: '5px',
                marginLeft: '5px'
              }}
            />
            دقیقه
          </FormGroup>
            <FormGroup>
            {/* <Label for="files" >بارگذاری فایل ها</Label> */}
            {/* <Input type="file" name="files" multiple onChange={this.handleFileChange} /> */}
            <Input type="file" id="fileInput" multiple onChange={this.handleFileChange} />
            <Label for="fileInput" class="custom-file-upload" style={{
              border: '1px solid #9c27b0',
              borderRadius: '0.3rem',
              padding: '4px',
              backgroundColor: '#9c27b0',
              color: 'white',
              cursor: 'pointer',
            }}>بارگذاری فایل</Label>
            {this.state.activeItem.files && (
            <>
            {this.state.activeItem.files.map((file, index) => {
              // Check if the file name already exists in the array
              const fileName = file.name && file.name !== '' ? file.name : file.file.split("/")[file.file.split("/").length - 1];
              const isDuplicate = this.state.activeItem.files.some((f, i) => f.name === fileName && i !== index);
              
              return (
                <div dir="ltr">
                {!isDuplicate &&
                <table style={{
                    border: '1px solid #ccc',
                    width: '100%',
                    borderCollapse: 'separate',
                    borderRadius: '1em',
                    bordeSpacing: '0',
                }}>
                <tr key={index}>
                  <td style={{padding: '1em'}}>
                  
                    <span>{fileName}</span>
                  
                  </td>
                  <td style={{
                      textAlign: 'right',
                      padding: '1em',
                  }}>
                  {!isDuplicate && <button className="btn btn-danger btn-sm" style={{marginLeft: '5px', marginRight: '5px'}} onClick={() => this.handleFileRemove(index)}>حذف</button>}
                  {!isDuplicate && file.file && <button className="btn btn-primary btn-sm" onClick={(event) => this.handleDownload(event, file)}>دانلود</button>}
                  </td>
                  </tr>
                </table>}
                </div>
              );
            })}
          </>
          )}
          </FormGroup>

          <FormGroup>
          <Label for="tags">برچسب ها</Label>
          <ReactTags
            dir="ltr"
            tags={tgs}       
            suggestions={[]} // Optionally, you can provide suggestions for autocomplete
            placeholder="برچسب دلخواه را وارد کنید"
            handleDelete={(index) =>
              this.handleTagChange(
                this.state.activeItem.tags.filter((_, i) => i !== index)
              )
            }
            handleAddition={(tag) => this.handleTagChange([...this.state.activeItem.tags, tag])}
          />
        </FormGroup>

        <FormGroup check>
              <Label for="send_email_notification">
                <Input
                  type="checkbox"
                  name="send_email_notification"
                  checked={this.state.activeItem.send_email_notification }
                  onChange={this.handleChange}
                />
                یادآوری با ایمیل
              </Label>
            </FormGroup>        

            <FormGroup check>
              <Label for="completed">
                <Input
                  type="checkbox"
                  name="completed"
                  checked={this.state.activeItem.completed}
                  onChange={this.handleChange}
                />
                تمام شده
              </Label>
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button
            color="success"
            onClick={() => onSave(this.state.activeItem)}
          >
            ذخیره
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}