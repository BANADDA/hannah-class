// SkillGrid.jsx

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Tooltip,
} from '@mui/material';
import { Award, Calculator, Clock, Lock } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import useSound from 'use-sound';
import AdditionPracticeScreen from './math/AdditionPracticeScreen';

// Sound file URLs
const hoverSoundUrl = '/sounds/hover-sound.mp3';
const navigateSoundUrl = '/sounds/navigate.wav';

const SkillCircle = ({ color, icon, name, progress, locked, onClick }) => {
  const [playHover] = useSound(hoverSoundUrl, { volume: 0.5 });

  const handleMouseEnter = () => {
    if (!locked) {
      playHover();
    }
  };

  return (
    <Tooltip title={name} arrow>
      <Box
        sx={{
          opacity: locked ? 0.7 : 1,
          textAlign: 'center',
          cursor: locked ? 'not-allowed' : 'pointer',
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: locked ? 'none' : 'scale(1.05)',
          },
        }}
        onClick={locked ? null : onClick}
        onMouseEnter={handleMouseEnter}
      >
        <Box sx={{ position: 'relative' }}>
          <Box
            sx={{
              width: { xs: 48, sm: 56, md: 64 },
              height: { xs: 48, sm: 56, md: 64 },
              borderRadius: '50%',
              backgroundColor: color,
              mb: 1,
              position: 'relative',
              transition: 'box-shadow 0.2s ease-in-out',
              '&:hover': {
                boxShadow: locked ? 'none' : `0 0 10px ${color}`,
              },
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                border: `4px solid ${color}`,
                borderRadius: '50%',
                clipPath:
                  progress === 100
                    ? 'none'
                    : `polygon(50% 50%, -50% -50%, ${
                        50 + Math.cos((progress / 100) * Math.PI * 2) * 100
                      }% ${50 - Math.sin((progress / 100) * Math.PI * 2) * 100}%)`,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: { xs: 16, sm: 20, md: 24 },
              }}
            >
              {icon}
            </Box>
          </Box>
          {locked && (
            <Box
              sx={{
                position: 'absolute',
                right: -10,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'gray',
                borderRadius: '50%',
                p: 0.5,
                border: '2px solid white',
              }}
            >
              <Lock size={16} color="white" />
            </Box>
          )}
        </Box>
        <Box sx={{ fontSize: 12, color: locked ? 'gray' : 'inherit' }}>
          {name}
        </Box>
      </Box>
    </Tooltip>
  );
};

const skillLevels = [
  {
    category: 'Basic',
    checkpoint: true,
    name: 'Basic Math Master',
    levels: [
      {
        level: 1,
        skills: [
          {
            color: '#ff3366',
            icon: '➕',
            name: 'Addition',
            progress: 0,
            key: 'addition',
          },
          {
            color: '#ff6699',
            icon: '➖',
            name: 'Subtraction',
            progress: 0,
            key: 'subtraction',
          },
          {
            color: '#ff9933',
            icon: '➗',
            name: 'Division',
            progress: 0,
            key: 'division',
          },
        ],
      },
      {
        level: 2,
        skills: [
          {
            color: '#00FFFF',
            icon: '✖️',
            name: 'Multiplication',
            progress: 0,
            key: 'multiplication',
          },
          {
            color: '#FFD700',
            icon: '🔢',
            name: 'Counting',
            progress: 0,
            key: 'counting',
          },
          {
            color: '#85e085',
            icon: '⚖️',
            name: 'Comparison',
            progress: 0,
            key: 'comparison',
          },
        ],
      },
      {
        level: 3,
        skills: [
          {
            color: '#FFA500',
            icon: '📝',
            name: 'Assignment',
            progress: 0,
            key: 'assignment',
          },
        ],
      },
    ],
  },
  {
    category: 'Advanced',
    checkpoint: true,
    name: 'Advanced Math Master',
    levels: [
      {
        level: 1,
        skills: [
          {
            color: '#6A5ACD',
            icon: '📏',
            name: 'Measurement',
            progress: 0,
            key: 'measurement',
          },
          {
            color: '#FF69B4',
            icon: '🔢',
            name: 'Number Patterns',
            progress: 0,
            key: 'numberPatterns',
          },
        ],
      },
      {
        level: 2,
        skills: [
          {
            color: '#8B4513',
            icon: '📐',
            name: 'Geometry',
            progress: 0,
            key: 'geometry',
          },
          {
            color: '#228B22',
            icon: '🧮',
            name: 'Problem Solving',
            progress: 0,
            key: 'problemSolving',
          },
        ],
      },
      {
        level: 3,
        skills: [
          {
            color: '#FFA500',
            icon: '📝',
            name: 'Assignment',
            progress: 0,
            key: 'advancedAssignment',
          },
        ],
      },
    ],
  },
];

const chartData = [
  { day: 'M', xp: 50 },
  { day: 'T', xp: 80 },
  { day: 'W', xp: 120 },
  { day: 'Th', xp: 90 },
  { day: 'F', xp: 100 },
  { day: 'Sa', xp: 180 },
  { day: 'Su', xp: 110 },
];

const achievements = [
  { icon: '🎓', color: '#4caf50', name: 'Counting Champion' },
  { icon: '🏆', color: '#ffeb3b', name: 'Shape Master' },
  { icon: '⭐', color: '#2196f3', name: 'Color Expert' },
  { icon: '🎯', color: '#9c27b0', name: 'Quick Counter' },
  { icon: '🏅', color: '#ff9800', name: '7-Day Streak' },
];

