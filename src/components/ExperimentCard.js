"use client";

export default function ExperimentCard({
  experiment,
  onConfirm,
  loading = false,
}) {
  if (!experiment) {
    return null;
  }

  const canConfirm =
    !experiment.missingInformation ||
    experiment.missingInformation.length === 0;

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-50 border border-purple-100">
            <span className="text-xs font-semibold text-purple-600">
              2
            </span>
          </div>

          <span className="text-[11px] font-semibold tracking-[0.18em] text-purple-600">
            DEFINE
          </span>

          <div className="w-10 h-px bg-gray-200" />

          <span className="text-xs font-medium text-gray-400">
            Step 2 of 3
          </span>
        </div>

        <h1 className="text-3xl md:text-[40px] leading-[1.1] font-semibold tracking-[-0.035em] text-gray-950">
          Your research experiment.
        </h1>

        <p className="mt-4 max-w-2xl text-[15px] leading-7 text-gray-500">
          Before testing, we make the hypothesis, methodology, and
          assumptions explicit.
        </p>
      </div>

      {/* Main Card */}
      <div className="overflow-hidden bg-white border border-gray-200 rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.045)]">

        {/* Research Question */}
        <section className="px-6 py-7 md:px-8 md:py-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-semibold tracking-[0.16em] text-gray-400 uppercase">
              Research Question
            </span>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-5">
            <p className="text-[18px] md:text-[20px] leading-8 font-semibold tracking-[-0.02em] text-gray-900">
              {experiment.researchQuestion || "Not specified"}
            </p>
          </div>
        </section>

        {/* Hypothesis */}
        <section className="px-6 pb-7 md:px-8 md:pb-8">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-blue-500" />

              <span className="text-[10px] font-semibold tracking-[0.16em] text-blue-600 uppercase">
                Hypothesis
              </span>
            </div>

            <p className="text-[14px] leading-7 text-gray-700">
              {experiment.hypothesis ||
                "No hypothesis specified."}
            </p>
          </div>
        </section>

        {/* Experiment Parameters */}
        <section className="border-t border-gray-100">
          <div className="px-6 py-5 md:px-8 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.16em] text-gray-400 uppercase">
                  Experiment Parameters
                </p>

                <p className="mt-1 text-[13px] text-gray-500">
                  Rules and assumptions used during testing.
                </p>
              </div>

              <span className="hidden sm:block text-[11px] font-mono text-gray-400">
                CONFIG
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 border-t border-gray-100">
            <Field
              label="Market"
              value={experiment.market}
            />

            <Field
              label="Condition"
              value={experiment.condition}
            />

            <Field
              label="Entry Rule"
              value={experiment.entryRule}
            />

            <Field
              label="Exit Rule"
              value={experiment.exitRule}
            />

            <Field
              label="Holding Period"
              value={experiment.holdingPeriod}
            />

            <Field
              label="Test Period"
              value={experiment.testPeriod}
            />

            <Field
              label="Cost Assumptions"
              value={experiment.costAssumptions}
              fullWidth
            />
          </div>
        </section>

        {/* Missing Information */}
        {experiment.missingInformation?.length > 0 && (
          <section className="px-6 py-6 md:px-8 border-t border-gray-100">
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
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
                    <path d="M12 9v4" />
                    <path d="M12 17h.01" />
                    <path d="M10.3 3.8 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z" />
                  </svg>
                </div>

                <div>
                  <h3 className="text-[14px] font-semibold text-amber-900">
                    Information still needed
                  </h3>

                  <ul className="mt-3 space-y-2">
                    {experiment.missingInformation.map(
                      (item, index) => (
                        <li
                          key={index}
                          className="flex gap-2 text-[13px] leading-6 text-gray-700"
                        >
                          <span className="mt-2 w-1.5 h-1.5 flex-shrink-0 rounded-full bg-amber-500" />
                          {item}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Assumptions */}
        {experiment.assumptions?.length > 0 && (
          <section className="px-6 pb-6 md:px-8">
            <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-5">
              <div className="flex gap-3">
                <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-purple-100 text-purple-700">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 3 4 7v5c0 5 3.5 8 8 9 4.5-1 8-4 8-9V7l-8-4Z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>

                <div>
                  <h3 className="text-[14px] font-semibold text-purple-900">
                    Assumptions to confirm
                  </h3>

                  <ul className="mt-3 space-y-2">
                    {experiment.assumptions.map(
                      (item, index) => (
                        <li
                          key={index}
                          className="flex gap-2 text-[13px] leading-6 text-gray-700"
                        >
                          <span className="mt-2 w-1.5 h-1.5 flex-shrink-0 rounded-full bg-purple-500" />
                          {item}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Why It Matters */}
        {experiment.whyItMatters && (
          <section className="px-6 pb-7 md:px-8">
            <div className="pt-5 border-t border-gray-100">
              <p className="text-[10px] font-semibold tracking-[0.16em] text-gray-400 uppercase">
                Why this matters
              </p>

              <p className="mt-2 text-[13px] leading-6 text-gray-600">
                {experiment.whyItMatters}
              </p>
            </div>
          </section>
        )}

        {/* Confirmation Footer */}
        <div className="px-6 py-6 md:px-8 border-t border-gray-100 bg-gray-50/40">
          {!canConfirm && (
            <div className="flex items-center gap-2 mb-4 text-[13px] text-amber-700">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>

              Complete the missing information before running this experiment.
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.16em] text-gray-400 uppercase">
                Ready to test?
              </p>

              <p className="mt-1 text-[13px] text-gray-500">
                Confirm these parameters to continue.
              </p>
            </div>

            <button
              onClick={onConfirm}
              disabled={!canConfirm || loading}
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
                disabled:cursor-not-allowed
                disabled:opacity-40
                disabled:hover:bg-gray-950
              "
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Preparing Experiment...
                </>
              ) : (
                <>
                  Confirm Experiment

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
    </div>
  );
}


/* -------------------------------- */
/* Field */
/* -------------------------------- */

function Field({
  label,
  value,
  fullWidth = false,
}) {
  return (
    <div
      className={`
        px-6
        py-5
        md:px-8
        border-b
        border-gray-100
        ${fullWidth ? "md:col-span-2" : ""}
      `}
    >
      <p className="text-[10px] font-semibold tracking-[0.14em] text-gray-400 uppercase">
        {label}
      </p>

      <p className="mt-2 text-[13px] leading-6 font-medium text-gray-800">
        {value || "Not specified"}
      </p>
    </div>
  );
}