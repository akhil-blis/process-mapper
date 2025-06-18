"use client"

import type React from "react"
import { Users, FileText, Briefcase, Calendar, BarChart, Zap } from "lucide-react"

type SuggestionCard = {
  id: string
  title: string
  description: string
  template: string
  icon: React.ReactNode
  color: string
}

type SuggestionCardsProps = {
  onCardClick?: (description: string) => void
}

export function SuggestionCards({ onCardClick }: SuggestionCardsProps) {
  const cards: SuggestionCard[] = [
    {
      id: "1",
      title: "Hiring Process",
      description: "When someone joins the team, we usually...",
      template:
        "When we need to hire someone for [ROLE/DEPARTMENT], the process starts when [TRIGGER - e.g., manager submits request, headcount approved]. First, [WHO] creates the job description and posts it on [PLATFORMS]. Applications come in and [WHO] does the initial screening by [CRITERIA]. Qualified candidates then go through [NUMBER] rounds of interviews with [WHO - e.g., hiring manager, team members, HR]. After interviews, we [DECISION PROCESS] and make an offer. Once accepted, [WHO] handles onboarding which includes [SPECIFIC STEPS - e.g., equipment setup, paperwork, training]. The whole process typically takes [TIMEFRAME] and often gets stuck at [COMMON BOTTLENECK].",
      icon: <Users className="w-5 h-5" />,
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: "2",
      title: "Content Approval",
      description: "Our blog posts go through these steps...",
      template:
        "When we create content like [CONTENT TYPE - e.g., blog posts, social media, marketing materials], it starts when [WHO] gets a request from [SOURCE]. The writer [WHO] creates the first draft using [TOOLS/TEMPLATES] and typically spends [TIME] on research and writing. The draft then goes to [REVIEWER 1 - e.g., editor, subject matter expert] who checks for [CRITERIA - e.g., accuracy, tone, SEO]. If changes are needed, it goes back to the writer. Once approved, it moves to [REVIEWER 2 - e.g., legal, brand team] for [FINAL CHECKS]. After final approval, [WHO] publishes it on [PLATFORMS] and [WHO] handles promotion. The biggest delays usually happen at [BOTTLENECK] and the whole process takes [TIMEFRAME].",
      icon: <FileText className="w-5 h-5" />,
      color: "bg-green-100 text-green-600",
    },
    {
      id: "3",
      title: "Sales Pipeline",
      description: "From lead to close, our sales process is...",
      template:
        "Our sales process begins when a lead comes in through [LEAD SOURCES - e.g., website, referral, cold outreach]. [WHO] qualifies the lead by [QUALIFICATION CRITERIA] and enters them into [CRM SYSTEM]. Qualified leads get assigned to [WHO] who schedules a [FIRST MEETING TYPE] within [TIMEFRAME]. During discovery, we learn about [KEY INFORMATION TO GATHER]. If there's a fit, we move to [NEXT STEP - e.g., demo, proposal]. The proposal process involves [WHO] and includes [COMPONENTS]. Negotiations typically focus on [COMMON ISSUES] and take [TIMEFRAME]. Once we get a yes, [WHO] handles contract and [WHO] manages onboarding. Our biggest challenge is usually [BOTTLENECK] and our average deal size is [AMOUNT] with [CLOSE RATE]% close rate.",
      icon: <Briefcase className="w-5 h-5" />,
      color: "bg-violet-100 text-violet-600",
    },
    {
      id: "4",
      title: "Project Planning",
      description: "When we kick off a new project, we first...",
      template:
        "When we start a new [PROJECT TYPE], it begins when [TRIGGER - e.g., client request, internal initiative]. [WHO] acts as project manager and first gathers requirements by [METHOD - e.g., stakeholder interviews, workshops]. We document everything in [TOOL] and create a timeline using [METHOD/TOOL]. The team includes [ROLES] and we typically allocate [TIMEFRAME/RESOURCES]. Before starting work, we need approval from [WHO] on [WHAT - e.g., budget, scope, timeline]. During execution, we track progress through [MEETINGS/TOOLS] and handle changes via [CHANGE PROCESS]. Common risks include [RISKS] and we mitigate them by [MITIGATION STRATEGIES]. Projects typically take [TIMEFRAME] and success is measured by [SUCCESS CRITERIA].",
      icon: <Calendar className="w-5 h-5" />,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      id: "5",
      title: "Reporting Workflow",
      description: "Our monthly reports are created by...",
      template:
        "Our [REPORT TYPE - e.g., monthly, quarterly] reports are created [FREQUENCY] for [AUDIENCE]. The process starts when [WHO] pulls data from [DATA SOURCES] around [TIMING - e.g., month-end, specific date]. Data collection involves [SPECIFIC STEPS] and usually takes [TIMEFRAME]. [WHO] then analyzes the data looking for [KEY METRICS/INSIGHTS]. The report gets drafted in [TOOL] following [TEMPLATE/FORMAT]. Key sections include [REPORT SECTIONS]. Before distribution, [WHO] reviews for [REVIEW CRITERIA] and [WHO] gives final approval. Reports are shared via [DISTRIBUTION METHOD] with [RECIPIENTS]. The biggest challenge is [BOTTLENECK - e.g., data quality, late submissions] and the whole process takes [TIMEFRAME].",
      icon: <BarChart className="w-5 h-5" />,
      color: "bg-orange-100 text-orange-600",
    },
    {
      id: "6",
      title: "Bug Resolution",
      description: "When a customer reports an issue, we...",
      template:
        "When a customer reports a bug through [CHANNELS - e.g., support ticket, email, chat], [WHO] receives it and does initial triage within [TIMEFRAME]. They categorize it as [SEVERITY LEVELS] based on [CRITERIA]. [SEVERITY LEVEL] bugs get escalated to [WHO] immediately. For investigation, [WHO] reproduces the issue in [ENVIRONMENT] and documents findings in [TOOL]. If it's a real bug, [WHO] creates a ticket in [PROJECT MANAGEMENT TOOL] and assigns it to [TEAM/PERSON]. Development work happens in [TIMEFRAME] depending on [FACTORS]. Once fixed, [WHO] tests it in [ENVIRONMENT] and [WHO] verifies the fix. We notify the customer via [METHOD] and close the ticket. Our SLA is [TIMEFRAME] for [SEVERITY] issues and common bottlenecks include [BOTTLENECKS].",
      icon: <Zap className="w-5 h-5" />,
      color: "bg-red-100 text-red-600",
    },
  ]

  const handleCardClick = (template: string) => {
    if (onCardClick) {
      onCardClick(template)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {cards.map((card) => (
        <div
          key={card.id}
          className="group p-6 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md hover:bg-gray-50 transition-all duration-200 cursor-pointer"
          onClick={() => handleCardClick(card.template)}
        >
          <div className="flex items-start gap-4">
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-md ${card.color} flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}
            >
              {card.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 mb-1 transition-colors duration-200">{card.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{card.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
