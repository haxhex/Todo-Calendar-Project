import React, { useState, useRef, useEffect } from 'react';
import moment from 'moment-jalaali';
import 'moment/locale/fa';
import './picker-styles.css';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';
import persianJs from 'persianjs';


function JalaliDatePicker(props) {
  const [selectedDate, setSelectedDate] = useState(moment(props.selectedDate));
  const [isOpen, setIsOpen] = useState(false);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const pickerRef = useRef(null);

  const weekDays = moment.weekdaysMin(true); // Get the abbreviated Persian week day names

  const weekDayLabels = weekDays.map((day) => (
    <div key={day} className="week-day-label">
      {day}
    </div>
  ));

  moment.locale('fa');
  const daysInMonth = moment.jDaysInMonth(selectedDate.jYear(), selectedDate.jMonth());
  let firstDayOfMonth = moment(`${selectedDate.jYear()}/${selectedDate.jMonth() + 1}/1`, 'jYYYY/jM/jD').day();

  const days = [];
  firstDayOfMonth = (firstDayOfMonth + 1) % 7; // Adjust the first day of the month to start from Saturday

  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="day empty"></div>);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(
      <div
        key={`day-${i}`}
        className={`day ${selectedDate.jDate() === i ? 'selected' : ''}`}
        onClick={() => {
          const newSelectedDate = moment(`${selectedDate.jYear()}/${selectedDate.jMonth() + 1}/${i}`, 'jYYYY/jM/jD');
          setSelectedDate(newSelectedDate);
          setIsOpen(false); // close the date picker
          props.onChange(newSelectedDate.format('YYYY-MM-DD')); // call the onChange function and pass the selected date
        }}
      >
        {persianJs(i).englishNumber().toString()}
      </div>
    );
  }

  const handleBlur = (event) => {
    if (pickerRef.current && !pickerRef.current.contains(event.target)) {
      setIsOpen(false); // close the date picker
      setIsMonthDropdownOpen(false); // close the month dropdown
      setIsYearDropdownOpen(false); // close the year dropdown
    }
  };

  useEffect(() => {
    console.log(selectedDate.format('YYYY-MM-DD')); // log the selected date whenever it changes
  }, [selectedDate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false); // close the date picker
        setIsMonthDropdownOpen(false); // close the month dropdown
        setIsYearDropdownOpen(false); // close the year dropdown
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [pickerRef]);

  const handleMonthClick = () => {
    setIsMonthDropdownOpen(!isMonthDropdownOpen);
    setIsYearDropdownOpen(false); // close the year dropdown
  };

  const handleYearClick = () => {
    setIsYearDropdownOpen(!isYearDropdownOpen);
    setIsMonthDropdownOpen(false); // close the month dropdown
  };

  return (
    <div className="jalali-date-picker" ref={pickerRef}>
      <input
        type="text"
        value={persianJs(selectedDate.format('jYYYY/jMM/jDD')).englishNumber().toString()}
        readOnly
        onClick={() => setIsOpen(true)}
        onBlur={handleBlur} // close the date picker when the input field loses focus
        style={props.inputStyles} // Apply the inputStyles prop
      />
      {isOpen && (
        <div className="calendar">
          <div className="header">
            <div className="arrow" onClick={() => setSelectedDate(selectedDate.clone().subtract(1, 'jMonth'))}>
            <MdKeyboardArrowRight />
            </div>
            <div className="month" onClick={handleMonthClick}>
              <select
                value={selectedDate.jMonth()}
                onChange={(event) => setSelectedDate(selectedDate.clone().jMonth(parseInt(event.target.value)))}
                style={{
                  borderRadius: '5px',
                  border: '1px solid #d7d7d7',
                  marginLeft: '5px',
                  padding: '2px 5px',
                }}
              >
                {moment.localeData('fa').jMonths().map((month, index) => (
                  <option key={index} value={index}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div className="year" onClick={handleYearClick}>
              <select
                value={selectedDate.jYear()}
                onChange={(event) => setSelectedDate(selectedDate.clone().jYear(parseInt(event.target.value)))}
                style={{
                  borderRadius: '5px',
                  border: '1px solid #d7d7d7',
                  marginLeft: '5px',
                  padding: '2px 5px',
                }}
              >
                {Array.from({ length: 11 }, (_, i) => selectedDate.jYear() - 5 + i).map((year) => (
                  <option key={year} value={year}>
                    {persianJs(year).englishNumber().toString()}
                  </option>
                ))}
              </select>
            </div>
            <div className="arrow" onClick={() => setSelectedDate(selectedDate.clone().add(1, 'jMonth'))}>
            <MdKeyboardArrowLeft />
            </div>
          </div>
          <div>{weekDayLabels}</div>
          <div className="days">{days}</div>
        </div>
      )}
    </div>
  );
}

export default JalaliDatePicker;
