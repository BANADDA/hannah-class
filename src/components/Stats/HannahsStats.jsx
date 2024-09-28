// HannahsStats.js

import { Star } from 'lucide-react';
import React from 'react';

const HannahsStats = ({ starsEarned }) => {
    const levels = [
        "Level 1",
        "Level 2",
        "Level 3",
        "Level 4",
        "Level 5",
        "Level 6"
    ];

    const maxStars = 5; // Maximum stars per level

    return (
        <div className="p-4 border-2 border-dashed border-gray-300 bg-white w-full max-w-md rounded-lg shadow-md">
            <h2 className="text-center font-bold text-2xl mb-4">Hannah's Stats</h2>
            <div className="flex flex-col space-y-4">
                {levels.map((level, index) => (
                    <div key={index} className="flex justify-between items-center">
                        <span className="font-medium">{level}</span>
                        <div className="flex">
                            {[...Array(maxStars)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={24}
                                    color={i < starsEarned[index] ? "gold" : "gray"}
                                    stroke={i < starsEarned[index] ? "gold" : "gray"}
                                    fill={i < starsEarned[index] ? "gold" : "none"}
                                    className="mx-0.5"
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HannahsStats;
