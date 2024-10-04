import { Button } from '@mui/material';
import Lottie from 'lottie-react';
import React, { useState } from 'react'; // Import useState
import mascotAnimation from '../../animations/facts.json';
import FactFamilySection from './FactFamilySection'; // Adjust the path as necessary
import MathFactFamilyQuiz from './FactsGame';

export default function MathMasterQuest() {
  const [showQuiz, setShowQuiz] = useState(false); // State to control showing the quiz

  // Function to handle the Practice button click
  const handlePracticeClick = () => {
    setShowQuiz(true); // Show the quiz when the button is clicked
  };

  return (
    <div className="relative flex flex-col max-w-screen-lg mx-auto pb-5 font-sans p-4">

      {/* Conditionally Render the Quiz */}
      {showQuiz ? (
        <MathFactFamilyQuiz />
      ) : (
        <>
          {/* Lottie Animation Container */}
          <div className="flex items-center justify-center mb-6">
            <Lottie
              animationData={mascotAnimation}
              loop={true}
              className="w-1/2 md:w-1/3"
            />
          </div>

          {/* Teacher's Note */}
          <div className="bg-green-100 p-4 pt-0 rounded-lg mb-5 text-center w-full">
            <h3 className="font-bold text-lg text-green-700">Teacher&apos;s Tip</h3>
            <p className="text-gray-700">
              When we know one fact, we can use it to solve other problems too! It&apos;s like finding clues to a puzzle.
            </p>
          </div>

          {/* Title Section: Addition and Subtraction */}
          <div className="flex flex-col justify-start bg-orange-100 p-4 rounded-lg mb-5">
            <h3 className="font-bold text-lg text-green-900 text-center">Addition and Subtraction Facts</h3>
          </div>

          {/* Addition and Subtraction Section */}
          <FactFamilySection
            title="Addition and Subtraction Facts"
            imageSrc="/images/add-sub.png" // Ensure this image exists in your public/images directory
            imageAlt="Addition and Subtraction Fact Family Triangle"
            bgColor="#e0f7fa" // Light cyan background
            borderColor="#a7a7a7" // Gray border
            factType="➕ & ➖"
            numbers={[8, 4, 12]}
            operations={['+', '-', '-']}
          />

          {/* Title Section: Multiplication and Division */}
          <div className="flex flex-col justify-start bg-orange-100 p-4 rounded-lg mb-5">
            <h3 className="font-bold text-lg text-green-900 text-center">Multiplication and Division Facts</h3>
          </div>

          {/* Multiplication and Division Section */}
          <FactFamilySection
            title="Multiplication and Division Facts"
            imageSrc="/images/mult-div.png" // Ensure this image exists in your public/images directory
            imageAlt="Multiplication and Division Fact Family Triangle"
            bgColor="#fff9c4" // Light yellow background
            borderColor="#a7a7a7" // Gray border
            factType="✖️ & ➗"
            numbers={[3, 4, 12]}
            operations={['✖️', '➗', '➗']}
          />
          
          {/* Practice Button */}
          <div className="relative flex flex-col justify-center align-middle">
            <Button
              variant="contained"
              color="primary"
              className="my-10 text-base md:text-xl animate-bounce"
              style={{
                backgroundColor: '#7AB416FF',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '5px',
              }}
              onClick={handlePracticeClick} // Set click handler
            >
              Practice!
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
