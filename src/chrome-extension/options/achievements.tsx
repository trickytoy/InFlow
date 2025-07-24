"use client"

import type React from "react"
import { useTheme } from "./index"
import {
  Trophy,
  Star,
  Target,
  Calendar,
  Clock,
  BookOpen,
  Award,
  Zap,
  Layers,
  Medal,
  Smile,
  Repeat,
  Flame,
  Crown,
  Timer,
  Clock4,
  Sofa,
  Brain,
  EyeOff,
  Activity,
  Bolt,
  Sunrise,
  Moon,
  Undo,
  Coffee,
  CalendarDays,
  MoonStar,
  CalendarCheck,
  Bookmark,
  Coins,
  Check,
} from "lucide-react"

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  unlocked: boolean
  claimed?: boolean
  progress?: number
  maxProgress?: number
  category: "sessions" | "streak" | "focus" | "special" | "time" | "productivity" | "novelty" | "balance" | "milestone"
  coinReward: number
  difficulty: "easy" | "medium" | "hard" | "legendary"
}

interface AchievementsTabProps {
  historyData?: {
    id: number
    action: string
    date: string
    duration?: number
    totalDistractions?: number
  }[]
  heatMapData?: { date: string; count: number }[]
  coins: number
  onClaimAchievement: (achievementId: string, coinReward: number) => void
}

