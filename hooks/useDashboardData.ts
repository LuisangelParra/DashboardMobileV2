import { useState, useEffect } from 'react';
import { Event, Speaker } from '@/types';

type DashboardMetrics = {
  totalEvents: number;
  totalSpeakers: number;
  totalFeedback: number;
  averageRating: number;
  eventsTrend: number;
  speakersTrend: number;
  feedbackTrend: number;
  ratingTrend: number;
};

export function useDashboardData() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalEvents: 0,
    totalSpeakers: 0,
    totalFeedback: 0,
    averageRating: 0,
    eventsTrend: 0,
    speakersTrend: 0,
    feedbackTrend: 0,
    ratingTrend: 0,
  });
  
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [topSpeakers, setTopSpeakers] = useState<Speaker[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const loadDashboardData = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        setMetrics({
          totalEvents: 24,
          totalSpeakers: 42,
          totalFeedback: 156,
          averageRating: 4.7,
          eventsTrend: 12,
          speakersTrend: 8,
          feedbackTrend: 25,
          ratingTrend: 3,
        });
        
        setUpcomingEvents([
          {
            id: '1',
            name: 'Introduction to AI',
            description: 'Learn the basics of artificial intelligence and machine learning in this introductory workshop.',
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
            description: 'Explore the latest trends and technologies shaping the future of web development.',
            category: 'Presentation',
            date: 'Jun 16, 2025',
            time: '2:00 PM - 3:30 PM',
            location: 'Room 101',
            imageUrl: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            rating: 4.5,
            ratingCount: 18,
          },
          {
            id: '3',
            name: 'Networking Mixer',
            description: 'Connect with industry professionals and fellow attendees in this casual networking event.',
            category: 'Networking',
            date: 'Jun 16, 2025',
            time: '6:00 PM - 8:00 PM',
            location: 'Atrium',
            imageUrl: 'https://images.pexels.com/photos/1181622/pexels-photo-1181622.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            rating: 4.2,
            ratingCount: 15,
          },
        ]);
        
        setTopSpeakers([
          {
            id: '1',
            name: 'Dr. Sarah Johnson',
            role: 'AI Researcher at TechCorp',
            bio: 'Leading researcher in artificial intelligence with over 15 years of experience.',
            eventCount: 3,
            rating: 4.9,
          },
          {
            id: '2',
            name: 'Michael Chen',
            role: 'Senior Developer at WebFuture',
            bio: 'Full-stack developer specializing in modern web frameworks and performance optimization.',
            eventCount: 2,
            rating: 4.7,
          },
          {
            id: '3',
            name: 'Jessica Williams',
            role: 'UX Design Director',
            bio: 'Award-winning designer focused on creating intuitive and accessible user experiences.',
            eventCount: 4,
            rating: 4.8,
          },
          {
            id: '4',
            name: 'Robert Martinez',
            role: 'CTO at StartupHub',
            bio: 'Technology leader with expertise in scaling infrastructure and building engineering teams.',
            eventCount: 1,
            rating: 4.6,
          },
        ]);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return {
    metrics,
    upcomingEvents,
    topSpeakers,
    isLoading,
  };
}