import { useState, useEffect } from 'react';
import { Feedback, Event } from '@/types';

type FeedbackParams = {
  sortBy?: 'date' | 'rating';
  sortOrder?: 'asc' | 'desc';
  eventId?: string | null;
  rating?: number | null;
};

export function useFeedback(params: FeedbackParams = {}) {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [events, setEvents] = useState<Pick<Event, 'id' | 'name'>[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchFeedback = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data for all feedback
        const allFeedback: Feedback[] = [
          {
            id: '101',
            eventId: '1',
            eventName: 'Introduction to AI',
            rating: 5,
            comment: 'Excellent workshop! The content was well-structured and easy to follow. I learned a lot about AI fundamentals.',
            date: 'Jun 15, 2025',
          },
          {
            id: '102',
            eventId: '1',
            eventName: 'Introduction to AI',
            rating: 4,
            comment: 'Very informative session. Would have liked more hands-on examples, but overall it was great.',
            date: 'Jun 15, 2025',
          },
          {
            id: '103',
            eventId: '1',
            eventName: 'Introduction to AI',
            rating: 5,
            comment: 'Dr. Johnson explained complex concepts in a way that was easy to understand. Highly recommend!',
            date: 'Jun 15, 2025',
          },
          {
            id: '201',
            eventId: '2',
            eventName: 'Future of Web Development',
            rating: 5,
            comment: 'Michael\'s insights into upcoming web technologies were eye-opening. Great presentation!',
            date: 'Jun 16, 2025',
          },
          {
            id: '202',
            eventId: '2',
            eventName: 'Future of Web Development',
            rating: 4,
            comment: 'Fascinating look at where web development is headed. The Q&A session was particularly valuable.',
            date: 'Jun 16, 2025',
          },
          {
            id: '301',
            eventId: '3',
            eventName: 'Networking Mixer',
            rating: 3,
            comment: 'Good opportunity to meet other professionals, but the venue was a bit crowded. More structure would have been helpful.',
            date: 'Jun 16, 2025',
          },
          {
            id: '401',
            eventId: '4',
            eventName: 'Mobile App Development Panel',
            rating: 5,
            comment: 'The panelists were extremely knowledgeable and addressed important challenges in mobile development.',
            date: 'Jun 17, 2025',
          },
          {
            id: '402',
            eventId: '4',
            eventName: 'Mobile App Development Panel',
            rating: 4,
            comment: 'Great discussion and insights from industry experts. Would have liked more time for audience questions.',
            date: 'Jun 17, 2025',
          },
        ];
        
        // Mock data for events
        const allEvents = [
          { id: '1', name: 'Introduction to AI' },
          { id: '2', name: 'Future of Web Development' },
          { id: '3', name: 'Networking Mixer' },
          { id: '4', name: 'Mobile App Development Panel' },
          { id: '5', name: 'Cybersecurity Fundamentals' },
        ];
        
        // Set available events
        setEvents(allEvents);
        
        // Apply filters
        let filteredFeedback = [...allFeedback];
        
        if (params.eventId) {
          filteredFeedback = filteredFeedback.filter(
            item => item.eventId === params.eventId
          );
        }
        
        if (params.rating !== null && params.rating !== undefined) {
          filteredFeedback = filteredFeedback.filter(
            item => item.rating === params.rating
          );
        }
        
        // Apply sorting
        const sortBy = params.sortBy || 'date';
        const sortOrder = params.sortOrder || 'desc';
        
        filteredFeedback.sort((a, b) => {
          if (sortBy === 'date') {
            // Sort by date (convert date strings to timestamps)
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
          } else if (sortBy === 'rating') {
            // Sort by rating
            return sortOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating;
          }
          return 0;
        });
        
        setFeedback(filteredFeedback);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching feedback:', error);
        setIsLoading(false);
      }
    };

    fetchFeedback();
  }, [
    params.sortBy,
    params.sortOrder,
    params.eventId,
    params.rating,
  ]);

  return {
    feedback,
    events,
    isLoading,
  };
}