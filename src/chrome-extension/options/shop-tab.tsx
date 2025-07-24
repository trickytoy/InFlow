// Shop Tab Component
import { Check, Coins, Lock } from "lucide-react"
import { useTheme } from "./index"

interface Theme {
  id: string
  name: string
  description: string
  price: number
  preview: string
  colors: {
    primary: {
      50: string
      100: string
      200: string
      300: string
      400: string
      500: string
      600: string
      700: string
      800: string
      900: string
    }
    text: {
      primary: string
      primaryLight: string
      primaryDark: string
      white: string
    }
    border: {
      primary: string
      primaryLight: string
      primaryDark: string
    }
    hover: {
      primary: string
      primaryDark: string
      text: string
    }
    focus: {
      ring: string
      border: string
    }
    gradient: {
      primary: string
      primaryHover: string
    }
  }
}


const availableThemes: Theme[] = [
  {
    id: "purple",
    name: "Purple Default",
    description: "Classic purple theme with elegant gradients",
    price: 0,
    preview: "bg-gradient-to-r from-purple-500 to-purple-600",
    colors: {
      primary: {
        50: "bg-purple-50",
        100: "bg-purple-100",
        200: "bg-purple-200",
        300: "bg-purple-300",
        400: "bg-purple-400",
        500: "bg-purple-500",
        600: "bg-purple-600",
        700: "bg-purple-700",
        800: "bg-purple-800",
        900: "bg-purple-900",
      },
      text: {
        primary: "text-purple-600",
        primaryLight: "text-purple-500",
        primaryDark: "text-purple-700",
        white: "text-white",
      },
      border: {
        primary: "border-purple-300",
        primaryLight: "border-purple-200",
        primaryDark: "border-purple-400",
      },
      hover: {
        primary: "hover:bg-purple-100",
        primaryDark: "hover:bg-purple-600",
        text: "hover:text-purple-600",
      },
      focus: {
        ring: "focus:ring-purple-200",
        border: "focus:border-purple-500",
      },
      gradient: {
        primary: "bg-gradient-to-r from-purple-500 to-purple-600",
        primaryHover: "hover:from-purple-600 hover:to-purple-700",
      },
    }
  },
  {
    id: "ocean",
    name: "Ocean Blue",
    description: "Calming ocean-inspired blue theme",
    price: 50,
    preview: "bg-gradient-to-r from-blue-500 to-cyan-500",
    colors: {
      primary: {
        50: "bg-blue-50",
        100: "bg-blue-100",
        200: "bg-blue-200",
        300: "bg-blue-300",
        400: "bg-blue-400",
        500: "bg-blue-500",
        600: "bg-blue-600",
        700: "bg-blue-700",
        800: "bg-blue-800",
        900: "bg-blue-900",
      },
      text: {
        primary: "text-blue-600",
        primaryLight: "text-blue-500",
        primaryDark: "text-blue-700",
        white: "text-white",
      },
      border: {
        primary: "border-blue-300",
        primaryLight: "border-blue-200",
        primaryDark: "border-blue-400",
      },
      hover: {
        primary: "hover:bg-blue-100",
        primaryDark: "hover:bg-blue-600",
        text: "hover:text-blue-600",
      },
      focus: {
        ring: "focus:ring-blue-200",
        border: "focus:border-blue-500",
      },
      gradient: {
        primary: "bg-gradient-to-r from-blue-500 to-cyan-500",
        primaryHover: "hover:from-blue-600 hover:to-cyan-600",
      },
    }
  },
  {
    id: "forest",
    name: "Forest Green",
    description: "Natural forest green theme for focus",
    price: 75,
    preview: "bg-gradient-to-r from-green-500 to-emerald-500",
    colors: {
      primary: {
        50: "bg-green-50",
        100: "bg-green-100",
        200: "bg-green-200",
        300: "bg-green-300",
        400: "bg-green-400",
        500: "bg-green-500",
        600: "bg-green-600",
        700: "bg-green-700",
        800: "bg-green-800",
        900: "bg-green-900",
      },
      text: {
        primary: "text-green-600",
        primaryLight: "text-green-500",
        primaryDark: "text-green-700",
        white: "text-white",
      },
      border: {
        primary: "border-green-300",
        primaryLight: "border-green-200",
        primaryDark: "border-green-400",
      },
      hover: {
        primary: "hover:bg-green-100",
        primaryDark: "hover:bg-green-600",
        text: "hover:text-green-600",
      },
      focus: {
        ring: "focus:ring-green-200",
        border: "focus:border-green-500",
      },
      gradient: {
        primary: "bg-gradient-to-r from-green-500 to-emerald-500",
        primaryHover: "hover:from-green-600 hover:to-emerald-600",
      },
    }
  },
  {
    id: "sunset",
    name: "Sunset Orange",
    description: "Warm sunset-inspired orange theme",
    price: 100,
    preview: "bg-gradient-to-r from-orange-500 to-red-500",
    colors: {
      primary: {
        50: "bg-orange-50",
        100: "bg-orange-100",
        200: "bg-orange-200",
        300: "bg-orange-300",
        400: "bg-orange-400",
        500: "bg-orange-500",
        600: "bg-orange-600",
        700: "bg-orange-700",
        800: "bg-orange-800",
        900: "bg-orange-900",
      },
      text: {
        primary: "text-orange-600",
        primaryLight: "text-orange-500",
        primaryDark: "text-orange-700",
        white: "text-white",
      },
      border: {
        primary: "border-orange-300",
        primaryLight: "border-orange-200",
        primaryDark: "border-orange-400",
      },
      hover: {
        primary: "hover:bg-orange-100",
        primaryDark: "hover:bg-orange-600",
        text: "hover:text-orange-600",
      },
      focus: {
        ring: "focus:ring-orange-200",
        border: "focus:border-orange-500",
      },
      gradient: {
        primary: "bg-gradient-to-r from-orange-500 to-red-500",
        primaryHover: "hover:from-orange-600 hover:to-red-600",
      },
    }
  },
  {
    id: "rose",
    name: "Rose Pink",
    description: "Elegant rose pink theme",
    price: 80,
    preview: "bg-gradient-to-r from-pink-500 to-rose-500",
    colors: {
      primary: {
        50: "bg-pink-50",
        100: "bg-pink-100",
        200: "bg-pink-200",
        300: "bg-pink-300",
        400: "bg-pink-400",
        500: "bg-pink-500",
        600: "bg-pink-600",
        700: "bg-pink-700",
        800: "bg-pink-800",
        900: "bg-pink-900",
      },
      text: {
        primary: "text-pink-600",
        primaryLight: "text-pink-500",
        primaryDark: "text-pink-700",
        white: "text-white",
      },
      border: {
        primary: "border-pink-300",
        primaryLight: "border-pink-200",
        primaryDark: "border-pink-400",
      },
      hover: {
        primary: "hover:bg-pink-100",
        primaryDark: "hover:bg-pink-600",
        text: "hover:text-pink-600",
      },
      focus: {
        ring: "focus:ring-pink-200",
        border: "focus:border-pink-500",
      },
      gradient: {
        primary: "bg-gradient-to-r from-pink-500 to-rose-500",
        primaryHover: "hover:from-pink-600 hover:to-rose-600",
      },
    }
  },
  {
    id: "midnight",
    name: "Midnight Dark",
    description: "Premium dark theme with indigo accents",
    price: 150,
    preview: "bg-gradient-to-r from-slate-800 to-indigo-800",
    colors: {
      primary: {
        50: "bg-slate-50",
        100: "bg-slate-100",
        200: "bg-slate-200",
        300: "bg-slate-300",
        400: "bg-slate-400",
        500: "bg-slate-500",
        600: "bg-slate-600",
        700: "bg-slate-700",
        800: "bg-slate-800",
        900: "bg-slate-900",
      },
      text: {
        primary: "text-indigo-400",
        primaryLight: "text-indigo-300",
        primaryDark: "text-indigo-500",
        white: "text-white",
      },
      border: {
        primary: "border-slate-600",
        primaryLight: "border-slate-500",
        primaryDark: "border-slate-700",
      },
      hover: {
        primary: "hover:bg-slate-700",
        primaryDark: "hover:bg-indigo-600",
        text: "hover:text-indigo-400",
      },
      focus: {
        ring: "focus:ring-indigo-500",
        border: "focus:border-indigo-400",
      },
      gradient: {
        primary: "bg-gradient-to-r from-slate-800 to-indigo-800",
        primaryHover: "hover:from-slate-700 hover:to-indigo-700",
      },
    }
  }
]

