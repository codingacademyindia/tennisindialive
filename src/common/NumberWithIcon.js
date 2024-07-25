import React from 'react';
import { FaArrowUp, FaArrowDown, FaEquals } from 'react-icons/fa';

const NumberWithIcon = ({ number }) => {
  return (
    <div className="flex items-center space-x-2">
      {number > 0 && <FaArrowUp className="text-green-500" />}
      {number < 0 && <FaArrowDown className="text-red-500" />}
      {number === 0 && <FaEquals className="text-gray-500" />}
      <span>{number}</span>
    </div>
  );
};

export default NumberWithIcon;
