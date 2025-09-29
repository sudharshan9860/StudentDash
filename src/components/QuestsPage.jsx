import React, { useContext } from 'react';
import { Card, ProgressBar, Button, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrophy, 
  faCalendar, 
  faLevelUpAlt,
  faGift
} from '@fortawesome/free-solid-svg-icons';
import { QuestContext } from '../contexts/QuestContext';
import { QUEST_TYPES, QUEST_DIFFICULTIES } from '../models/QuestSystem';

const QuestCard = ({ quest }) => {
  const { claimQuestReward } = useContext(QuestContext);

  const difficultyColors = {
    [QUEST_DIFFICULTIES.EASY]: 'success',
    [QUEST_DIFFICULTIES.MEDIUM]: 'warning',
    [QUEST_DIFFICULTIES.HARD]: 'danger'
  };

  const typeIcons = {
    [QUEST_TYPES.DAILY]: faCalendar,
    [QUEST_TYPES.WEEKLY]: faLevelUpAlt,
    [QUEST_TYPES.CHALLENGE]: faTrophy
  };

  const getProgressVariant = () => {
    const completionPercentage = quest.getCompletionPercentage();
    if (completionPercentage < 33) return 'danger';
    if (completionPercentage < 66) return 'warning';
    return 'success';
  };

  const handleClaimReward = () => {
    claimQuestReward(quest.id, quest.type);
  };

  return (
    <Card className="mb-3 quest-card">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <FontAwesomeIcon 
              icon={typeIcons[quest.type]} 
              className={`mr-2 text-${difficultyColors[quest.difficulty]}`} 
            />
            <span className={`badge badge-${difficultyColors[quest.difficulty]} mr-2`}>
              {quest.difficulty.toUpperCase()}
            </span>
            <Badge variant="secondary">{quest.type.toUpperCase()}</Badge>
          </div>
          {quest.isCompleted && (
            <Badge variant="success">
              <FontAwesomeIcon icon={faGift} className="mr-1" />
              Completed
            </Badge>
          )}
        </div>
        <h5>{quest.title}</h5>
        <p className="text-muted">{quest.description}</p>
        
        <div className="quest-progress mb-3">
          <ProgressBar 
            now={quest.getCompletionPercentage()} 
            variant={getProgressVariant()}
            label={`${Math.round(quest.getCompletionPercentage())}%`}
          />
          <div className="d-flex justify-content-between mt-1">
            <small>
              {quest.progress} / {quest.goal}
            </small>
            {quest.expiresAt && (
              <small className="text-muted">
                Expires: {new Date(quest.expiresAt).toLocaleDateString()}
              </small>
            )}
          </div>
        </div>

        <div className="quest-rewards">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>Rewards:</strong>
              <div>
                <Badge variant="primary" className="mr-2">
                  {quest.rewards.points} Points
                </Badge>
                <Badge variant="info">
                  {quest.rewards.experience} XP
                </Badge>
                {quest.rewards.items && quest.rewards.items.map((item, index) => (
                  <Badge key={index} variant="warning" className="ml-2">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
            {quest.isCompleted && !quest.rewardClaimed && (
              <Button 
                variant="success" 
                size="sm"
                onClick={handleClaimReward}
              >
                Claim Reward
              </Button>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

const QuestsPage = () => {
  const { 
    dailyQuests, 
    weeklyQuests, 
    challengeQuests 
  } = useContext(QuestContext);

  return (
    <div className="quests-page container-fluid">
      <h2 className="text-center mb-4">
        <FontAwesomeIcon icon={faTrophy} className="mr-2" />
        Quests
      </h2>

      <div className="row">
        {/* Daily Quests */}
        <div className="col-md-4">
          <h4 className="text-center mb-3">
            <FontAwesomeIcon icon={faCalendar} className="mr-2 text-success" />
            Daily Quests
          </h4>
          {dailyQuests.map(quest => (
            <QuestCard key={quest.id} quest={quest} />
          ))}
        </div>

        {/* Weekly Quests */}
        <div className="col-md-4">
          <h4 className="text-center mb-3">
            <FontAwesomeIcon icon={faLevelUpAlt} className="mr-2 text-warning" />
            Weekly Quests
          </h4>
          {weeklyQuests.map(quest => (
            <QuestCard key={quest.id} quest={quest} />
          ))}
        </div>

        {/* Challenge Quests */}
        <div className="col-md-4">
          <h4 className="text-center mb-3">
            <FontAwesomeIcon icon={faTrophy} className="mr-2 text-danger" />
            Challenge Quests
          </h4>
          {challengeQuests.map(quest => (
            <QuestCard key={quest.id} quest={quest} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestsPage;