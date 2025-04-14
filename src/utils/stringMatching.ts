
/**
 * Calculate the Levenshtein distance between two strings
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j - 1] + 1,
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Find the best matching story title using Levenshtein distance
 */
export function findBestMatchingStory(searchTerm: string, stories: { title: string; title_fr: string }[], language: 'en' | 'fr', threshold: number = 5): string | null {
  if (!searchTerm) return null;
  
  searchTerm = searchTerm.toLowerCase().trim();
  let bestMatch: string | null = null;
  let bestDistance = Infinity;

  stories.forEach(story => {
    const storyTitle = (language === 'en' ? story.title : story.title_fr).toLowerCase();
    const distance = levenshteinDistance(searchTerm, storyTitle);
    
    // Only consider matches below threshold
    if (distance <= threshold && distance < bestDistance) {
      bestMatch = language === 'en' ? story.title : story.title_fr;
      bestDistance = distance;
    }
  });

  return bestMatch;
}

