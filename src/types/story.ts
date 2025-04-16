
// Define interface for a story segment - text with associated emotion
import { Emotion } from '@/components/Robot';

export interface StorySegment {
  id: string;
  text: string;
  text_fr: string;
  emotion: Emotion;
  sequence_order: number;
  story_id?: string;
  created_at?: string;
}

// Interface for a complete story
export interface Story {
  id: string;
  title: string;
  title_fr: string;
  segments?: StorySegment[];
  created_at?: string;
}

// This sample data is kept for fallback if Supabase isn't available
export const SAMPLE_STORIES: Story[] = [
  {
    id: 'forest-adventure',
    title: 'The Forest Adventure',
    title_fr: 'L\'Aventure dans la Forêt',
    segments: [
      {
        id: '1',
        text: "Once upon a time, there was a little bunny named Hop who lived in a cozy forest.",
        text_fr: "Il était une fois, un petit lapin nommé Hop qui vivait dans une forêt douillette.",
        emotion: 'happy',
        sequence_order: 1
      },
      {
        id: '2',
        text: "One day, dark clouds gathered above the forest, and it started to rain heavily.",
        text_fr: "Un jour, des nuages sombres se rassemblèrent au-dessus de la forêt, et il commença à pleuvoir fortement.",
        emotion: 'sad',
        sequence_order: 2
      },
      {
        id: '3',
        text: "Suddenly, Hop saw a bright flash of lightning that struck a nearby tree!",
        text_fr: "Soudain, Hop vit un éclair brillant qui frappa un arbre proche !",
        emotion: 'confused',
        sequence_order: 3
      },
      {
        id: '4',
        text: "The storm growled louder and louder, making Hop feel scared.",
        text_fr: "L'orage grondait de plus en plus fort, faisant peur à Hop.",
        emotion: 'angry',
        sequence_order: 4
      },
      {
        id: '5',
        text: "But then, Hop remembered the warm burrow where all his family waited. He hopped quickly through the rain and made it safely home.",
        text_fr: "Mais alors, Hop se souvint du terrier chaud où toute sa famille l'attendait. Il sauta rapidement à travers la pluie et rentra chez lui en sécurité.",
        emotion: 'happy',
        sequence_order: 5
      }
    ]
  },
  {
    id: 'space-journey',
    title: 'Journey to the Stars',
    title_fr: 'Voyage vers les Étoiles',
    segments: [
      {
        id: '1',
        text: "Zara was a little girl who loved looking at the stars every night before bed.",
        text_fr: "Zara était une petite fille qui adorait regarder les étoiles chaque soir avant de se coucher.",
        emotion: 'happy',
        sequence_order: 1
      },
      {
        id: '2',
        text: "One night, she noticed that her favorite star was missing from the sky!",
        text_fr: "Une nuit, elle remarqua que son étoile préférée avait disparu du ciel !",
        emotion: 'confused',
        sequence_order: 2
      },
      {
        id: '3',
        text: "Zara felt worried that something bad had happened to her star.",
        text_fr: "Zara s'inquiétait qu'il soit arrivé quelque chose de grave à son étoile.",
        emotion: 'sad',
        sequence_order: 3
      },
      {
        id: '4',
        text: "She decided to build a rocket ship from her bed sheets and pillows to go find it!",
        text_fr: "Elle décida de construire une fusée avec ses draps de lit et ses oreillers pour partir à sa recherche !",
        emotion: 'happy',
        sequence_order: 4
      },
      {
        id: '5',
        text: "When she reached space in her imagination, she discovered her star had just been hiding behind a cloud.",
        text_fr: "Lorsqu'elle atteignit l'espace dans son imagination, elle découvrit que son étoile s'était simplement cachée derrière un nuage.",
        emotion: 'happy',
        sequence_order: 5
      }
    ]
  }
];
