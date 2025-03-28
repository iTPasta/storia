
// Define interface for a story segment - text with associated emotion
import { Emotion } from '@/components/Robot';

export interface StorySegment {
  text: string;
  emotion: Emotion;
}

// Interface for a complete story
export interface Story {
  id: string;
  title: string;
  segments: StorySegment[];
}

// Sample stories with emotional segments
export const SAMPLE_STORIES: Story[] = [
  {
    id: 'forest-adventure',
    title: 'The Forest Adventure',
    segments: [
      {
        text: "Once upon a time, there was a little bunny named Hop who lived in a cozy forest.",
        emotion: 'happy'
      },
      {
        text: "One day, dark clouds gathered above the forest, and it started to rain heavily.",
        emotion: 'sad'
      },
      {
        text: "Suddenly, Hop saw a bright flash of lightning that struck a nearby tree!",
        emotion: 'surprised'
      },
      {
        text: "The storm growled louder and louder, making Hop feel scared.",
        emotion: 'angry'
      },
      {
        text: "But then, Hop remembered the warm burrow where all his family waited. He hopped quickly through the rain and made it safely home.",
        emotion: 'happy'
      }
    ]
  },
  {
    id: 'space-journey',
    title: 'Journey to the Stars',
    segments: [
      {
        text: "Zara was a little girl who loved looking at the stars every night before bed.",
        emotion: 'happy'
      },
      {
        text: "One night, she noticed that her favorite star was missing from the sky!",
        emotion: 'surprised'
      },
      {
        text: "Zara felt worried that something bad had happened to her star.",
        emotion: 'sad'
      },
      {
        text: "She decided to build a rocket ship from her bed sheets and pillows to go find it!",
        emotion: 'happy'
      },
      {
        text: "When she reached space in her imagination, she discovered her star had just been hiding behind a cloud.",
        emotion: 'happy'
      }
    ]
  }
];
