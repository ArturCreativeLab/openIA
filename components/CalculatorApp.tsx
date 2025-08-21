import React, { useState } from 'react';
import Window from './Window';
import { CalculatorIcon } from './icons';

const CalculatorApp: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [display, setDisplay] = useState('0');
  const [currentValue, setCurrentValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(true);

  const handleDigitClick = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const handleOperatorClick = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (currentValue === null) {
      setCurrentValue(inputValue);
    } else if (operator) {
      const result = performCalculation();
      setCurrentValue(result);
      setDisplay(String(result));
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };
  
  const performCalculation = (): number => {
    const inputValue = parseFloat(display);
    if(currentValue === null || operator === null) return inputValue;

    switch (operator) {
        case '+': return currentValue + inputValue;
        case '-': return currentValue - inputValue;
        case '*': return currentValue * inputValue;
        case '/': return currentValue / inputValue;
        default: return inputValue;
    }
  };

  const handleEqualsClick = () => {
    if (operator) {
      const result = performCalculation();
      setCurrentValue(result);
      setDisplay(String(result));
      setOperator(null);
      setWaitingForOperand(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setCurrentValue(null);
    setOperator(null);
    setWaitingForOperand(true);
  };

  const CalcButton: React.FC<{ onClick: () => void, children: React.ReactNode, className?: string }> = ({ onClick, children, className = '' }) => (
    <button 
      onClick={onClick}
      className={`bg-[#C0C0C0] border-2 border-t-white border-l-white border-r-black border-b-black text-black font-bold focus:outline-none active:border-t-black active:border-l-black active:border-r-white active:border-b-white ${className}`}
    >
        {children}
    </button>
  );

  return (
    <Window 
      title="Calculadora" 
      icon={<CalculatorIcon />} 
      onClose={onClose}
      initialSize={{ width: '220px' }}
      initialPosition={{ x: 200, y: 150 }}
      className="h-auto"
    >
      <div className="bg-[#C0C0C0] p-2 flex flex-col space-y-2">
        <div className="bg-white text-black text-right font-mono text-xl p-2 border-2 border-l-[#808080] border-t-[#808080] border-r-white border-b-white">
          {display}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {['7', '8', '9', '/'].map(val => <CalcButton key={val} onClick={() => val.match(/[0-9]/) ? handleDigitClick(val) : handleOperatorClick(val)}>{val}</CalcButton>)}
          {['4', '5', '6', '*'].map(val => <CalcButton key={val} onClick={() => val.match(/[0-9]/) ? handleDigitClick(val) : handleOperatorClick(val)}>{val}</CalcButton>)}
          {['1', '2', '3', '-'].map(val => <CalcButton key={val} onClick={() => val.match(/[0-9]/) ? handleDigitClick(val) : handleOperatorClick(val)}>{val}</CalcButton>)}
          <CalcButton onClick={handleClear}>C</CalcButton>
          <CalcButton onClick={() => handleDigitClick('0')}>0</CalcButton>
          <CalcButton onClick={handleEqualsClick}>=</CalcButton>
          <CalcButton onClick={() => handleOperatorClick('+')}>+</CalcButton>
        </div>
      </div>
    </Window>
  );
};

export default CalculatorApp;