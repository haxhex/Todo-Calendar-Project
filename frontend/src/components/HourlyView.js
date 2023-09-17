import React from 'react';

const HourlyView = ({ day }) => {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    const hour = day.clone().hour(i);
    hours.push(
      <div key={i} className="hour">
        {hour.format('HH:mm')}
      </div>
    );
  }

  return <div className="hourly-view">{hours}</div>;
};

export default HourlyView;
