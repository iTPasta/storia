
import StoryTeller from "@/components/StoryTeller";
import { LanguageProvider } from "@/contexts/LanguageContext";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-8 px-4">
      <div className="w-full max-w-4xl mx-auto">
        <LanguageProvider>
          <StoryTeller />
        </LanguageProvider>
      </div>
    </div>
  );
};

export default Index;
