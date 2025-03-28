
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { Story } from '@/types/story';

interface StorySearchProps {
  onStorySelect: (story: Story) => void;
  availableStories: Story[];
}

const StorySearch: React.FC<StorySearchProps> = ({ onStorySelect, availableStories }) => {
  const [storySearch, setStorySearch] = useState('');
  
  const handleStoryRequest = () => {
    const foundStory = availableStories.find(story => 
      story.title.toLowerCase().includes(storySearch.toLowerCase())
    );
    
    if (foundStory) {
      onStorySelect(foundStory);
    }
  };

  const handleSearchResult = (transcript: string) => {
    setStorySearch(transcript);
    
    // Auto-search after voice input
    setTimeout(() => {
      const foundStory = availableStories.find(story => 
        story.title.toLowerCase().includes(transcript.toLowerCase())
      );
      
      if (foundStory) {
        onStorySelect(foundStory);
      }
    }, 1000);
  };

  const { isListening, startListening } = useSpeechRecognition({
    onResult: handleSearchResult
  });

  return (
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
  );
};

export default StorySearch;
