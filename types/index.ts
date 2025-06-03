// Event types
export type EventCategory = 'Workshop' | 'Presentation' | 'Panel' | 'Networking' | 'Other';

export type Event = {
  id: string;
  name: string;
  description: string;
  category: EventCategory;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  rating: number;
  ratingCount: number;
  tracks: EventCategory[];
  subscribedCount: number;
  maxParticipants: number;
};

// Speaker types
export type Speaker = {
  id: string;
  name: string;
  role: string;
  bio: string;
  eventCount: number;
  rating: number;
};

// Feedback types
export type Feedback = {
  id: string;
  eventId: string;
  eventName: string;
  rating: number;
  comment: string;
  date: string;
};