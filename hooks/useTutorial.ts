import { useCallback } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { tutorialTips, ActivityId } from '../services/tutorialTips';

const COMPLETED_ACTIVITIES_KEY = 'completedUserActivities';

export const useTutorial = () => {
  const { addNotification } = useNotification();

  const getCompletedActivities = (): Set<ActivityId> => {
    try {
      const completedActivities = localStorage.getItem(COMPLETED_ACTIVITIES_KEY);
      return completedActivities ? new Set(JSON.parse(completedActivities)) : new Set();
    } catch (error) {
      console.error('Error reading completed activities from localStorage:', error);
      return new Set();
    }
  };

  const markActivityAsCompleted = (activityId: ActivityId) => {
    try {
      const completedActivities = getCompletedActivities();
      completedActivities.add(activityId);
      localStorage.setItem(COMPLETED_ACTIVITIES_KEY, JSON.stringify(Array.from(completedActivities)));
    } catch (error) {
      console.error('Error saving completed activity to localStorage:', error);
    }
  };

  const triggerActivity = useCallback(
    (activityId: ActivityId) => {
      const completedActivities = getCompletedActivities();
      if (!completedActivities.has(activityId)) {
        const tip = tutorialTips[activityId];
        if (tip) {
          addNotification(tip.title, tip.message, tip.duration);
          markActivityAsCompleted(activityId);
        }
      }
    },
    [addNotification]
  );

  return { triggerActivity };
};