
import React from 'react';
import { Story } from '@/types/story';

/**
 * Format a list of story titles with appropriate separators based on language and number of stories
 */
export const formatStoryTitleList = (
  storyArray: Story[],
  language: 'en' | 'fr',
  onTitleClick: (title: string) => void
): JSX.Element => {
  if (storyArray.length === 0) return <></>;

  const titles = storyArray.map(story => {
    const title = language === 'en' ? story.title : story.title_fr;
    return (
      <span
        key={story.id}
        className="text-sky-500 cursor-pointer"
        onClick={() => onTitleClick(title)}
      >
        "{title}"
      </span>
    );
  });

  if (titles.length === 1) {
    return titles[0];
  } else if (titles.length === 2) {
    return (
      <>
        {titles[0]} {language === 'en' ? ' or ' : ' ou '} {titles[1]}
      </>
    );
  } else {
    const lastTitle = titles.pop();
    return (
      <>
        {titles.reduce((prev, curr, i) => (
          <>
            {prev}{i > 0 ? ', ' : ''}{curr}
          </>
        ))}
        {language === 'en' ? ', or ' : ', ou '}{lastTitle}
      </>
    );
  }
};
