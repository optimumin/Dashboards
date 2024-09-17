import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap CSS is imported

// Map custom colors to Bootstrap color classes
const colorMapping = {
  red: '#c82333',       // More intense red
  yellow: '#ffc107',    // Bootstrap bg-warning
  green: '#28a745',     // Bootstrap bg-success
  blue: '#007bff',      // Bootstrap bg-primary
};

const PieChart = ({ sections }) => {
  const totalMarks = sections.reduce((acc, section) => acc + section.totalMarks, 0);
  let cumulativePercent = 0;

  const slices = sections.map((section, index) => {
    const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
    cumulativePercent += section.totalMarks / totalMarks;
    const [endX, endY] = getCoordinatesForPercent(cumulativePercent);

    const largeArcFlag = section.totalMarks / totalMarks > 0.5 ? 1 : 0;
    const color = colorMapping[section.color] || '#6c757d'; // Fallback to secondary color

    const percentage = Math.round((section.totalMarks / totalMarks) * 100);
    const midPercent = cumulativePercent - (section.totalMarks / totalMarks) / 2;
    const [textX, textY] = getCoordinatesForPercent(midPercent);

    return (
      <React.Fragment key={index}>
        <path
          d={`M ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`}
          fill={color}
        />
        <text
          x={textX * 0.4} // Adjust position for better alignment in a smaller chart
          y={textY * 0.4}
          fill="black" // Text color
          fontSize="0.08" // Smaller font size for percentage
          textAnchor="middle"
          dominantBaseline="middle" // Center vertically
        >
          {percentage}%
        </text>
        <text
          x={textX * 0.4} // Adjust position for better alignment in a smaller chart
          y={textY * 0.4 + 0.06} // Adjust y to place below percentage
          fill="black" // Text color
          fontSize="0.06" // Smaller font size for title
          textAnchor="middle"
          dominantBaseline="middle" // Center vertically
        >
          {section.title}
        </text>
      </React.Fragment>
    );
  });

  return (
    <div className="d-flex justify-content-center">
      <svg viewBox="-1 -1 2 2" style={{ width: '150px', height: '150px', transform: 'rotate(-90deg)' }}>
        {slices}
      </svg>
    </div>
  );
};

const getCoordinatesForPercent = (percent) => {
  const x = Math.cos(2 * Math.PI * percent);
  const y = Math.sin(2 * Math.PI * percent);
  return [x, y];
};

export default PieChart;
