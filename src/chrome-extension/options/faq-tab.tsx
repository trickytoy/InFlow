"use client"

const FAQTab = () => {
  const faqData = [
    {
      question: "What does Inflow do",
      answer:
        "Inflow helps you stay focused by blocking distracting websites and filtering out pages that are unrelated to your study topic using semantic similarity.",
    },
    {
      question: "How does Inflow know if a page is unrelated",
      answer:
        "Inflow uses a machine learning model to compare the content of the page with your focus topic. If the similarity is too low, the page is blocked or a warning is shown.",
    },
    {
      question: "What is the difference between blocked websites and unrelated pages",
      answer:
        "Blocked websites are ones you manually add to your block list. Unrelated pages are flagged automatically if the content does not align with your current study focus.",
    },
    {
      question: "How do I start or stop a focus session",
      answer:
        "You can start or stop a focus session by clicking the Inflow icon in your browser and using the session toggle. Once active, Inflow begins monitoring and filtering pages.",
    },
    {
      question: "Can I change my focus topic during a session",
      answer:
        "Yes you can update your focus topic anytime from the popup. Inflow will use the new topic for all future filtering while the session is active.",
    },
    {
      question: "Where is my data stored",
      answer:
        "Your data is stored locally on your device. Nothing is uploaded or shared externally.",
    },
    {
      question: "Can I suggest improvements if Inflow blocks the wrong page",
      answer:
        "Currently Inflow does not learn from feedback, but we plan to add a feedback button so you can help improve accuracy in the future.",
    },
    {
      question: "Does Inflow use my personal data or browsing history",
      answer:
        "No. Inflow does not collect or transmit your personal data or full browsing history. It only uses the current page’s content temporarily and anonymously to assess relevance during a focus session.",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Frequently Asked Questions</h2>
      <div className="space-y-6">
        {faqData.map((faq, index) => (
          <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{faq.question}</h3>
            <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FAQTab
