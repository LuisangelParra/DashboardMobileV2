import { useState, useEffect } from 'react';
import { Speaker } from '@/types';

type SpeakersParams = {
  search?: string;
};

export function useSpeakers(params: SpeakersParams = {}) {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchSpeakers = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const allSpeakers: Speaker[] = [
          {
            id: '1',
            name: 'Dr. Sarah Johnson',
            role: 'AI Researcher at TechCorp',
            bio: 'Leading researcher in artificial intelligence with over 15 years of experience. Specializes in machine learning algorithms and neural networks. Published author with multiple patents in AI technology.',
            eventCount: 3,
            rating: 4.9,
          },
          {
            id: '2',
            name: 'Michael Chen',
            role: 'Senior Developer at WebFuture',
            bio: 'Full-stack developer specializing in modern web frameworks and performance optimization. Has led development teams for several high-traffic web applications and contributes to open-source projects.',
            eventCount: 2,
            rating: 4.7,
          },
          {
            id: '3',
            name: 'Jessica Williams',
            role: 'UX Design Director',
            bio: 'Award-winning designer focused on creating intuitive and accessible user experiences. Previously worked with major tech companies and now consults for startups and established businesses alike.',
            eventCount: 4,
            rating: 4.8,
          },
          {
            id: '4',
            name: 'Robert Martinez',
            role: 'CTO at StartupHub',
            bio: 'Technology leader with expertise in scaling infrastructure and building engineering teams. Has successfully guided multiple startups through rapid growth phases and technology transformations.',
            eventCount: 1,
            rating: 4.6,
          },
          {
            id: '5',
            name: 'Emma Davis',
            role: 'Cybersecurity Expert',
            bio: 'Specializing in application security and ethical hacking. Helps organizations identify vulnerabilities and implement robust security practices. Regular speaker at security conferences.',
            eventCount: 2,
            rating: 4.5,
          },
        ];
        
        // Apply filters
        let filteredSpeakers = [...allSpeakers];
        
        if (params.search) {
          const searchTerm = params.search.toLowerCase();
          filteredSpeakers = filteredSpeakers.filter(
            speaker => 
              speaker.name.toLowerCase().includes(searchTerm) ||
              speaker.role.toLowerCase().includes(searchTerm) ||
              speaker.bio.toLowerCase().includes(searchTerm)
          );
        }
        
        setSpeakers(filteredSpeakers);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching speakers:', error);
        setIsLoading(false);
      }
    };

    fetchSpeakers();
  }, [params.search]);

  return {
    speakers,
    isLoading,
  };
}