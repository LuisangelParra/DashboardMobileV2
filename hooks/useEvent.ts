import { useState, useEffect } from 'react';
import { Event, Speaker, Feedback } from '@/types';

export function useEvent(id: string) {
  const [event, setEvent] = useState<Event | null>(null);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchEventDetails = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data for events
        const events: Event[] = [
          {
            id: '1',
            name: 'Introduction to AI',
            description: 'Learn the basics of artificial intelligence and machine learning in this introductory workshop. We\'ll cover fundamental concepts, popular frameworks, and practical applications. This session is designed for beginners with no prior experience in AI or machine learning. By the end of the workshop, you\'ll understand key terminology and be able to identify potential AI applications in your own work.',
            category: 'Workshop',
            date: 'Jun 15, 2025',
            time: '10:00 AM - 12:00 PM',
            location: 'Main Hall',
            imageUrl: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            rating: 4.8,
            ratingCount: 24,
          },
          {
            id: '2',
            name: 'Future of Web Development',
            description: 'Explore the latest trends and technologies shaping the future of web development. This presentation will dive into emerging frameworks, tooling improvements, and paradigm shifts in how we build for the web. We\'ll discuss WebAssembly, edge computing, AI-assisted development, and more. Come prepared with questions about how these advancements might affect your development workflow.',
            category: 'Presentation',
            date: 'Jun 16, 2025',
            time: '2:00 PM - 3:30 PM',
            location: 'Room 101',
            imageUrl: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            rating: 4.5,
            ratingCount: 18,
          },
        ];
        
        // Find the requested event
        const foundEvent = events.find(e => e.id === id) || null;
        
        if (foundEvent) {
          setEvent(foundEvent);
          
          // Mock data for speakers associated with this event
          if (id === '1') {
            setSpeakers([
              {
                id: '1',
                name: 'Dr. Sarah Johnson',
                role: 'AI Researcher at TechCorp',
                bio: 'Leading researcher in artificial intelligence with over 15 years of experience.',
                eventCount: 3,
                rating: 4.9,
              },
              {
                id: '3',
                name: 'Jessica Williams',
                role: 'UX Design Director',
                bio: 'Award-winning designer focused on creating intuitive and accessible user experiences.',
                eventCount: 4,
                rating: 4.8,
              },
            ]);
            
            // Mock feedback for this event
            setFeedback([
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
            ]);
          } else if (id === '2') {
            setSpeakers([
              {
                id: '2',
                name: 'Michael Chen',
                role: 'Senior Developer at WebFuture',
                bio: 'Full-stack developer specializing in modern web frameworks and performance optimization.',
                eventCount: 2,
                rating: 4.7,
              },
            ]);
            
            // Mock feedback for this event
            setFeedback([
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
            ]);
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching event details:', error);
        setIsLoading(false);
      }
    };

    if (id) {
      fetchEventDetails();
    }
  }, [id]);

  const deleteEvent = async () => {
    // Simulate API call to delete event
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return success
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  };

  return {
    event,
    speakers,
    feedback,
    isLoading,
    deleteEvent,
  };
}