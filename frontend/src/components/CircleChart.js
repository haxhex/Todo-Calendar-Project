import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import persianJs from 'persianjs';

const CircleChart = ({ completedCount, incompleteCount }) => {
  const data = [
    { name: "کار های تمام شده", value: completedCount },
    { name: "کار های ناتمام", value: incompleteCount },
  ];

  const COLORS = ["#0088FE", "#FF8042"];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const taskType = payload[0].payload.name;
      const taskCount = payload[0].payload.value;
      const persianTaskCount = persianJs(taskCount.toString()).englishNumber().toString();

      return (
        <div className="custom-tooltip">
          <p className="label">{taskType}: {persianTaskCount}</p>
        </div>
      );
    }
    return null;
  };

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
      >
        {`${persianJs((percent * 100).toFixed(0)).englishNumber().toString()}%`}
      </text>
    );
  };

  return (
    <div dir="ltr">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            strokeWidth={0}
            innerRadius={0}
            outerRadius={80}
            fill="#8884d8"
            label={renderLabel}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend align="center" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CircleChart;
