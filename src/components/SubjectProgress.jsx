import React, { useState, useContext } from 'react';
import { 
  Card, 
  ProgressBar, 
  Tooltip, 
  OverlayTrigger,
  Modal,
  Button
} from 'react-bootstrap';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer 
} from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBars, 
  faTrophy, 
  faChartLine, 
  faLevelUpAlt,
  faMedal
} from '@fortawesome/free-solid-svg-icons';

// Subject Progress Configuration
const SUBJECT_LEVELS = {
  MATHEMATICS: [
    { level: 1, name: 'Novice', minPoints: 0, maxPoints: 100 },
    { level: 2, name: 'Apprentice', minPoints: 101, maxPoints: 250 },
    { level: 3, name: 'Scholar', minPoints: 251, maxPoints: 500 },
    { level: 4, name: 'Expert', minPoints: 501, maxPoints: 1000 },
    { level: 5, name: 'Master', minPoints: 1001, maxPoints: Infinity }
  ],
  SCIENCE: [
    { level: 1, name: 'Curious', minPoints: 0, maxPoints: 100 },
    { level: 2, name: 'Investigator', minPoints: 101, maxPoints: 250 },
    { level: 3, name: 'Researcher', minPoints: 251, maxPoints: 500 },
    { level: 4, name: 'Scientist', minPoints: 501, maxPoints: 1000 },
    { level: 5, name: 'Innovator', minPoints: 1001, maxPoints: Infinity }
  ]
};

const SUBJECT_ACHIEVEMENTS = {
  MATHEMATICS: [
    { 
      id: 'math_problem_solver',
      name: 'Problem Solver', 
      description: 'Solve 50 mathematics problems',
      icon: faTrophy,
      requiredPoints: 100
    },
    { 
      id: 'math_theory_master',
      name: 'Theory Master', 
      description: 'Complete all chapters in a subject',
      icon: faMedal,
      requiredPoints: 250
    }
  ],
  SCIENCE: [
    { 
      id: 'science_explorer',
      name: 'Science Explorer', 
      description: 'Explore 3 different science domains',
      icon: faTrophy,
      requiredPoints: 100
    },
    { 
      id: 'science_researcher',
      name: 'Research Enthusiast', 
      description: 'Complete advanced scientific problems',
      icon: faMedal,
      requiredPoints: 250
    }
  ]
};