const SkillGrid = () => {
  const [currentSkill, setCurrentSkill] = useState(null);
  const [overallProgress, setOverallProgress] = useState({});

  // Load the navigate sound
  const [playNavigate] = useSound(navigateSoundUrl, { volume: 0.5 });

  useEffect(() => {
    // Load overall progress from localStorage
    const storedProgress = localStorage.getItem('overallProgress');
    if (storedProgress) {
      setOverallProgress(JSON.parse(storedProgress));
    }
  }, []);

  const handleSkillClick = (skill) => {
    if (skill.locked) return;

    // Play navigate sound
    playNavigate();

    // Handle skill click
    switch (skill.key) {
      case 'addition':
        setCurrentSkill('addition');
        break;
      // Handle other skills as needed
      default:
        break;
    }
  };

  const handleAdditionCompletion = () => {
    // Update overall progress
    const updatedProgress = { ...overallProgress, additionCompleted: true };
    localStorage.setItem('overallProgress', JSON.stringify(updatedProgress));
    setOverallProgress(updatedProgress);

    // Play navigate sound when returning to SkillGrid
    playNavigate();

    // Return to SkillGrid
    setCurrentSkill(null);
  };

  return currentSkill === 'addition' ? (
    <AdditionPracticeScreen onCompletion={handleAdditionCompletion} />
  ) : (
    <Box sx={{ maxWidth: '1200px', margin: '0 auto', p: 2, pt: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
        <Box
          sx={{
            flex: 3,
            position: 'relative',
            mr: { md: 2 },
            mb: { xs: 2, md: 0 },
          }}
        >
          {/* Tree layout */}
          <Box sx={{ position: 'relative', pt: 2 }}>
            {skillLevels.map((category, categoryIndex) => (
              <Box key={categoryIndex}>
                {/* Category Checkpoint at the Start */}
                <Box
                  sx={{
                    backgroundColor:
                      category.category === 'Basic' ? '#4caf50' : '#ccc',
                    borderRadius: 1,
                    p: 1,
                    fontSize: 14,
                    color: category.category === 'Basic' ? 'white' : '#333',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <Award style={{ width: 20, height: 20, marginRight: 8 }} />
                  {category.name}
                </Box>

                {category.levels.map((level, levelIndex) => (
                  <Box key={levelIndex}>
                    {/* Level Label at the Start */}
                    <Box
                      sx={{
                        textAlign: 'center',
                        fontSize: 16,
                        fontWeight: 'bold',
                        mb: 1,
                      }}
                    >
                      {category.category} Level {level.level}
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        mb: { xs: 4, md: 5 },
                        position: 'relative',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: { xs: 2, sm: 4, md: 8 },
                          justifyContent: 'center',
                        }}
                      >
                        {level.skills.map((skill, skillIndex) => {
                          // Determine if the skill is locked
                          let isLocked = true;
                          if (category.category === 'Basic') {
                            if (skill.name === 'Addition') {
                              isLocked = false; // Always unlocked
                            } else if (skill.name === 'Subtraction') {
                              // Unlock Subtraction if Addition is completed
                              isLocked = !overallProgress.additionCompleted;
                            } else {
                              isLocked = true; // Lock other skills
                            }
                          } else {
                            isLocked = true; // Lock all Advanced skills
                          }

                          return (
                            <SkillCircle
                              key={skillIndex}
                              {...skill}
                              locked={isLocked}
                              onClick={() =>
                                handleSkillClick({
                                  ...skill,
                                  locked: isLocked,
                                })
                              }
                            />
                          );
                        })}
                      </Box>
                      {/* Connectors */}
                      {levelIndex < category.levels.length - 1 && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: '100%',
                            left: '50%',
                            width: 2,
                            height: { xs: 20, md: 40 },
                            backgroundColor: '#ccc',
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ pt: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  mb: 2,
                }}
              >
                <Box sx={{ mb: { xs: 2, sm: 0 } }}>
                  <Box
                    sx={{
                      fontSize: 32,
                      fontWeight: 'bold',
                      color: '#FF9900',
                    }}
                  >
                    157
                  </Box>
                  <Box sx={{ fontSize: 14, color: '#888' }}>
                    Math Points
                  </Box>
                </Box>
                <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                  <Box sx={{ fontSize: 14, fontWeight: 500 }}>Level 1</Box>
                  <Box sx={{ fontSize: 12, color: '#888' }}>
                    Beginner Mathematician
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: 14,
                      color: '#888',
                      mt: 1,
                    }}
                  >
                    <Clock
                      style={{ width: 16, height: 16, marginRight: 4 }}
                    />
                    15 mins practiced today
                  </Box>
                </Box>
              </Box>
              <Box sx={{ height: 128 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} />
                    <YAxis hide={true} />
                    <Line
                      type="monotone"
                      dataKey="xp"
                      stroke="#FF9900"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
              <Button
                variant="contained"
                color="primary"
                sx={{ width: '100%', mt: 2 }}
                startIcon={<Calculator style={{ width: 16, height: 16 }} />}
              >
                Start Math Practice
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader
              title="Achievements"
              action={
                <Button variant="text" size="small" sx={{ color: 'blue' }}>
                  View all
                </Button>
              }
            />
            <CardContent>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {achievements.map((achievement, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        backgroundColor: achievement.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: 24,
                        mb: 1,
                      }}
                    >
                      {achievement.icon}
                    </Box>
                    <Box
                      sx={{
                        fontSize: 12,
                        color: '#888',
                        textAlign: 'center',
                      }}
                    >
                      {achievement.name}
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default SkillGrid;