const AchievementsTab = ({ 
  historyData = [], 
  heatMapData = [], 
  coins,
  onClaimAchievement 
}: AchievementsTabProps) => {
  const theme = useTheme()
  
  // Load claimed achievements from localStorage
  const getClaimedAchievements = (): string[] => {
    if (typeof localStorage !== 'undefined') {
      const claimed = localStorage.getItem('claimedAchievements')
      return claimed ? JSON.parse(claimed) : []
    }
    return []
  }

  const claimedAchievements = getClaimedAchievements()

  // Calculate stats for achievements
  const totalSessions = historyData.length
  const totalDistractions = historyData.reduce((sum, session) => sum + (session.totalDistractions || 0), 0)
  const currentStreak = calculateCurrentStreak(heatMapData)
  const focusedSessions = historyData.filter((session) => (session.totalDistractions || 0) === 0).length

  // Calculate additional stats that were missing
  const totalMinutes = historyData.reduce((sum, session) => sum + (session.duration || 0), 0)
  const longestStreak = calculateLongestStreak(heatMapData)
  const maxSessionsInADay = calculateMaxSessionsInADay(historyData)
  const earliestSessionHour = calculateEarliestSessionHour(historyData)
  const latestSessionHour = calculateLatestSessionHour(historyData)
  const brokeStreakToday = calculateBrokeStreakToday(heatMapData)
  const longestSession = calculateLongestSession(historyData)
  const tookBreaks = 0 // This would need to be tracked in your session data
  const didWeekendSession = calculateDidWeekendSession(historyData)
  const sessionStartedBetween12And3AM = calculateMidnightSession(historyData)
  const uniqueActiveDays = calculateUniqueActiveDays(heatMapData)

  // Define achievements with coin rewards based on difficulty
  const achievements: Achievement[] = [
    // Session milestones - Easy to Medium
    {
      id: "first-session",
      title: "Getting Started",
      description: "Complete your first study session",
      icon: <BookOpen className="w-6 h-6" />,
      unlocked: totalSessions >= 1,
      claimed: claimedAchievements.includes("first-session"),
      category: "sessions",
      coinReward: 5,
      difficulty: "easy",
    },
    {
      id: "five-sessions",
      title: "Consistent Learner",
      description: "Complete 5 study sessions",
      icon: <Target className="w-6 h-6" />,
      unlocked: totalSessions >= 5,
      claimed: claimedAchievements.includes("five-sessions"),
      progress: Math.min(totalSessions, 5),
      maxProgress: 5,
      category: "sessions",
      coinReward: 7,
      difficulty: "easy",
    },
    {
      id: "ten-sessions",
      title: "Getting Into the Groove",
      description: "Complete 10 study sessions",
      icon: <Layers className="w-6 h-6" />,
      unlocked: totalSessions >= 10,
      claimed: claimedAchievements.includes("ten-sessions"),
      progress: Math.min(totalSessions, 10),
      maxProgress: 10,
      category: "sessions",
      coinReward: 12,
      difficulty: "medium",
    },
    {
      id: "twenty-sessions",
      title: "Dedicated Student",
      description: "Complete 20 study sessions",
      icon: <Award className="w-6 h-6" />,
      unlocked: totalSessions >= 20,
      claimed: claimedAchievements.includes("twenty-sessions"),
      progress: Math.min(totalSessions, 20),
      maxProgress: 20,
      category: "sessions",
      coinReward: 12,
      difficulty: "medium",
    },
    {
      id: "fifty-sessions",
      title: "Study Master",
      description: "Complete 50 study sessions",
      icon: <Trophy className="w-6 h-6" />,
      unlocked: totalSessions >= 50,
      claimed: claimedAchievements.includes("fifty-sessions"),
      progress: Math.min(totalSessions, 50),
      maxProgress: 50,
      category: "sessions",
      coinReward: 20,
      difficulty: "hard",
    },
    {
      id: "hundred-sessions",
      title: "Legendary Learner",
      description: "Complete 100 study sessions",
      icon: <Medal className="w-6 h-6" />,
      unlocked: totalSessions >= 100,
      claimed: claimedAchievements.includes("hundred-sessions"),
      progress: Math.min(totalSessions, 100),
      maxProgress: 100,
      category: "sessions",
      coinReward: 40,
      difficulty: "legendary",
    },

    // Streak achievements - Medium to Hard
    {
      id: "three-day-streak",
      title: "On Fire",
      description: "Study for 3 days in a row",
      icon: <Zap className="w-6 h-6" />,
      unlocked: currentStreak >= 3,
      claimed: claimedAchievements.includes("three-day-streak"),
      progress: Math.min(currentStreak, 3),
      maxProgress: 3,
      category: "streak",
      coinReward: 12,
      difficulty: "medium",
    },
    {
      id: "week-streak",
      title: "Weekly Warrior",
      description: "Study for 7 days in a row",
      icon: <Calendar className="w-6 h-6" />,
      unlocked: currentStreak >= 7,
      claimed: claimedAchievements.includes("week-streak"),
      progress: Math.min(currentStreak, 7),
      maxProgress: 7,
      category: "streak",
      coinReward: 15,
      difficulty: "medium",
    },
    {
      id: "two-week-streak",
      title: "Habit Builder",
      description: "Maintain a 14-day streak",
      icon: <Repeat className="w-6 h-6" />,
      unlocked: currentStreak >= 14,
      claimed: claimedAchievements.includes("two-week-streak"),
      progress: Math.min(currentStreak, 14),
      maxProgress: 14,
      category: "streak",
      coinReward: 25,
      difficulty: "hard",
    },
    {
      id: "thirty-day-streak",
      title: "Unstoppable",
      description: "Study for 30 days in a row",
      icon: <Flame className="w-6 h-6" />,
      unlocked: currentStreak >= 30,
      claimed: claimedAchievements.includes("thirty-day-streak"),
      progress: Math.min(currentStreak, 30),
      maxProgress: 30,
      category: "streak",
      coinReward: 30,
      difficulty: "hard",
    },
    {
      id: "longest-streak",
      title: "Consistency King",
      description: "Break a streak of 10 days",
      icon: <Crown className="w-6 h-6" />,
      unlocked: currentStreak >= 10,
      claimed: claimedAchievements.includes("longest-streak"),
      category: "streak",
      coinReward: 12,
      difficulty: "medium",
    },

    // Focus achievements - Medium to Hard
    {
      id: "zero-distractions",
      title: "Laser Focus",
      description: "Complete a session with zero distractions",
      icon: <Star className="w-6 h-6" />,
      unlocked: focusedSessions >= 1,
      claimed: claimedAchievements.includes("zero-distractions"),
      category: "focus",
      coinReward: 7,
      difficulty: "easy",
    },
    {
      id: "five-focused",
      title: "Focus Champion",
      description: "Complete 5 sessions with zero distractions",
      icon: <Clock className="w-6 h-6" />,
      unlocked: focusedSessions >= 5,
      claimed: claimedAchievements.includes("five-focused"),
      progress: Math.min(focusedSessions, 5),
      maxProgress: 5,
      category: "focus",
      coinReward: 12,
      difficulty: "medium",
    },
    {
      id: "ten-focused",
      title: "Focus Guru",
      description: "Complete 10 distraction-free sessions",
      icon: <Brain className="w-6 h-6" />,
      unlocked: focusedSessions >= 10,
      claimed: claimedAchievements.includes("ten-focused"),
      progress: Math.min(focusedSessions, 10),
      maxProgress: 10,
      category: "focus",
      coinReward: 15,
      difficulty: "medium",
    },
    {
      id: "twenty-focused",
      title: "Zen Master",
      description: "Complete 20 distraction-free sessions",
      icon: <EyeOff className="w-6 h-6" />,
      unlocked: focusedSessions >= 20,
      claimed: claimedAchievements.includes("twenty-focused"),
      progress: Math.min(focusedSessions, 20),
      maxProgress: 20,
      category: "focus",
      coinReward: 20,
      difficulty: "hard",
    },
    {
      id: "no-breaks",
      title: "Hardcore Focus",
      description: "Study for 60+ minutes in a single session",
      icon: <Flame className="w-6 h-6" />,
      unlocked: longestSession >= 60,
      claimed: claimedAchievements.includes("no-breaks"),
      category: "focus",
      coinReward: 12,
      difficulty: "medium",
    },

    // Time achievements - Easy to Hard
    {
      id: "one-hour",
      title: "Just Getting Started",
      description: "Study for a total of 1 hour",
      icon: <Timer className="w-6 h-6" />,
      unlocked: totalMinutes >= 60,
      claimed: claimedAchievements.includes("one-hour"),
      progress: Math.min(totalMinutes, 60),
      maxProgress: 60,
      category: "time",
      coinReward: 7,
      difficulty: "easy",
    },
    {
      id: "ten-hours",
      title: "Time Investor",
      description: "Accumulate 10 hours of study time",
      icon: <Clock4 className="w-6 h-6" />,
      unlocked: totalMinutes >= 600,
      claimed: claimedAchievements.includes("ten-hours"),
      progress: Math.min(totalMinutes, 600),
      maxProgress: 600,
      category: "time",
      coinReward: 12,
      difficulty: "medium",
    },
    {
      id: "fifty-hours",
      title: "Time Titan",
      description: "Study for 50+ hours total",
      icon: <Sofa className="w-6 h-6" />,
      unlocked: totalMinutes >= 3000,
      claimed: claimedAchievements.includes("fifty-hours"),
      progress: Math.min(totalMinutes, 3000),
      maxProgress: 3000,
      category: "time",
      coinReward: 20,
      difficulty: "hard",
    },

    // Productivity achievements - Easy to Medium
    {
      id: "double-session",
      title: "Marathon Mode",
      description: "Complete 2+ sessions in one day",
      icon: <Activity className="w-6 h-6" />,
      unlocked: maxSessionsInADay >= 2,
      claimed: claimedAchievements.includes("double-session"),
      category: "productivity",
      coinReward: 5,
      difficulty: "medium",
    },
    {
      id: "triple-session",
      title: "Study Machine",
      description: "Complete 3+ sessions in one day",
      icon: <Bolt className="w-6 h-6" />,
      unlocked: maxSessionsInADay >= 3,
      claimed: claimedAchievements.includes("triple-session"),
      category: "productivity",
      coinReward: 10,
      difficulty: "medium",
    },
    {
      id: "first-morning-session",
      title: "Early Riser",
      description: "Study before 9 AM",
      icon: <Sunrise className="w-6 h-6" />,
      unlocked: earliestSessionHour < 9 && earliestSessionHour >= 0,
      claimed: claimedAchievements.includes("first-morning-session"),
      category: "productivity",
      coinReward: 7,
      difficulty: "easy",
    },
    {
      id: "first-night-session",
      title: "Night Owl",
      description: "Study after 10 PM",
      icon: <Moon className="w-6 h-6" />,
      unlocked: latestSessionHour >= 22,
      claimed: claimedAchievements.includes("first-night-session"),
      category: "productivity",
      coinReward: 7,
      difficulty: "easy",
    },

    // Special and Novelty achievements - Easy to Medium
    {
      id: "first-week",
      title: "One Week Wonder",
      description: "Study every day for your first week",
      icon: <Smile className="w-6 h-6" />,
      unlocked: totalSessions >= 7 && currentStreak >= 7,
      claimed: claimedAchievements.includes("first-week"),
      category: "special",
      coinReward: 12,
      difficulty: "medium",
    },
    {
      id: "back-to-back-days",
      title: "Bounce Back",
      description: "Return to studying after missing a day",
      icon: <Undo className="w-6 h-6" />,
      unlocked: brokeStreakToday,
      claimed: claimedAchievements.includes("back-to-back-days"),
      category: "novelty",
      coinReward: 7,
      difficulty: "easy",
    },
    {
      id: "first-break",
      title: "Balance Master",
      description: "Take a break during a session",
      icon: <Coffee className="w-6 h-6" />,
      unlocked: tookBreaks >= 1,
      claimed: claimedAchievements.includes("first-break"),
      category: "balance",
      coinReward: 7,
      difficulty: "easy",
    },
    {
      id: "weekend-session",
      title: "Weekend Warrior",
      description: "Study on a Saturday or Sunday",
      icon: <CalendarDays className="w-6 h-6" />,
      unlocked: didWeekendSession,
      claimed: claimedAchievements.includes("weekend-session"),
      category: "novelty",
      coinReward: 7,
      difficulty: "easy",
    },
    {
      id: "midnight-session",
      title: "Midnight Coder",
      description: "Start a session between 12–3 AM",
      icon: <MoonStar className="w-6 h-6" />,
      unlocked: sessionStartedBetween12And3AM,
      claimed: claimedAchievements.includes("midnight-session"),
      category: "novelty",
      coinReward: 12,
      difficulty: "medium",
    },

    // Milestone achievements - Hard to Legendary
    {
      id: "one-month",
      title: "One Month Strong",
      description: "Be active for 30 distinct days",
      icon: <CalendarCheck className="w-6 h-6" />,
      unlocked: uniqueActiveDays >= 30,
      claimed: claimedAchievements.includes("one-month"),
      progress: Math.min(uniqueActiveDays, 30),
      maxProgress: 30,
      category: "milestone",
      coinReward: 20,
      difficulty: "hard",
    },
    {
      id: "three-months",
      title: "Quarter-Year Committed",
      description: "Be active for 90 days",
      icon: <Bookmark className="w-6 h-6" />,
      unlocked: uniqueActiveDays >= 90,
      claimed: claimedAchievements.includes("three-months"),
      progress: Math.min(uniqueActiveDays, 90),
      maxProgress: 90,
      category: "milestone",
      coinReward: 40,
      difficulty: "legendary",
    },
  ]

  const handleClaimReward = (achievement: Achievement) => {
    if (achievement.unlocked && !achievement.claimed) {
      // Update localStorage
      const newClaimedAchievements = [...claimedAchievements, achievement.id]
      localStorage.setItem('claimedAchievements', JSON.stringify(newClaimedAchievements))
      
      // Call parent function to update coins
      onClaimAchievement(achievement.id, achievement.coinReward)
    }
  }

  const unlockedCount = achievements.filter((a) => a.unlocked).length
  const totalCount = achievements.length
  const claimedCount = achievements.filter((a) => a.claimed).length
  const unclaimedRewards = achievements.filter((a) => a.unlocked && !a.claimed).length

  const categoryColors = {
    sessions: { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50" },
    streak: { bg: "bg-orange-500", text: "text-orange-600", light: "bg-orange-50" },
    focus: { bg: "bg-green-500", text: "text-green-600", light: "bg-green-50" },
    special: { bg: theme.colors.primary[500], text: theme.colors.text.primary, light: theme.colors.primary[50] },
    time: { bg: "bg-red-500", text: "text-red-600", light: "bg-red-50" },
    productivity: { bg: "bg-indigo-500", text: "text-indigo-600", light: "bg-indigo-50" },
    novelty: { bg: "bg-pink-500", text: "text-pink-600", light: "bg-pink-50" },
    balance: { bg: "bg-teal-500", text: "text-teal-600", light: "bg-teal-50" },
    milestone: { bg: "bg-yellow-500", text: "text-yellow-600", light: "bg-yellow-50" },
  }

  const difficultyColors = {
    easy: "text-green-600",
    medium: "text-yellow-600", 
    hard: "text-orange-600",
    legendary: "text-purple-600"
  }

  return (
    <div className="space-y-8 p-6 min-h-screen">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-yellow-500 rounded-full">
            <Trophy className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Achievements</h1>
        <p className="text-gray-600 mb-4">Track your study milestones and celebrate your progress</p>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-6">
          {/* Current Coins */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center justify-center mb-2">
              <Coins className="w-6 h-6 text-yellow-500 mr-2" />
              <span className="text-2xl font-bold text-yellow-600">{coins}</span>
            </div>
            <div className="text-sm text-gray-500">Current Coins</div>
          </div>

          {/* Progress Summary */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <div className={`text-2xl font-bold ${theme.colors.text.primary} mb-1`}>
              {unlockedCount}/{totalCount}
            </div>
            <div className="text-sm text-gray-500">Unlocked</div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div
                className={`${theme.colors.gradient.primary} h-1.5 rounded-full transition-all duration-500`}
                style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Claimed Count */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {claimedCount}
            </div>
            <div className="text-sm text-gray-500">Rewards Claimed</div>
          </div>

          {/* Unclaimed Rewards */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {unclaimedRewards}
            </div>
            <div className="text-sm text-gray-500">Ready to Claim</div>
            {unclaimedRewards > 0 && (
              <div className="w-2 h-2 bg-orange-500 rounded-full mx-auto mt-1 animate-pulse"></div>
            )}
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => {
          const colors = categoryColors[achievement.category]
          const canClaim = achievement.unlocked && !achievement.claimed
          
          return (
            <div
              key={achievement.id}
              className={`relative bg-white rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                achievement.unlocked
                  ? canClaim
                    ? "border-yellow-300 shadow-lg transform hover:scale-105 hover:shadow-xl ring-2 ring-yellow-200"
                    : "border-green-300 shadow-lg"
                  : "border-gray-200 shadow-sm opacity-75"
              }`}
            >
              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                {achievement.claimed ? (
                  <div className="bg-green-500 rounded-full p-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                ) : achievement.unlocked ? (
                  <div className="bg-yellow-500 rounded-full p-1 animate-pulse">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <div className="bg-gray-400 rounded-full p-1">
                    <Trophy className="w-4 h-4 text-white opacity-50" />
                  </div>
                )}
              </div>

              <div className="p-6">
                {/* Icon and Difficulty */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`inline-flex p-3 rounded-lg ${
                      achievement.unlocked ? colors.bg : "bg-gray-400"
                    } text-white`}
                  >
                    {achievement.icon}
                  </div>
                  <div className={`text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 ${difficultyColors[achievement.difficulty]}`}>
                    {achievement.difficulty.toUpperCase()}
                  </div>
                </div>

                {/* Content */}
                <h3
                  className={`text-lg font-semibold mb-2 ${achievement.unlocked ? "text-gray-900" : "text-gray-500"}`}
                >
                  {achievement.title}
                </h3>

                <p className={`text-sm mb-4 ${achievement.unlocked ? "text-gray-600" : "text-gray-400"}`}>
                  {achievement.description}
                </p>

                {/* Progress Bar (if applicable) */}
                {achievement.maxProgress && (
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs">
                      <span className={achievement.unlocked ? colors.text : "text-gray-400"}>Progress</span>
                      <span className={achievement.unlocked ? colors.text : "text-gray-400"}>
                        {achievement.progress || 0}/{achievement.maxProgress}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          achievement.unlocked ? colors.bg : "bg-gray-400"
                        }`}
                        style={{ width: `${((achievement.progress || 0) / achievement.maxProgress) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Coin Reward */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-yellow-600">
                    <Coins className="w-4 h-4 mr-1" />
                    <span className="font-semibold">{achievement.coinReward}</span>
                  </div>
                </div>

                {/* Claim Button / Status */}
                <div className="mt-4">
                  {achievement.claimed ? (
                    <div className="flex items-center justify-center text-green-600 text-sm font-medium py-2 px-4 bg-green-50 rounded-lg">
                      <Check className="w-4 h-4 mr-2" />
                      Claimed
                    </div>
                  ) : achievement.unlocked ? (
                    <button
                      onClick={() => handleClaimReward(achievement)}
                      className="w-full flex items-center justify-center text-white text-sm font-medium py-2 px-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
                    >
                      <Coins className="w-4 h-4 mr-2" />
                      Claim {achievement.coinReward} coins
                    </button>
                  ) : (
                    <div className="text-center text-gray-400 text-sm font-medium py-2 px-4 bg-gray-50 rounded-lg">
                      Locked
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Motivational Message */}
      {unlockedCount === 0 && (
        <div className="text-center bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className={`w-16 h-16 ${theme.colors.primary[600]} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <Target className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Start Earning?</h3>
          <p className="text-gray-600">Complete your first study session to unlock your first achievement and earn coins!</p>
        </div>
      )}

      {/* Unclaimed Rewards Summary */}
      {unclaimedRewards > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-yellow-500 rounded-full animate-bounce">
              <Coins className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-yellow-800 mb-2">Rewards Ready!</h3>
          <p className="text-yellow-700">
            You have <span className="font-bold">{unclaimedRewards}</span> achievement{unclaimedRewards !== 1 ? 's' : ''} ready to claim.
            Scroll up to collect your rewards!
          </p>
        </div>
      )}
    </div>
  )
}

// Helper function to calculate current streak
function calculateCurrentStreak(heatMapData: { date: string; count: number }[]): number {
  if (heatMapData.length === 0) return 0

  const sortedData = [...heatMapData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  let streak = 0
  for (const entry of sortedData) {
    if (entry.count > 0) {
      streak++
    } else {
      break
    }
  }
  return streak
}

// Helper function to calculate longest streak
function calculateLongestStreak(heatMapData: { date: string; count: number }[]): number {
  if (heatMapData.length === 0) return 0

  const sortedData = [...heatMapData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  let maxStreak = 0
  let currentStreak = 0

  for (const entry of sortedData) {
    if (entry.count > 0) {
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 0
    }
  }

  return maxStreak
}

// Helper function to calculate max sessions in a day
function calculateMaxSessionsInADay(historyData: any[]): number {
  if (historyData.length === 0) return 0

  const sessionsByDate = historyData.reduce(
    (acc, session) => {
      const date = session.date.split("T")[0] // Get just the date part
      acc[date] = (acc[date] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const sessionCounts = Object.values(sessionsByDate) as number[]
  return Math.max(...sessionCounts)
}

// Helper function to calculate earliest session hour
function calculateEarliestSessionHour(historyData: any[]): number {
  if (historyData.length === 0) return 24 // Return 24 if no sessions

  const hours = historyData.map((session) => {
    const date = new Date(session.date)
    return date.getHours()
  })

  return Math.min(...hours)
}

// Helper function to calculate latest session hour
function calculateLatestSessionHour(historyData: any[]): number {
  if (historyData.length === 0) return -1 // Return -1 if no sessions

  const hours = historyData.map((session) => {
    const date = new Date(session.date)
    return date.getHours()
  })

  return Math.max(...hours)
}

// Helper function to check if broke streak today (simplified)
function calculateBrokeStreakToday(heatMapData: { date: string; count: number }[]): boolean {
  // This is a simplified implementation - you'd need more complex logic
  // to properly detect if someone broke a streak and came back
  return heatMapData.length > 2
}

// Helper function to calculate longest session
function calculateLongestSession(historyData: any[]): number {
  if (historyData.length === 0) return 0

  const durations = historyData.map((session) => session.duration || 0)
  return Math.max(...durations)
}

// Helper function to check if did weekend session
function calculateDidWeekendSession(historyData: any[]): boolean {
  return historyData.some((session) => {
    const date = new Date(session.date)
    const dayOfWeek = date.getDay()
    return dayOfWeek === 0 || dayOfWeek === 6 // Sunday or Saturday
  })
}

// Helper function to check if session started between 12-3 AM
function calculateMidnightSession(historyData: any[]): boolean {
  return historyData.some((session) => {
    const date = new Date(session.date)
    const hour = date.getHours()
    return hour >= 0 && hour <= 3
  })
}

// Helper function to calculate unique active days
function calculateUniqueActiveDays(heatMapData: { date: string; count: number }[]): number {
  return heatMapData.filter((entry) => entry.count > 0).length
}

export default AchievementsTab