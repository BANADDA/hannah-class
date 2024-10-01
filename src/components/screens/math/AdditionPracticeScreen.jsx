// AdditionPracticeScreen.jsx

import { Card, CardContent } from '@mui/material';
import { Smartphone } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import AdditionWithPictures from './AdditionWithPictures'; // Import your practice components
import ChooseAdditionPictures from './ChooseAdditionPictures';

const AdditionPracticeScreen = ({ onCompletion }) => {
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [practiceStates, setPracticeStates] = useState({});

  // Practices with unique IDs
  const practices = [
    { id: 1, title: 'Addition with Pictures', completed: 0, total: 5, hasApp: true },
    { id: 2, title: 'Choose Addition Pictures', completed: 0, total: 5, hasApp: true },
    { id: 3, title: 'Choose Addition Pictures Up to 10', completed: 0, total: 5, hasApp: false },
    { id: 4, title: 'Add Two Numbers Up to 5', completed: 0, total: 5, hasApp: false },
    { id: 5, title: 'How to Make a Number with Sums Up to 10', completed: 0, total: 5, hasApp: false },
    { id: 6, title: 'Count Groups of Ten to 10, 50, 100', completed: 0, total: 5, hasApp: false },
  ];

  // Load practice states from localStorage on initial render
  useEffect(() => {
    const storedStates = localStorage.getItem('additionPracticeStates');
    if (storedStates) {
      setPracticeStates(JSON.parse(storedStates));
    }
  }, []);

  // Save practice states to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('additionPracticeStates', JSON.stringify(practiceStates));
  }, [practiceStates]);

  // Check if all practices are completed
  useEffect(() => {
    const allCompleted = practices.every(
      (practice) => practiceStates[practice.id]?.completed === practice.total
    );
    if (allCompleted && onCompletion) {
      // Update overall progress in localStorage
      const overallProgress = JSON.parse(localStorage.getItem('overallProgress')) || {};
      overallProgress.additionCompleted = true;
      localStorage.setItem('overallProgress', JSON.stringify(overallProgress));

      // Navigate back to SkillGrid
      onCompletion();
    }
  }, [practiceStates, onCompletion]);

  const handlePracticeClick = (practice) => {
    if (practice.hasApp) {
      setSelectedPractice(practice);
    } else {
      alert('This practice is coming soon!');
    }
  };

  // Function to update the state of a specific practice
  const updatePracticeState = (practiceId, newState) => {
    setPracticeStates((prevStates) => ({
      ...prevStates,
      [practiceId]: {
        ...prevStates[practiceId],
        ...newState,
      },
    }));
  };

  // Update practices with completed counts based on practiceStates
  const updatedPractices = practices.map((practice) => {
    const state = practiceStates[practice.id];
    return {
      ...practice,
      completed: state ? state.completed || 0 : 0,
    };
  });

  // Mapping of practice IDs to their corresponding components
  const practiceComponents = {
    1: AdditionWithPictures,
    2: ChooseAdditionPictures,
    // Add more mappings as you create additional components
    // 3: ChooseAdditionPicturesUpTo10,
    // 4: AddTwoNumbersUpTo5,
    // 5: HowToMakeANumberWithSumsUpTo10,
    // 6: CountGroupsOfTen,
  };

  return (
    <div className='py-14 px-5'>
      {/* Header Section */}
      <header className='bg-white text-black text-center text-3xl font-bold'>Addition</header>

      {/* Conditional Rendering */}
      {!selectedPractice ? (
        // Practices List
        <div className='flex flex-col mt-8'>
          {updatedPractices.map((practice) => (
            <Card
              key={practice.id}
              variant='outlined'
              className='mb-4 transition-all duration-300 ease-in-out hover:shadow-lg cursor-pointer'
              onClick={() => handlePracticeClick(practice)}
              sx={{
                backgroundColor: '#EBEEF3FF',
                '&:hover': {
                  backgroundColor: '#CDD7E0FF',
                },
                boxShadow: 'none',
                border: '1px solid #CBD5E0',
                padding: '0.05rem',
                borderRadius: '0.5rem',
              }}
            >
              <CardContent>
                <div className='flex items-center justify-between'>
                  {/* Practice Details */}
                  <div className='flex items-center space-x-4 flex-grow'>
                    <div className='text-gray-500 w-12 text-center'>
                      {practice.completed}/{practice.total}
                    </div>
                    <div className='text-gray-700 flex-grow'>{practice.title}</div>
                  </div>

                  {/* Icon or Indicator */}
                  {practice.hasApp ? (
                    <Smartphone className='w-6 h-6 text-green-500' />
                  ) : (
                    <div className='w-6 h-6 rounded-full border-2 border-green-500 flex-shrink-0'></div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Render Selected Practice Component Dynamically
        React.createElement(practiceComponents[selectedPractice.id], {
          onBack: () => setSelectedPractice(null),
          initialState: practiceStates[selectedPractice.id],
          onStateChange: (newState) => {
            updatePracticeState(selectedPractice.id, newState);
          },
        })
      )}
    </div>
  );
};

export default AdditionPracticeScreen;
