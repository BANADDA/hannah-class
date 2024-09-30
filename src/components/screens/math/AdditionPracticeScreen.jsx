// AdditionPracticeScreen.jsx

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { Smartphone } from 'lucide-react';
import { useState } from 'react';
import AdditionWithPictures from './AdditionWithPictures';

const AdditionPracticeScreen = ({ onBack }) => {
  const [selectedPractice, setSelectedPractice] = useState(null)
  // Ensure each practice item has a unique 'id'
  const practices = [
    { id: 1, title: 'Addition with Pictures', completed: 0, total: 5, hasApp: true },
    { id: 2, title: 'Choose Addition Pictures', completed: 0, total: 5, hasApp: false },
    { id: 3, title: 'Choose Addition Pictures Up to 10', completed: 0, total: 5, hasApp: false },
    { id: 4, title: 'Add Two Numbers Up to 5', completed: 0, total: 5, hasApp: false },
    { id: 5, title: 'How to Make a Number with Sums Up to 10', completed: 0, total: 5, hasApp: false },
    { id: 6, title: 'Count Groups of Ten to 10, 50, 100', completed: 0, total: 5, hasApp: false },
  ]; 

  const handlePracticeClick = (practice) => {
    if (practice.hasApp) { // Ensure the practice is available
      setSelectedPractice(practice);
    } else {
      alert('This practice is coming soon!');
    }
  };

  return (
    <div className='py-14 px-5'>
      {/* Header Section */}
      <header className="bg-white text-black text-center text-3xl font-bold">
        Addition
      </header>

      {/* Conditional Rendering */}
      {!selectedPractice ? (
        // Practices List
        <div className="flex flex-col mt-4">
          {practices.map((practice) => (
            <Card
              key={practice.id}
              variant="outlined"
              sx={{
                backgroundColor: '#EBEEF3FF',
                transition: 'background-color 0.3s ease-in-out',
                '&:hover': {
                  backgroundColor: '#CDD7E0FF',
                },
                boxShadow: 'none',
                border: 'none',
                marginBottom: '1rem',
                cursor: practice.hasApp ? 'pointer' : 'not-allowed',
                opacity: practice.hasApp ? 1 : 0.6,
              }}
              className="mb-4 transition-all duration-300 ease-in-out"
              onClick={() => handlePracticeClick(practice)}
            >
              <CardContent sx={{ padding: '1rem', fontWeight: "bold" }}>
                <div className="flex items-center justify-between">
                  {/* Practice Details */}
                  <div className="flex items-center space-x-4 flex-grow">
                    <div className="text-gray-500 w-12 text-center">
                      {practice.completed}/{practice.total}
                    </div>
                    <div className="text-gray-700 flex-grow">
                      {practice.title}
                    </div>
                  </div>

                  {/* Icon or Indicator */}
                  {practice.hasApp ? (
                    <Smartphone className="w-6 h-6 text-green-500" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-green-500 flex-shrink-0"></div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Render Selected Practice Component
        <AdditionWithPictures onBack={() => setSelectedPractice(null)} />
      )}
    </div>
  );
};

export default AdditionPracticeScreen;
