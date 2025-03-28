
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { Story, StorySegment, SAMPLE_STORIES } from '@/types/story';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Emotion } from '@/components/Robot';

interface StorySearchProps {
  onStorySelect: (story: Story) => void;
  availableStories: Story[];
}

const StorySearch: React.FC<StorySearchProps> = ({ onStorySelect, availableStories }) => {
  const [storySearch, setStorySearch] = useState('');
  const [stories, setStories] = useState<Story[]>(availableStories);
  const [isLoading, setIsLoading] = useState(false);
  const { language, t } = useLanguage();
  const { toast } = useToast();
  
  // Helper function to convert emotion string to Emotion type
  const validateEmotion = (emotion: string): Emotion => {
    const validEmotions: Emotion[] = ['happy', 'sad', 'surprised', 'angry', 'neutral'];
    return validEmotions.includes(emotion as Emotion) 
      ? (emotion as Emotion) 
      : 'neutral';
  };
  
  // Fetch stories from Supabase
  useEffect(() => {
    const fetchStories = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('stories')
          .select('id, title, title_fr');
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setStories(data);
        }
      } catch (error) {
        console.error('Error fetching stories:', error);
        toast({
          title: t('Error fetching stories', 'Erreur lors de la récupération des histoires'),
          description: t('Using fallback sample stories', 'Utilisation des histoires d\'exemple'),
          variant: 'destructive'
        });
        
        // Use sample stories as fallback
        setStories(SAMPLE_STORIES);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStories();
  }, [t, toast]);
  
  const handleStoryRequest = async () => {
    const searchTerm = storySearch.toLowerCase();
    
    const foundStory = stories.find(story => 
      (language === 'en' ? story.title : story.title_fr).toLowerCase().includes(searchTerm)
    );
    
    if (foundStory) {
      try {
        // Fetch story segments
        const { data: segmentsData, error } = await supabase
          .from('story_segments')
          .select('*')
          .eq('story_id', foundStory.id)
          .order('sequence_order', { ascending: true });
        
        if (error) throw error;
        
        if (segmentsData) {
          // Convert the segments to the correct type
          const typedSegments: StorySegment[] = segmentsData.map(segment => ({
            ...segment,
            emotion: validateEmotion(segment.emotion)
          }));
          
          const completeStory: Story = {
            ...foundStory,
            segments: typedSegments
          };
          
          onStorySelect(completeStory);
        }
      } catch (error) {
        console.error('Error fetching story segments:', error);
        toast({
          title: t('Error fetching story details', 'Erreur lors de la récupération des détails de l\'histoire'),
          variant: 'destructive'
        });
        
        // If we can't get segments from Supabase, try to use local sample
        const fallbackStory = SAMPLE_STORIES.find(s => s.id === foundStory.id);
        if (fallbackStory) {
          onStorySelect(fallbackStory);
        }
      }
    } else {
      toast({
        title: t('Story not found', 'Histoire non trouvée'),
        description: t('Try another title', 'Essayez un autre titre'),
        variant: 'destructive'
      });
    }
  };

  const handleSearchResult = (transcript: string) => {
    setStorySearch(transcript);
    
    // Auto-search after voice input with a short delay
    setTimeout(() => {
      setStorySearch(transcript);
      handleStoryRequest();
    }, 1000);
  };

  const { isListening, startListening } = useSpeechRecognition({
    onResult: handleSearchResult,
    lang: language === 'en' ? 'en-US' : 'fr-FR'
  });

  return (
    <div className="flex flex-col items-center mt-8 w-full">
      <p className="text-2xl mb-4 text-center">
        {t('What story would you like to hear?', 'Quelle histoire aimeriez-vous entendre?')}
      </p>
      <p className="text-sm mb-6 text-muted-foreground text-center">
        {language === 'en' 
          ? `Try asking for "${stories[0]?.title}" or "${stories[1]?.title}"`
          : `Essayez de demander "${stories[0]?.title_fr}" ou "${stories[1]?.title_fr}"`}
      </p>
      
      <div className="story-input flex items-center gap-2">
        <Input
          placeholder={t('Type a story name...', 'Tapez un nom d\'histoire...')}
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
        disabled={isLoading}
      >
        {t('Tell me this story!', 'Raconte-moi cette histoire!')}
      </Button>
    </div>
  );
};

export default StorySearch;