const ShopTab = ({ 
  coins, 
  ownedThemes, 
  currentTheme, 
  onPurchaseTheme, 
  onSelectTheme 
}: {
  coins: number
  ownedThemes: string[]
  currentTheme: string
  onPurchaseTheme: (themeId: string, price: number) => void
  onSelectTheme: (themeId: string) => void
}) => {
  const theme = useTheme()

  return (
    <div className="max-w-6xl mx-auto">
      {/* Coins Display */}
      <div className={`${theme.colors.gradient.primary} rounded-xl p-6 mb-8 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Theme Shop</h1>
            <p className="text-white/80">Customize your experience with beautiful themes</p>
          </div>
          <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-4 py-2">
            <Coins className="w-6 h-6 text-yellow-300" />
            <span className="text-xl font-bold">{coins}</span>
            <span className="text-sm text-white/80">coins</span>
          </div>
        </div>
      </div>

      {/* Themes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableThemes.map((themeOption) => {
          const isOwned = ownedThemes.includes(themeOption.id)
          const isActive = currentTheme === themeOption.id
          const canAfford = coins >= themeOption.price

          return (
            <div key={themeOption.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300">
              {/* Theme Preview */}
              <div className={`h-32 ${themeOption.preview} relative`}>
                {isActive && (
                  <div className="absolute top-3 right-3 bg-white rounded-full p-2">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                )}
              </div>

              {/* Theme Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{themeOption.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{themeOption.description}</p>
                  </div>
                  {themeOption.price > 0 && (
                    <div className="flex items-center space-x-1 text-sm font-medium text-gray-700">
                      <Coins className="w-4 h-4 text-yellow-500" />
                      <span>{themeOption.price}</span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="mt-4">
                  {isActive ? (
                    <button 
                      disabled
                      className={`w-full ${theme.colors.primary[600]} text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2`}
                    >
                      <Check className="w-4 h-4" />
                      <span>Currently Active</span>
                    </button>
                  ) : isOwned ? (
                    <button 
                      onClick={() => onSelectTheme(themeOption.id)}
                      className={`w-full border-2 ${theme.colors.border.primary} ${theme.colors.text.primary} py-2 px-4 rounded-lg font-medium hover:${theme.colors.primary[50]} transition-colors duration-200`}
                    >
                      Select Theme
                    </button>
                  ) : themeOption.price === 0 ? (
                    <button 
                      onClick={() => onPurchaseTheme(themeOption.id, themeOption.price)}
                      className={`w-full ${theme.colors.gradient.primary} ${theme.colors.gradient.primaryHover} text-white py-2 px-4 rounded-lg font-medium transition-all duration-200`}
                    >
                      Get Free
                    </button>
                  ) : canAfford ? (
                    <button 
                      onClick={() => onPurchaseTheme(themeOption.id, themeOption.price)}
                      className={`w-full ${theme.colors.gradient.primary} ${theme.colors.gradient.primaryHover} text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2`}
                    >
                      <Coins className="w-4 h-4" />
                      <span>Buy for {themeOption.price}</span>
                    </button>
                  ) : (
                    <button 
                      disabled
                      className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 cursor-not-allowed"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Not enough coins</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}

export default ShopTab
