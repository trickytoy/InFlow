"use client"
import { useState } from "react"
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react"
import { useTheme } from "./index"

const FAQTab = () => {
  const [openItems, setOpenItems] = useState(new Set())
  const theme = useTheme()

  const faqData = [
    {
      question: "What does Inflow do?",
      answer:
        "Inflow helps you stay focused by blocking distracting websites and filtering out pages that are unrelated to your study topic using semantic similarity.",
    },
    {
      question: "How does Inflow know if a page is unrelated?",
      answer:
        "Inflow uses a machine learning model to compare the content of the page with your focus topic. If the similarity is too low, the page is blocked or a warning is shown.",
    },
    {
      question: "What is the difference between blocked websites and unrelated pages?",
      answer:
        "Blocked websites are ones you manually add to your block list. Unrelated pages are flagged automatically if the content does not align with your current study focus.",
    },
    {
      question: "How do I start or stop a focus session?",
      answer:
        "You can start or stop a focus session by clicking the Inflow icon in your browser and using the session toggle. Once active, Inflow begins monitoring and filtering pages.",
    },
    {
      question: "Can I change my focus topic during a session?",
      answer:
        "Yes, you can update your focus topic anytime from the popup. Inflow will use the new topic for all future filtering while the session is active.",
    },
    {
      question: "Where is my data stored?",
      answer: "Your data is stored locally on your device. Nothing is uploaded or shared externally.",
    },
    {
      question: "Can I suggest improvements if Inflow blocks the wrong page?",
      answer:
        "Currently Inflow does not learn from feedback, but we plan to add a feedback button so you can help improve accuracy in the future.",
    },
    {
      question: "Does Inflow use my personal data or browsing history?",
      answer:
        "No. Inflow does not collect or transmit your personal data or full browsing history. It only uses the current page's content temporarily and anonymously to assess relevance during a focus session.",
    },
  ]

  const toggleItem = (index: unknown) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index)
    } else {
      newOpenItems.add(index)
    }
    setOpenItems(newOpenItems)
  }

  return (
    <div className="space-y-8 p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className={`p-4 ${theme.colors.gradient.primary} rounded-full`}>
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h1>
        <p className="text-gray-600">
          Find answers to common questions about Inflow and how it helps you maintain focus
        </p>
      </div>

      {/* FAQ Items */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`p-2 ${theme.colors.gradient.primary} rounded-lg`}>
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Common Questions</h2>
              <p className="text-sm text-gray-600 mt-1">Everything you need to know about using Inflow</p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {faqData.map((faq, index) => (
            <div key={index} className="group">
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                <div className="flex-shrink-0">
                  {openItems.has(index) ? (
                    <ChevronUp className={`w-5 h-5 ${theme.colors.text.primary} transition-all duration-200`} />
                  ) : (
                    <ChevronDown className={`w-5 h-5 text-gray-400 ${theme.colors.hover.text} transition-all duration-200`} />
                  )}
                </div>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openItems.has(index) ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-6 pb-6 pt-2 bg-gray-50 border-t border-gray-100">
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed text-base mb-0">{faq.answer}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FAQTab
