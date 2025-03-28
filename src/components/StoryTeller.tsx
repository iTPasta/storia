
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pause, Play, StopCircle, Mic } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import Robot, { Emotion } from './Robot';

// Define interface for a story segment - text with associated emotion
interface StorySegment {
  text: string;
  emotion: Emotion;
}

// Interface for a complete story
interface Story {
  id: string;
  title: string;
  segments: StorySegment[];
}

// Sample stories with emotional segments
const SAMPLE_STORIES: Story[] = [
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

const StoryTeller: React.FC = () => {
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [storySearch, setStorySearch] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>('neutral');
  const [currentText, setCurrentText] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  const speakRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { toast } = useToast();
  
  // Initialize SpeechSynthesis
  useEffect(() => {
    speakRef.current = new SpeechSynthesisUtterance();
    speakRef.current.rate = 0.9; // Slightly slower for kids
    speakRef.current.pitch = 1.2; // Slightly higher pitch for a "cuter" voice
    
    // Speech end event to move to next segment
    speakRef.current.onend = () => {
      if (currentStory && currentSegmentIndex < currentStory.segments.length - 1) {
        setCurrentSegmentIndex(prev => prev + 1);
      } else {
        stopStory();
      }
    };
    
    return () => {
      if (speakRef.current) {
        speakRef.current.onend = null;
        window.speechSynthesis.cancel();
      }
    };
  }, [currentStory, currentSegmentIndex]);
  
  // Update emotion and text when segment changes
  useEffect(() => {
    if (currentStory && currentStory.segments[currentSegmentIndex]) {
      const segment = currentStory.segments[currentSegmentIndex];
      setCurrentEmotion(segment.emotion);
      setCurrentText(segment.text);
      
      if (isPlaying && speakRef.current) {
        speakRef.current.text = segment.text;
        window.speechSynthesis.speak(speakRef.current);
      }
    }
  }, [currentStory, currentSegmentIndex, isPlaying]);
  
  // Handle story search and selection
  const handleStoryRequest = () => {
    const foundStory = SAMPLE_STORIES.find(story => 
      story.title.toLowerCase().includes(storySearch.toLowerCase())
    );
    
    if (foundStory) {
      setCurrentStory(foundStory);
      setCurrentSegmentIndex(0);
      setIsPlaying(true);
    } else {
      toast({
        title: "Story not found",
        description: "Let's try another story name!",
        variant: "destructive"
      });
    }
  };
  
  // Speech recognition for story request
  const startListening = () => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      // Use the appropriate SpeechRecognition constructor
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognitionAPI();
      
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      
      recognition.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        setStorySearch(speechResult);
        setIsListening(false);
        
        // Auto-search after voice input
        setTimeout(() => {
          const foundStory = SAMPLE_STORIES.find(story => 
            story.title.toLowerCase().includes(speechResult.toLowerCase())
          );
          
          if (foundStory) {
            setCurrentStory(foundStory);
            setCurrentSegmentIndex(0);
            setIsPlaying(true);
          } else {
            toast({
              title: "Story not found",
              description: "Let's try another story name!",
              variant: "destructive"
            });
          }
        }, 1000);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
        toast({
          title: "Voice recognition error",
          description: "Please try again or type the story name",
          variant: "destructive"
        });
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      setIsListening(true);
      recognition.start();
    } else {
      toast({
        title: "Voice recognition not supported",
        description: "Your browser doesn't support voice recognition",
        variant: "destructive"
      });
    }
  };
  
  // Playback controls
  const playStory = () => {
    setIsPlaying(true);
  };
  
  const pauseStory = () => {
    setIsPlaying(false);
    window.speechSynthesis.pause();
  };
  
  const stopStory = () => {
    setIsPlaying(false);
    setCurrentSegmentIndex(0);
    window.speechSynthesis.cancel();
  };
  
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6 text-primary">StorIA</h1>
      
      <Robot emotion={currentEmotion} isPlaying={isPlaying} />
      
      {currentStory ? (
        <>
          <div className="story-text mt-6">
            {currentText}
          </div>
          
          <div className="control-buttons">
            {isPlaying ? (
              <Button 
                className="control-button bg-robot-accent hover:bg-robot-accent/80"
                onClick={pauseStory}
              >
                <Pause className="mr-2 h-6 w-6" /> Pause
              </Button>
            ) : (
              <Button 
                className="control-button bg-robot-primary hover:bg-robot-primary/80"
                onClick={playStory}
              >
                <Play className="mr-2 h-6 w-6" /> Play
              </Button>
            )}
            
            <Button 
              className="control-button bg-destructive hover:bg-destructive/80"
              onClick={stopStory}
            >
              <StopCircle className="mr-2 h-6 w-6" /> Stop
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center mt-8 w-full">
          <p className="text-2xl mb-4 text-center">What story would you like to hear?</p>
          <p className="text-sm mb-6 text-muted-foreground text-center">
            Try asking for "The Forest Adventure" or "Journey to the Stars"
          </p>
          
          <div className="story-input flex items-center gap-2">
            <Input
              placeholder="Type a story name..."
              value={storySearch}
              onChange={(e) => setStorySearch(e.target.value)}
              className="rounded-full text-lg py-6"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleStoryRequest();
                }
              }}
            />
            
            <Button
              onClick={startListening}
              className={cn(
                "rounded-full p-3", 
                isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-robot-primary hover:bg-robot-primary/80"
              )}
              disabled={isListening}
            >
              <Mic size={24} />
            </Button>
          </div>
          
          <Button
            onClick={handleStoryRequest}
            className="mt-4 bg-robot-primary hover:bg-robot-primary/80 text-lg py-6 px-8 rounded-full"
          >
            Tell me this story!
          </Button>
        </div>
      )}
    </div>
  );
};

export default StoryTeller;
