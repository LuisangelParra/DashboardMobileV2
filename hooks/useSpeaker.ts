import { useState, useEffect } from 'react';
import { Speaker, Event } from '@/types';

export function useSpeaker(id: string) {
  const [speaker, setSpeaker] = useState<(Speaker & {
    company?: string;
    imageUrl?: string;
    social?: {
      linkedin?: string;
      twitter?: string;
      website?: string;
    };
  }) | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchSpeakerDetails = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data for speakers
        const speakers = [
          {
            id: '1',
            name: 'Dr. Sarah Johnson',
            role: 'AI Researcher',
            company: 'TechCorp',
            bio: 'Leading researcher in artificial intelligence with over 15 years of experience. Specializes in machine learning algorithms and neural networks. Published author with multiple patents in AI technology.',
            expertise: ['Machine Learning', 'Neural Networks', 'Computer Vision', 'Natural Language Processing'],
            eventCount: 3,
            rating: 4.9,
            imageUrl: 'https://images.pexels.com/photos/3796217/pexels-photo-3796217.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            social: {
              linkedin: 'https://linkedin.com/in/sarahjohnson',
              twitter: 'https://twitter.com/drsarah',
              website: 'https://sarahjohnson.ai',
            },
          },
          {
            id: '2',
            name: 'Michael Chen',
            role: 'Senior Developer',
            company: 'WebFuture',
            bio: 'Full-stack developer specializing in modern web frameworks and performance optimization. Has led development teams for several high-traffic web applications and contributes to open-source projects.',
            expertise: ['React', 'Node.js', 'GraphQL', 'Performance Optimization'],
            eventCount: 2,
            rating: 4.7,
            imageUrl: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            social: {
              linkedin: 'https://linkedin.com/in/michaelchen',
              github: 'https://github.com/mchen',
              website: 'https://michaelchen.dev',
            },
          },
        ];
        
        // Find the requested speaker
        const foundSpeaker = speakers.find(s => s.id === id) || null;
        
        if (foundSpeaker) {
          setSpeaker(foundSpeaker);
          
          // Mock events for this speaker
          if (id === '1') {
            setEvents([
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
                id: '5',
                name: 'Future of AI Panel',
                description: 'Industry experts discuss the latest trends and future directions in artificial intelligence.',
                category: 'Panel',
                date: 'Jun 17, 2025',
                time: '2:00 PM - 3:30 PM',
                location: 'Room 101',
                imageUrl: 'https://images.pexels.com/photos/8566472/pexels-photo-8566472.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
                rating: 4.6,
                ratingCount: 15,
              },
            ]);
          } else if (id === '2') {
            setEvents([
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
            ]);
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching speaker details:', error);
        setIsLoading(false);
      }
    };

    if (id) {
      fetchSpeakerDetails();
    }
  }, [id]);

  return {
    speaker,
    events,
    isLoading,
  };
}