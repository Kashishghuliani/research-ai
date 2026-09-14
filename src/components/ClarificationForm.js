"use client";

export default function ClarificationForm({
  fallPercentage,
  setFallPercentage,
  holdingPeriod,
  setHoldingPeriod,
  testPeriod,
  setTestPeriod,
  entryTiming,
  setEntryTiming,
  onContinue,
}) {
  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-50 border border-orange-100">
            <span className="text-xs font-semibold text-orange-600">
              1
            </span>
          </div>

          <span className="text-[11px] font-semibold tracking-[0.18em] text-orange-600">
            CLARIFY
          </span>

          <div className="w-10 h-px bg-gray-200" />

          <span className="text-xs font-medium text-gray-400">
            Step 1 of 3
          </span>
        </div>

        <h1 className="text-3xl md:text-[40px] leading-[1.1] font-semibold tracking-[-0.035em] text-gray-950">
          Let's remove the ambiguity.
        </h1>

        <p className="mt-4 max-w-2xl text-[15px] leading-7 text-gray-500">
          Before testing the hypothesis, define the parameters precisely
          so the experiment can be reproduced and compared fairly.
        </p>
      </div>

      {/* Main Card */}
      <div className="overflow-hidden bg-white border border-gray-200 rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.045)]">

        {/* Card Header */}
        <div className="px-6 py-6 md:px-8 border-b border-gray-100 bg-gray-50/60">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-xl bg-gray-950 text-white">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v8" />
                <path d="M8 12h8" />
              </svg>
            </div>

            <div>
              <h2 className="text-[15px] font-semibold text-gray-900">
                Define the experiment
              </h2>

              <p className="mt-1 text-[13px] text-gray-500">
                Set the assumptions that will be used in the backtest.
              </p>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="px-6 py-7 md:px-8 md:py-8 space-y-8">

          <Question
            number="01"
            title="What counts as a sharp fall?"
            description="The fall is measured using the day's intraday low compared with the previous trading day's close."
          >
            <Select
              value={fallPercentage}
              onChange={(e) => setFallPercentage(e.target.value)}
            >
              <option value="1">1% fall</option>
              <option value="2">2% fall</option>
              <option value="3">3% fall</option>
              <option value="5">5% fall</option>
            </Select>
          </Question>

          <Question
            number="02"
            title="When should the entry happen?"
            description="Choose the price used to enter the hypothetical trade."
          >
            <Select
              value={entryTiming}
              onChange={(e) => setEntryTiming(e.target.value)}
            >
              <option value="next_open">Next day's open</option>
              <option value="same_close">Same day's close</option>
              <option value="next_close">Next day's close</option>
            </Select>
          </Question>

          <Question
            number="03"
            title="How long should we hold?"
            description="The exit occurs after this many trading sessions."
          >
            <Select
              value={holdingPeriod}
              onChange={(e) => setHoldingPeriod(e.target.value)}
            >
              <option value="1">1 trading day</option>
              <option value="3">3 trading days</option>
              <option value="5">5 trading days</option>
              <option value="10">10 trading days</option>
            </Select>
          </Question>

          <Question
            number="04"
            title="How much history should we test?"
            description="Choose the historical period used for the experiment."
          >
            <Select
              value={testPeriod}
              onChange={(e) => setTestPeriod(e.target.value)}
            >
              <option value="1">1 year</option>
              <option value="3">3 years</option>
              <option value="5">5 years</option>
              <option value="10">10 years</option>
            </Select>
          </Question>

        </div>

        {/* Explanation */}
        <div className="px-6 pb-7 md:px-8 md:pb-8">
          <div className="p-5 border border-amber-200 rounded-2xl bg-amber-50/60">
            <div className="flex gap-3">
              <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-amber-100 text-amber-700">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 11v5" />
                  <path d="M12 8h.01" />
                </svg>
              </div>

              <div>
                <p className="text-[14px] font-semibold text-gray-900">
                  Why clarify first?
                </p>

                <p className="mt-1 text-[13px] leading-6 text-gray-600">
                  A phrase like "sharp fall" can produce different results
                  depending on how it is measured. Explicit parameters make
                  the experiment reproducible.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-4 px-6 py-6 border-t border-gray-100 md:px-8 sm:flex-row sm:items-center sm:justify-between bg-gray-50/40">

          <div>
            <p className="text-[10px] font-semibold tracking-[0.16em] text-gray-400 uppercase">
              Next step
            </p>

            <p className="mt-1 text-[13px] text-gray-500">
              Review your parameters and continue.
            </p>
          </div>

          <button
            onClick={onContinue}
            className="
              group
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-gray-950
              px-6
              py-3.5
              text-[13px]
              font-semibold
              text-white
              shadow-[0_4px_14px_rgba(0,0,0,0.12)]
              transition-all
              hover:bg-gray-800
              hover:shadow-[0_6px_18px_rgba(0,0,0,0.16)]
              active:scale-[0.98]
            "
          >
            Continue to Define

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
          </button>
        </div>
      </div>
    </div>
  );
}

/* Question */

function Question({
  number,
  title,
  description,
  children,
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-7 pt-1">
        <span className="font-mono text-[11px] font-medium text-gray-400">
          {number}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <label className="block text-[14px] font-semibold tracking-[-0.01em] text-gray-900">
          {title}
        </label>

        <p className="mt-1.5 mb-3 text-[13px] leading-6 text-gray-500">
          {description}
        </p>

        {children}
      </div>
    </div>
  );
}

/* Select */

function Select({
  value,
  onChange,
  children,
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="
          w-full
          appearance-none
          rounded-xl
          border
          border-gray-200
          bg-white
          px-4
          py-3
          pr-11
          text-[13px]
          font-medium
          text-gray-800
          outline-none
          cursor-pointer
          transition-all
          hover:border-gray-300
          focus:border-gray-950
          focus:ring-4
          focus:ring-gray-950/5
        "
      >
        {children}
      </select>

      <svg
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}