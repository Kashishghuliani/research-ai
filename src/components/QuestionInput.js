"use client";

export default function QuestionInput({
  question,
  setQuestion,
  onAnalyze,
  loading,
}) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-900 text-white shadow-sm">
            <span className="text-xs font-semibold">1</span>
          </div>

          <span className="text-[11px] font-semibold tracking-[0.18em] text-gray-600">
            ASK
          </span>

          <div className="w-10 h-px bg-gray-300" />

          <span className="text-xs font-medium text-gray-400">
            Start your research
          </span>
        </div>

        <h1 className="text-3xl md:text-[42px] leading-[1.08] font-semibold tracking-[-0.04em] text-gray-950">
          What do you want to investigate?
        </h1>

        <p className="mt-4 max-w-2xl text-[15px] leading-7 text-gray-500">
          Ask a trading research question in natural language.
          We'll turn your idea into a structured, testable experiment.
        </p>
      </div>

      {/* Main Workspace */}
      <div className="relative overflow-hidden rounded-[28px] border border-gray-200 bg-[#f8f8f7] shadow-[0_20px_60px_rgba(0,0,0,0.06)]">

        {/* Decorative top accent */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-gray-950 via-gray-500 to-gray-200" />

        {/* Input Area */}
        <div className="p-6 md:p-8">

          {/* Section label */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.16em] text-gray-500 uppercase">
                Research Question
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Describe what you want to test.
              </p>
            </div>

            <span className="font-mono text-[11px] text-gray-400">
              {question.length}/500
            </span>
          </div>

          {/* Textarea Card */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.025)] transition-all focus-within:border-gray-400 focus-within:shadow-[0_6px_24px_rgba(0,0,0,0.05)]">
            <textarea
              id="research-question"
              value={question}
              maxLength={500}
              onChange={(event) =>
                setQuestion(event.target.value)
              }
              placeholder="Does buying NIFTY after a sharp fall work?"
              className="
                w-full
                min-h-[175px]
                resize-none
                rounded-2xl
                bg-transparent
                px-5
                py-5
                text-[16px]
                leading-7
                text-gray-900
                placeholder:text-gray-400
                outline-none
              "
            />

            {/* Input bottom bar */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
              <span className="text-[11px] text-gray-400">
                Natural language is fine.
              </span>

              <span className="text-[11px] text-gray-400">
                Research hypothesis
              </span>
            </div>
          </div>

          {/* Example */}
          <div className="mt-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-semibold tracking-[0.14em] text-gray-400 uppercase">
                Try an example
              </span>

              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <button
              type="button"
              onClick={() =>
                setQuestion(
                  "Does buying NIFTY after a 1% fall work better during high volatility?"
                )
              }
              className="
                group
                w-full
                text-left
                rounded-xl
                border
                border-gray-200
                bg-white
                px-4
                py-3
                text-[13px]
                leading-6
                text-gray-600
                transition-all
                hover:border-gray-300
                hover:text-gray-900
                hover:shadow-sm
              "
            >
              <span className="mr-2 text-gray-300 group-hover:text-gray-500">
                →
              </span>

              “Does buying NIFTY after a 1% fall work better during
              high volatility?”
            </button>
          </div>
        </div>

        {/* Research Disclaimer */}
        <div className="px-6 pb-6 md:px-8">
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-5">
            <div className="flex gap-3">
              <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-amber-100 text-amber-700">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 11v5" />
                  <path d="M12 8h.01" />
                </svg>
              </div>

              <div>
                <p className="text-[13px] font-semibold text-gray-900">
                  Research first.
                </p>

                <p className="mt-1 text-[12px] leading-6 text-gray-600">
                  ResearchAI helps investigate hypotheses, clarify
                  assumptions, and analyze experiments. It does not
                  provide financial advice or guaranteed trading strategies.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-5 px-6 py-6 border-t border-gray-200 bg-white/70 md:px-8 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-[10px] font-semibold tracking-[0.16em] text-gray-400 uppercase">
              Next step
            </p>

            <p className="mt-1 text-[13px] text-gray-500">
              We'll identify the assumptions behind your question.
            </p>
          </div>

          <button
            onClick={onAnalyze}
            disabled={loading || !question.trim()}
            className="
              group
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-gray-950
              px-7
              py-3.5
              text-[13px]
              font-semibold
              text-white
              shadow-[0_5px_18px_rgba(0,0,0,0.15)]
              transition-all
              hover:bg-gray-800
              hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)]
              active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:opacity-40
              disabled:hover:bg-gray-950
            "
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                Analyze Question

                <svg
                  className="transition-transform duration-200 group-hover:translate-x-1"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14" />
                  <path d="m13 6 6 6-6 6" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}