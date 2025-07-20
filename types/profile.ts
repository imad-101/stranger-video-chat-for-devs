export interface ProfileData {
  name: string;
  age: string;
  interests: string[];
  bio: string;
  lookingFor: string;
}

export interface ProfileStep {
  title: string;
  key: keyof ProfileData;
  subtitle?: string;
}

export const INTERESTS_OPTIONS = [
  "💻 Coding",
  "🚀 Startups",
  "🎨 Design",
  "📱 Mobile Dev",
  "🌐 Web Dev",
  "🤖 AI/ML",
  "📊 Data Science",
  "🔒 Cybersecurity",
  "🎮 Gaming",
  "🎵 Music",
  "📚 Reading",
  "🏃‍♂️ Fitness",
  "🍳 Cooking",
  "✈️ Travel",
  "📷 Photography",
  "🎬 Movies",
  "🧠 Philosophy",
  "💰 Finance",
  "🌱 Environment",
  "🎭 Art",
] as const;

export const LOOKING_FOR_OPTIONS = [
  "👥 Casual Chat",
  "💼 Networking",
  "🤝 Collaboration",
  "📚 Learning",
  "🎯 Mentorship",
  "💡 Ideas Exchange",
  "🔧 Tech Help",
  "🎉 Fun Conversations",
] as const;

export const PROFILE_STEPS: ProfileStep[] = [
  {
    title: "What's your name?",
    key: "name",
    subtitle: "How should people address you?",
  },
  {
    title: "How old are you?",
    key: "age",
    subtitle: "This helps us match you with peers",
  },
  {
    title: "What are your interests?",
    key: "interests",
    subtitle: "Select all that apply to find like-minded people",
  },
  {
    title: "Tell us about yourself",
    key: "bio",
    subtitle: "Share what makes you unique",
  },
  {
    title: "What are you looking for?",
    key: "lookingFor",
    subtitle: "Help us understand your goals",
  },
];
