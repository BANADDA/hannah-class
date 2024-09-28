import { useState } from "react";
import ClassmoWelcomeScreen from "./components/screens/ClassmoWelcomeScreen";
import GameDashboard from "./components/screens/GameOption";


const App = () => {
  const [showDashboard, setShowDashboard] = useState(false); // State to toggle between views

  return (
    <div>
      {showDashboard ? (
        <GameDashboard /> // Show GameOption component
      ) : (
        <ClassmoWelcomeScreen onProceedToDashboard={() => setShowDashboard(true)} /> // Show welcome screen and pass the handler
      )}
    </div>
  );
};

export default App;