const SubjectProgressCard = ({ subject, progressData }) => {
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  
  // Determine current level
  const subjectLevels = SUBJECT_LEVELS[subject.toUpperCase()] || SUBJECT_LEVELS.MATHEMATICS;
  const currentLevel = subjectLevels.find(
    level => progressData.points >= level.minPoints && 
             progressData.points < level.maxPoints
  ) || subjectLevels[0];

  // Calculate progress to next level
  const nextLevel = subjectLevels[currentLevel.level] || subjectLevels[subjectLevels.length - 1];
  const progressToNextLevel = nextLevel 
    ? ((progressData.points - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100 
    : 100;

  // Get subject-specific achievements
  const subjectAchievements = SUBJECT_ACHIEVEMENTS[subject.toUpperCase()] || [];
  const unlockedAchievements = subjectAchievements.filter(
    achievement => progressData.points >= achievement.requiredPoints
  );

  // Prepare chart data
  const chartData = progressData.weeklySummary?.dailyLogs 
    ? Object.entries(progressData.weeklySummary.dailyLogs).map(([date, data]) => ({
        date,
        points: data?.points || 0,
        questionsAttempted: data?.questionsAttempted || 0
      }))
    : [];

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div>
          <FontAwesomeIcon icon={faChartLine} className="mr-2" />
          {subject.charAt(0).toUpperCase() + subject.slice(1)} Progress
        </div>
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip>View Achievements</Tooltip>}
        >
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={() => setShowAchievementsModal(true)}
          >
            <FontAwesomeIcon icon={faTrophy} />
          </Button>
        </OverlayTrigger>
      </Card.Header>
      <Card.Body>
        {/* Level and Points */}
        <div className="d-flex justify-content-between mb-3">
          <div>
            <h6 className="text-muted">Current Level</h6>
            <h4>
              <FontAwesomeIcon icon={faLevelUpAlt} className="mr-2" />
              {currentLevel.name} (Level {currentLevel.level})
            </h4>
          </div>
          <div className="text-right">
            <h6 className="text-muted">Total Points</h6>
            <h4>{progressData.points} pts</h4>
          </div>
        </div>

        {/* Level Progress */}
        <div className="mb-3">
          <ProgressBar 
            now={progressToNextLevel} 
            label={`${Math.round(progressToNextLevel)}%`}
            variant="success"
          />
          <div className="d-flex justify-content-between mt-1">
            <small className="text-muted">
              {currentLevel.name} Level
            </small>
            <small className="text-muted">
              Next: {nextLevel ? nextLevel.name : 'Max Level'}
            </small>
          </div>
        </div>

        {/* Performance Chart */}
        <Card className="mt-3">
          <Card.Body>
            <h6 className="mb-3">Weekly Performance</h6>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Line 
                  type="monotone" 
                  dataKey="points" 
                  stroke="#8884d8" 
                  name="Points Earned" 
                />
                <Line 
                  type="monotone" 
                  dataKey="questionsAttempted" 
                  stroke="#82ca9d" 
                  name="Questions Attempted" 
                />
              </LineChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>

        {/* Achievements Modal */}
        <Modal 
          show={showAchievementsModal} 
          onHide={() => setShowAchievementsModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              <FontAwesomeIcon icon={faTrophy} className="mr-2" />
              {subject.charAt(0).toUpperCase() + subject.slice(1)} Achievements
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {subjectAchievements.map((achievement, index) => (
              <Card 
                key={index} 
                className={`mb-3 ${
                  unlockedAchievements.includes(achievement) 
                    ? 'border-success' 
                    : 'border-secondary'
                }`}
              >
                <Card.Body className="d-flex align-items-center">
                  <FontAwesomeIcon 
                    icon={achievement.icon} 
                    className={`mr-3 ${
                      unlockedAchievements.includes(achievement)
                        ? 'text-success' 
                        : 'text-muted'
                    }`} 
                    size="2x" 
                  />
                  <div>
                    <h5 className="mb-1">{achievement.name}</h5>
                    <p className="text-muted mb-1">{achievement.description}</p>
                    <small className={`${
                      unlockedAchievements.includes(achievement)
                        ? 'text-success' 
                        : 'text-muted'
                    }`}>
                      {unlockedAchievements.includes(achievement)
                        ? 'Unlocked' 
                        : `Unlock at ${achievement.requiredPoints} points`}
                    </small>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </Modal.Body>
        </Modal>
      </Card.Body>
    </Card>
  );
};

const SubjectProgress = () => {
  // In a real implementation, this would come from ProgressContext
  const progressData = {
    MATHEMATICS: {
      points: 250,
      weeklySummary: {
        dailyLogs: {
          '2024-02-01': { points: 50, questionsAttempted: 10 },
          '2024-02-02': { points: 40, questionsAttempted: 8 },
          '2024-02-03': { points: 60, questionsAttempted: 12 }
        }
      }
    },
    SCIENCE: {
      points: 150,
      weeklySummary: {
        dailyLogs: {
          '2024-02-01': { points: 30, questionsAttempted: 6 },
          '2024-02-02': { points: 20, questionsAttempted: 4 },
          '2024-02-03': { points: 40, questionsAttempted: 8 }
        }
      }
    }
  };

  return (
    <div>
      <h3 className="text-center mb-4">Subject Progress</h3>
      <SubjectProgressCard 
        subject="mathematics" 
        progressData={progressData.MATHEMATICS} 
      />
      <SubjectProgressCard 
        subject="science" 
        progressData={progressData.SCIENCE} 
      />
    </div>
  );
};

export default SubjectProgress;