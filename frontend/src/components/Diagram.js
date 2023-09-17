import React, { Component } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import * as shamsi from 'shamsi-date-converter';
import './diag-style.css'; // Import your CSS file for custom styling
import persianJs from 'persianjs';

class Diagram extends Component {
  render() {
    const { filteredList } = this.props;
    console.log('filteredList: ', filteredList)
    const dateDurationMap = {};

    filteredList.forEach((item) => {
      const dueDate = new Date(item.due_date);
      const jalaliDueDate = shamsi.gregorianToJalali(dueDate).join('/');
      const formattedDate = jalaliDueDate;

      if (!dateDurationMap[formattedDate]) {
        dateDurationMap[formattedDate] = 0;
      }

      if (item.duration) {
        console.log('item.duration: ', item.duration)
        // dateDurationMap[formattedDate] += parseFloat(item.duration);
        // console.log(dateDurationMap[formattedDate])
        // Convert duration to minutes before adding to the map
        // const [hours, minutes] = item.duration.split(':').map(Number);
        const totalMinutes = item.duration;
        dateDurationMap[formattedDate] += totalMinutes;
        console.log(formattedDate, dateDurationMap[formattedDate])
    }
    });

    const data = Object.keys(dateDurationMap).map((date) => ({
      date,
      duration: dateDurationMap[date].toFixed(2),
    }));

    // Sort data by date in ascending order
    data.sort((a, b) => new Date(a.date) - new Date(b.date));

    console.log('Data: ', data)

    const CustomTooltip = ({ active, payload }) => {
      if (active && payload && payload.length) {
        const totalHours = Math.floor(payload[0].payload.duration/60);
        const totalMinutes = Math.round((payload[0].payload.duration ) - totalHours * 60);  
        return (
          <div className="custom-tooltip">
            <p className="label">تاریخ: {persianJs(payload[0].payload.date.toString()).englishNumber().toString()}</p>
            <p className="label">مدت زمان:  {persianJs(`${totalHours.toString().padStart(2, '0')}:${totalMinutes.toString().padStart(2, '0')}`.toString()).englishNumber().toString()}</p>
          </div>
        );
      }
      return null;
    };
    const maxDuration = Math.max(...data.map(item => item.duration));
    // Calculate the number of ticks and generate tick values
    const numberOfTicks = Math.ceil(maxDuration / 60) + 1;
    const tickValues = Array.from({ length: numberOfTicks }, (_, index) => index * 60);

    console.log(numberOfTicks)
    return (
      <div>
        <div className="diagram" dir="ltr">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
            <XAxis
              dataKey="date"
              angle={-90}
              textAnchor="end"
              height={120}
              tickFormatter={(value) => persianJs(value).englishNumber().toString()} // Convert to Persian numbers
            />
            <YAxis
              tickCount={numberOfTicks}
              domain={[0, maxDuration]}
              ticks={tickValues}
              tickFormatter={(value) => persianJs((value / 60).toString()).englishNumber().toString()} // Convert to Persian numbers
            />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="duration" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }
}

export default Diagram;
