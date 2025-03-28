
# StorIA - Interactive Storytelling Robot for Kids

StorIA is a web application featuring a cute robot that tells stories to children aged 5-7 years old. The robot displays different facial expressions that match the emotional tone of each story segment.

## Project Setup

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server

## Adding Robot Assets

### Robot Frame
Add the robot frame image to the public folder:
- Create a file named `robot_frame.png` in the `/public` folder
- The robot frame should be a PNG image with a transparent center where the robot's face will appear

### Emotion GIFs
Add the emotion GIF files to the `/public/emotions/` folder:
- Create a folder named `emotions` in the `/public` directory
- Add the following GIF files for different emotions:
  - `happy.gif`
  - `sad.gif`
  - `surprised.gif`
  - `angry.gif`
  - `neutral.gif`

The emotion GIFs should be designed to fit within the robot's face area, with an offset of 50 pixels from all sides of the frame.

## Features

- Robot with dynamic facial expressions
- Text-to-speech narration of stories
- Voice recognition for story selection
- Pause and stop controls for the storytelling
- Kid-friendly interface

## Adding More Stories

To add more stories, edit the `SAMPLE_STORIES` array in `src/components/StoryTeller.tsx`. Each story should have:

- A unique ID
- A title
- An array of segments, each with:
  - Text content
  - Associated emotion (happy, sad, surprised, angry, or neutral)

## Browser Compatibility

This application uses the Web Speech API for text-to-speech and speech recognition. These features may not be supported in all browsers. For best results, use Chrome or Edge.
