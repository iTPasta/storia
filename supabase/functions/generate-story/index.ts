
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { storyName, language } = await req.json();
    const isEnglish = language === 'en';
    
    let prompt = '';
    if (storyName) {
      // Generate a story based on the provided name
      prompt = isEnglish 
        ? `Create a children's story titled "${storyName}" suitable for a robot to tell. The story should have 5 short segments, each with an emotion tag (happy, sad, surprised, angry, or neutral). Format as JSON: { "title": "Story Title", "title_fr": "French Title", "segments": [{"text": "English text", "text_fr": "French text", "emotion": "emotion"}] }. Emotions should match the content of each segment.`
        : `Créez une histoire pour enfants intitulée "${storyName}" adaptée pour être racontée par un robot. L'histoire doit avoir 5 courts segments, chacun avec une étiquette d'émotion (happy, sad, surprised, angry, ou neutral). Format JSON: { "title": "Titre en anglais", "title_fr": "Titre en français", "segments": [{"text": "Texte anglais", "text_fr": "Texte français", "emotion": "émotion"}] }. Les émotions doivent correspondre au contenu de chaque segment.`;
    } else {
      // Generate a random story
      prompt = isEnglish 
        ? `Create a random children's story suitable for a robot to tell. The story should have 5 short segments, each with an emotion tag (happy, sad, surprised, angry, or neutral). Format as JSON: { "title": "Story Title", "title_fr": "French Title", "segments": [{"text": "English text", "text_fr": "French text", "emotion": "emotion"}] }. Emotions should match the content of each segment.`
        : `Créez une histoire aléatoire pour enfants adaptée pour être racontée par un robot. L'histoire doit avoir 5 courts segments, chacun avec une étiquette d'émotion (happy, sad, surprised, angry, ou neutral). Format JSON: { "title": "Titre en anglais", "title_fr": "Titre en français", "segments": [{"text": "Texte anglais", "text_fr": "Texte français", "emotion": "émotion"}] }. Les émotions doivent correspondre au contenu de chaque segment.`;
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    console.log(`Generating story with prompt: ${prompt}`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: isEnglish 
              ? 'You are an AI that creates children\'s stories in both English and French.'
              : 'Vous êtes une IA qui crée des histoires pour enfants en anglais et en français.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    let storyContent = data.choices[0].message.content;
    
    // Extract the JSON object from the response if needed
    try {
      if (storyContent.includes('```json')) {
        storyContent = storyContent.split('```json')[1].split('```')[0].trim();
      } else if (storyContent.includes('```')) {
        storyContent = storyContent.split('```')[1].split('```')[0].trim();
      }
      
      const storyObject = JSON.parse(storyContent);
      
      // Validate and format the story structure
      const formattedStory = {
        id: crypto.randomUUID(),
        title: storyObject.title,
        title_fr: storyObject.title_fr,
        segments: storyObject.segments.map((segment, index) => ({
          id: `generated-${index}`,
          text: segment.text,
          text_fr: segment.text_fr,
          emotion: validateEmotion(segment.emotion),
          sequence_order: index + 1,
        }))
      };
      
      return new Response(JSON.stringify(formattedStory), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error parsing AI response:', error, storyContent);
      throw new Error('Failed to parse the generated story');
    }
  } catch (error) {
    console.error('Error in generate-story function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Helper function to validate emotion
function validateEmotion(emotion: string): 'happy' | 'sad' | 'surprised' | 'angry' | 'neutral' {
  const normalizedEmotion = emotion.toLowerCase().trim();
  const validEmotions = ['happy', 'sad', 'surprised', 'angry', 'neutral'];
  
  if (validEmotions.includes(normalizedEmotion)) {
    return normalizedEmotion as 'happy' | 'sad' | 'surprised' | 'angry' | 'neutral';
  }
  
  // Map common variations to valid emotions
  if (normalizedEmotion.includes('happ') || normalizedEmotion.includes('joy')) {
    return 'happy';
  } else if (normalizedEmotion.includes('sad') || normalizedEmotion.includes('unhapp') || normalizedEmotion.includes('cry')) {
    return 'sad';
  } else if (normalizedEmotion.includes('surp') || normalizedEmotion.includes('shock')) {
    return 'surprised';
  } else if (normalizedEmotion.includes('ang') || normalizedEmotion.includes('mad') || normalizedEmotion.includes('frust')) {
    return 'angry';
  }
  
  // Default to neutral if no match
  return 'neutral';
}
