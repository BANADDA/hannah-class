// FactFamilySection.jsx
import React from 'react';

const FactFamilySection = ({ 
  title, 
  imageSrc, 
  imageAlt, 
  bgColor, 
  borderColor, 
  factType, 
  numbers, 
  operations,
  reverse = false // New prop to control the order
}) => {
  const [a, b, c] = numbers;
  const [op1, op2, op3] = operations;

  // Determine flex direction based on the reverse prop
  const flexDirection = reverse ? 'md:flex-row-reverse' : 'md:flex-row';

  // Determine tail alignment based on the reverse prop
  const tailStyles = reverse 
    ? {
        position: 'absolute',
        bottom: '-15px',
        right: '20px',
        width: 0,
        height: 0,
        borderLeft: '15px solid transparent',
        borderTop: `15px solid ${bgColor}`, // Matching lighter background
        zIndex: 1,
      }
    : {
        position: 'absolute',
        bottom: '-15px',
        left: '20px',
        width: 0,
        height: 0,
        borderRight: '15px solid transparent',
        borderTop: `15px solid ${bgColor}`, // Matching lighter background
        zIndex: 1,
      };

  const shadowStyles = reverse 
    ? {
        position: 'absolute',
        bottom: '-18px',
        right: '19px',
        width: 0,
        height: 0,
        borderLeft: '16px solid transparent',
        borderTop: '16px solid rgba(0, 0, 0, 0.1)', // Softer shadow for tail
      }
    : {
        position: 'absolute',
        bottom: '-18px',
        left: '19px',
        width: 0,
        height: 0,
        borderRight: '16px solid transparent',
        borderTop: '16px solid rgba(0, 0, 0, 0.1)', // Softer shadow for tail
      };

  return (
    <div className={`relative flex flex-col ${flexDirection} items-start md:items-center md:space-x-6 mb-8`}>
      
      {/* Image */}
      <div className="w-full md:w-2/3 flex-shrink-0 mb-4 md:mb-0">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="w-full h-auto object-cover"
        />
      </div>

      {/* Speech Bubble */}
      <div
        className="relative p-6 rounded-lg shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-2xl w-full md:w-1/3"
        style={{
          backgroundColor: bgColor,
          border: `1px solid ${borderColor}`,
          borderRadius: '10px',
          padding: '20px',
          boxShadow: '4px 4px 0 rgba(0, 0, 0, 0.1)',
        }}
      >
        <p className="mt-4"><strong>Understanding {factType} Fact:</strong></p>
        <p>
          In a {factType} fact family, the three numbers will have two {factType.split(' & ').join(' and ')} relationships.
        </p>
        <p className="mt-2"><strong>Example:</strong></p>
        <p><strong>If I know {a} {operations[0]} {b} = {c}...</strong></p>
        <p>Then I know...</p>
        <ul className="list-disc list-inside mb-4">
          <li>{b} {operations[0]} {a} = {c}</li>
          <li>{c} {operations[1]} {a} = {b}</li>
          <li>{c} {operations[2]} {b} = {a}</li>
        </ul>

        {/* Speech Bubble Tail */}
        <div style={tailStyles} />
        <div style={shadowStyles} />
      </div>
    </div>
  );
};

export default FactFamilySection;
