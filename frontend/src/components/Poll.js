/*anime-tracker\frontend\src\components\poll.js */

import React, { useState } from 'react';
import Poll from '../components/Poll';

const initialPolls = [
  {
    id: 1,
    question: "Which anime has the best animation?",
    options: [
      { text: "Attack on Titan", votes: 10 },
      { text: "Demon Slayer", votes: 15 },
      { text: "Jujutsu Kaisen", votes: 7 }
    ]
  },
  {
    id: 2,
    question: "Who's the best anime protagonist?",
    options: [
      { text: "Naruto", votes: 12 },
      { text: "Luffy", votes: 18 },
      { text: "Eren", votes: 5 }
    ]
  }
];

const Polls = () => {
  const [polls, setPolls] = useState(initialPolls);

  const handleVote = (pollId, optionIndex) => {
    const updatedPolls = polls.map(poll => {
      if (poll.id === pollId) {
        const updatedOptions = [...poll.options];
        updatedOptions[optionIndex].votes += 1;
        return { ...poll, options: updatedOptions };
      }
      return poll;
    });
    setPolls(updatedPolls);
  };

  return (
    <div>
      <h2>Community Polls</h2>
      {polls.map((poll) => (
        <Poll
          key={poll.id}
          pollData={poll}
          onVote={(optionIndex) => handleVote(poll.id, optionIndex)}
        />
      ))}
    </div>
  );
};

export default Polls;
