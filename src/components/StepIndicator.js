"use client";

const steps = [
  "Ask",
  "Clarify",
  "Define",
  "Test",
  "Learn",
];

export default function StepIndicator({
  currentStep,
}) {
  return (
    <div className="w-full max-w-4xl mx-auto mb-10">
      {/* Desktop */}
      <div className="hidden sm:flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <div
              key={step}
              className="flex items-center flex-1 last:flex-none"
            >
              {/* Step */}
              <div className="flex items-center gap-3">
                <div
                  className={`
                    relative
                    flex
                    items-center
                    justify-center
                    w-9
                    h-9
                    rounded-full
                    border
                    text-xs
                    font-semibold
                    transition-all
                    duration-300
                    ${
                      isCompleted
                        ? "bg-gray-950 border-gray-950 text-white"
                        : isActive
                        ? "bg-white border-gray-950 text-gray-950 shadow-[0_0_0_4px_rgba(17,24,39,0.06)]"
                        : "bg-gray-100 border-gray-200 text-gray-400"
                    }
                  `}
                >
                  {isCompleted ? (
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="m5 12 4 4L19 6" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>

                <div className="min-w-[55px]">
                  <p
                    className={`
                      text-[12px]
                      font-medium
                      transition-colors
                      ${
                        isActive
                          ? "text-gray-950 font-semibold"
                          : isCompleted
                          ? "text-gray-700"
                          : "text-gray-400"
                      }
                    `}
                  >
                    {step}
                  </p>

                  {isActive && (
                    <p className="mt-0.5 text-[9px] font-semibold tracking-[0.12em] text-gray-400 uppercase">
                      Current
                    </p>
                  )}
                </div>
              </div>

              {/* Connector */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4">
                  <div className="relative h-px bg-gray-200">
                    <div
                      className={`
                        absolute
                        inset-y-0
                        left-0
                        transition-all
                        duration-500
                        ${
                          isCompleted
                            ? "w-full bg-gray-950"
                            : "w-0"
                        }
                      `}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-950 text-white text-xs font-semibold">
              {currentStep + 1}
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-950">
                {steps[currentStep]}
              </p>

              <p className="text-[11px] text-gray-400">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
          </div>

          <span className="font-mono text-[11px] text-gray-400">
            {Math.round(
              ((currentStep + 1) / steps.length) * 100
            )}
            %
          </span>
        </div>

        {/* Mobile Progress */}
        <div className="h-1 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-gray-950 transition-all duration-500"
            style={{
              width: `${
                ((currentStep + 1) / steps.length) * 100
              }%`,
            }}
          />
        </div>

        {/* Step Names */}
        <div className="flex justify-between mt-2">
          {steps.map((step, index) => (
            <span
              key={step}
              className={`
                text-[9px]
                font-medium
                ${
                  index <= currentStep
                    ? "text-gray-700"
                    : "text-gray-400"
                }
              `}
            >
              {step}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}