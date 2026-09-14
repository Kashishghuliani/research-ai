"use client";

import { useState } from "react";

import StepIndicator from "@/components/StepIndicator";
import QuestionInput from "@/components/QuestionInput";
import ExperimentCard from "@/components/ExperimentCard";
import ClarificationForm from "@/components/ClarificationForm";
import Results from "@/components/Results";
import Comparison from "@/components/Comparison";

export default function Home() {
  // =================================
  // Main state
  // =================================

  const DEFAULT_QUESTION =
    "Does buying NIFTY after a sharp fall work?";

  const [question, setQuestion] =
    useState(DEFAULT_QUESTION);

  const [experiment, setExperiment] =
    useState(null);

  const [result, setResult] =
    useState(null);

  const [comparison, setComparison] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // =================================
  // Experiment parameters
  // =================================

  const [fallPercentage, setFallPercentage] =
    useState("3");

  const [holdingPeriod, setHoldingPeriod] =
    useState("10");

  const [testPeriod, setTestPeriod] =
    useState("1");

  const [entryTiming, setEntryTiming] =
    useState("next_open");

  // =================================
  // Current step
  // =================================

  const [step, setStep] =
    useState(0);

  // =================================
  // Helpers
  // =================================

  function clearError() {
    setError("");
  }

  function showError(message) {
    setError(
      message ||
        "Something went wrong. Please try again."
    );
  }

  // =================================
  // ASK → AI ANALYSIS
  // =================================

  async function analyzeQuestion() {
    clearError();

    if (!question.trim()) {
      showError(
        "Please enter a research question."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/analyze",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            question: question.trim(),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Analysis failed."
        );
      }

      setExperiment(data);

      if (
        data.missingInformation &&
        data.missingInformation.length > 0
      ) {
        setStep(1);
      } else {
        setStep(2);
      }
    } catch (error) {
      console.error(
        "Question analysis error:",
        error
      );

      showError(
        error.message ||
          "Could not analyze the question."
      );
    } finally {
      setLoading(false);
    }
  }

  // =================================
  // CLARIFY → DEFINE
  // =================================

  function continueExperiment() {
    clearError();

    const fall =
      Number(fallPercentage);

    const holding =
      Number(holdingPeriod);

    const years =
      Number(testPeriod);

    if (
      !Number.isFinite(fall) ||
      fall <= 0
    ) {
      showError(
        "Fall threshold must be greater than 0."
      );
      return;
    }

    if (
      !Number.isFinite(holding) ||
      holding <= 0
    ) {
      showError(
        "Holding period must be greater than 0."
      );
      return;
    }

    if (
      !Number.isFinite(years) ||
      years <= 0
    ) {
      showError(
        "Test period must be greater than 0."
      );
      return;
    }

    setComparison(null);
    setResult(null);
    setStep(2);
  }

  // =================================
  // DEFINE → TEST
  // =================================

  function confirmExperiment() {
    clearError();

    setComparison(null);
    setResult(null);
    setStep(3);
  }

  // =================================
  // TEST → RUN BACKTEST
  // =================================

  async function runExperiment() {
    if (loading) {
      return;
    }

    clearError();

    try {
      setLoading(true);

      setResult(null);
      setComparison(null);

      const response =
        await fetch(
          "/api/backtest",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              fallPercentage,
              holdingPeriod,
              testPeriod,
              entryTiming,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Backtest failed."
        );
      }

      setResult(data);
      setStep(4);
    } catch (error) {
      console.error(
        "Backtest error:",
        error
      );

      showError(
        error.message ||
          "Could not run the experiment."
      );
    } finally {
      setLoading(false);
    }
  }

  // =================================
  // ROBUSTNESS CHECK
  // =================================

  async function runComparison() {
    if (loading) {
      return;
    }

    clearError();

    try {
      setLoading(true);

      setComparison(null);

      const response =
        await fetch(
          "/api/compare",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              holdingPeriod,
              testPeriod,
              entryTiming,

              thresholds: [
                1,
                2,
                3,
                5,
              ],
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Comparison failed."
        );
      }

      setComparison(
        data.results || []
      );
    } catch (error) {
      console.error(
        "Comparison error:",
        error
      );

      showError(
        error.message ||
          "Could not run comparison."
      );
    } finally {
      setLoading(false);
    }
  }

  // =================================
  // BACK NAVIGATION
  // =================================

  function goBack() {
    clearError();

    if (loading) {
      return;
    }

    if (step === 1) {
      setStep(0);
      return;
    }

    if (step === 2) {
      setStep(
        experiment?.missingInformation?.length
          ? 1
          : 0
      );
      return;
    }

    if (step === 3) {
      setStep(2);
      return;
    }

    if (step === 4) {
      setStep(3);
    }
  }

  // =================================
  // NEW RESEARCH
  // =================================

  function startNewResearch() {
    clearError();

    setQuestion(
      DEFAULT_QUESTION
    );

    setExperiment(null);
    setResult(null);
    setComparison(null);

    setFallPercentage("3");
    setHoldingPeriod("10");
    setTestPeriod("1");
    setEntryTiming("next_open");

    setStep(0);
  }

  // =================================
  // FINAL DEFINED EXPERIMENT
  // =================================

  const definedExperiment =
    experiment
      ? {
          ...experiment,

          condition:
            `Intraday low is at least ${fallPercentage}% below the previous trading day's close`,

          entryRule:
            entryTiming ===
            "next_open"
              ? "Enter at next day's open"
              : entryTiming ===
                "same_close"
              ? "Enter at same day's close"
              : "Enter at next day's close",

          exitRule:
            `Exit after ${holdingPeriod} trading day${
              Number(holdingPeriod) === 1
                ? ""
                : "s"
            }`,

          holdingPeriod:
            `${holdingPeriod} day${
              Number(holdingPeriod) === 1
                ? ""
                : "s"
            }`,

          testPeriod:
            `${testPeriod} year${
              Number(testPeriod) === 1
                ? ""
                : "s"
            }`,

          missingInformation: [],

          assumptions:
            experiment.assumptions || [],
        }
      : null;

  // =================================
  // UI
  // =================================

  return (
    <main className="min-h-screen bg-[#f5f5f3] text-gray-950">

      {/* =================================
          TOP NAV / BRAND
      ================================= */}

      <header className="border-b border-gray-200/80 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

          <button
            onClick={startNewResearch}
            className="flex items-center gap-2.5 group"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-950 text-white shadow-sm">
              <span className="text-sm font-semibold">
                R
              </span>
            </div>

            <span className="text-[15px] font-semibold tracking-[-0.02em]">
              ResearchAI
            </span>
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />

            <span className="text-[11px] font-medium text-gray-400">
              Research environment
            </span>
          </div>

        </div>
      </header>

      {/* =================================
          HERO
      ================================= */}

      <section className="relative overflow-hidden border-b border-gray-200 bg-[#fafaf9]">

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(#e5e5e5 1px, transparent 1px), linear-gradient(90deg, #e5e5e5 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Fade overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#fafaf9]/70 to-[#fafaf9]" />

        <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-20">

          <div className="max-w-3xl">

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white/80 shadow-sm mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-950" />

              <span className="text-[10px] font-semibold tracking-[0.16em] text-gray-600 uppercase">
                AI-Native Trading Research
              </span>
            </div>

            <h1 className="text-4xl md:text-[56px] leading-[1.05] font-semibold tracking-[-0.045em] text-gray-950">
              From vague questions
              <br className="hidden md:block" />
              to testable evidence.
            </h1>

            <p className="mt-6 max-w-2xl text-[15px] md:text-[16px] leading-7 text-gray-500">
              Turn ambiguous trading ideas into explicit
              hypotheses, reproducible experiments, and
              evidence you can actually reason about.
            </p>

          </div>

        </div>
      </section>

      {/* =================================
          MAIN WORKSPACE
      ================================= */}

      <div className="max-w-5xl mx-auto px-5 md:px-6 py-10 md:py-14">

        {/* Step Indicator */}
        <StepIndicator
          currentStep={step}
        />

        {/* =================================
            ERROR
        ================================= */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/80 p-4 shadow-sm">

            <div className="flex items-start justify-between gap-4">

              <div className="flex gap-3">

                <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-red-100 text-red-600">
                  !
                </div>

                <div>
                  <p className="text-[13px] font-semibold text-red-900">
                    Something went wrong
                  </p>

                  <p className="mt-1 text-[12px] leading-5 text-red-700">
                    {error}
                  </p>
                </div>

              </div>

              <button
                onClick={clearError}
                className="flex items-center justify-center w-7 h-7 rounded-lg text-red-400 hover:bg-red-100 hover:text-red-700 transition"
                aria-label="Close error"
              >
                ×
              </button>

            </div>
          </div>
        )}

        {/* =================================
            ASK
        ================================= */}

        {step === 0 && (
          <QuestionInput
            question={question}
            setQuestion={(value) => {
              clearError();
              setQuestion(value);
            }}
            onAnalyze={analyzeQuestion}
            loading={loading}
          />
        )}

        {/* =================================
            CLARIFY
        ================================= */}

        {step === 1 &&
          experiment && (
            <div className="space-y-6">

              <ExperimentCard
                experiment={experiment}
              />

              <ClarificationForm
                fallPercentage={
                  fallPercentage
                }
                setFallPercentage={
                  setFallPercentage
                }
                holdingPeriod={
                  holdingPeriod
                }
                setHoldingPeriod={
                  setHoldingPeriod
                }
                testPeriod={
                  testPeriod
                }
                setTestPeriod={
                  setTestPeriod
                }
                entryTiming={
                  entryTiming
                }
                setEntryTiming={
                  setEntryTiming
                }
                onContinue={
                  continueExperiment
                }
              />

              <BackButton
                onClick={goBack}
              />

            </div>
          )}

        {/* =================================
            DEFINE
        ================================= */}

        {step === 2 &&
          definedExperiment && (
            <div className="space-y-6">

              <ExperimentCard
                experiment={
                  definedExperiment
                }
                onConfirm={
                  confirmExperiment
                }
                loading={loading}
              />

              <BackButton
                onClick={goBack}
              />

            </div>
          )}

        {/* =================================
            TEST
        ================================= */}

        {step === 3 &&
          definedExperiment && (
            <div className="space-y-6">

              <div className="w-full max-w-3xl mx-auto">

                <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-[#f8f8f7] shadow-[0_20px_60px_rgba(0,0,0,0.06)]">

                  {/* Header */}
                  <div className="p-6 md:p-8">

                    <div className="flex items-center gap-2 mb-5">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />

                      <span className="text-[10px] font-semibold tracking-[0.16em] text-purple-600 uppercase">
                        Test
                      </span>
                    </div>

                    <h2 className="text-3xl font-semibold tracking-[-0.035em] text-gray-950">
                      Experiment is ready.
                    </h2>

                    <p className="mt-4 text-[14px] leading-7 text-gray-500">
                      Your research question and experiment
                      parameters have been explicitly defined.
                      Run the experiment to generate evidence.
                    </p>

                  </div>

                  {/* Parameters */}
                  <div className="px-6 pb-6 md:px-8">

                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">

                      <Parameter
                        label="Fall threshold"
                        value={`${fallPercentage}%`}
                      />

                      <Parameter
                        label="Entry"
                        value={formatEntryTiming(
                          entryTiming
                        )}
                      />

                      <Parameter
                        label="Holding period"
                        value={`${holdingPeriod} trading day${
                          Number(holdingPeriod) === 1
                            ? ""
                            : "s"
                        }`}
                      />

                      <Parameter
                        label="Test period"
                        value={`${testPeriod} year${
                          Number(testPeriod) === 1
                            ? ""
                            : "s"
                        }`}
                        last
                      />

                    </div>

                  </div>

                  {/* Footer */}
                  <div className="flex flex-col gap-4 px-6 py-6 md:px-8 border-t border-gray-200 bg-white/70 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <p className="text-[10px] font-semibold tracking-[0.15em] text-gray-400 uppercase">
                        Ready
                      </p>

                      <p className="mt-1 text-[13px] text-gray-500">
                        Run the backtest to see what the data says.
                      </p>
                    </div>

                    <button
                      onClick={
                        runExperiment
                      }
                      disabled={loading}
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
                        shadow-[0_5px_18px_rgba(0,0,0,0.15)]
                        transition-all
                        hover:bg-gray-800
                        active:scale-[0.98]
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      "
                    >
                      {loading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Running experiment...
                        </>
                      ) : (
                        <>
                          Run Experiment

                          <svg
                            className="transition-transform group-hover:translate-x-1"
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

              <BackButton
                onClick={goBack}
              />

            </div>
          )}

        {/* =================================
            LEARN
        ================================= */}

        {step === 4 &&
          result && (
            <div className="space-y-6">

              <Results
                result={result}
                onNewExperiment={
                  startNewResearch
                }
              />

              {/* Robustness */}
              <div className="w-full max-w-3xl mx-auto">

                <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-[#f8f8f7] shadow-[0_12px_40px_rgba(0,0,0,0.045)]">

                  <div className="p-6 md:p-8">

                    <div className="flex items-center gap-2 mb-4">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />

                      <span className="text-[10px] font-semibold tracking-[0.16em] text-blue-600 uppercase">
                        Next Investigation
                      </span>
                    </div>

                    <h3 className="text-2xl md:text-3xl font-semibold tracking-[-0.035em] text-gray-950">
                      Is the result robust?
                    </h3>

                    <p className="mt-3 text-[14px] leading-7 text-gray-500">
                      Compare the same experiment across
                      multiple fall thresholds while keeping
                      the other parameters fixed.
                    </p>

                    {/* Fixed / Variable */}
                    <div className="grid sm:grid-cols-2 gap-3 mt-6">

                      <div className="rounded-2xl border border-gray-200 bg-white p-4">
                        <p className="text-[10px] font-semibold tracking-[0.14em] text-gray-400 uppercase">
                          Fixed
                        </p>

                        <p className="mt-2 text-[13px] leading-6 text-gray-700">
                          {holdingPeriod} day holding period,
                          {" "}
                          {testPeriod} year test period,
                          {" "}
                          {formatEntryTiming(
                            entryTiming
                          )}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                        <p className="text-[10px] font-semibold tracking-[0.14em] text-blue-500 uppercase">
                          Variable
                        </p>

                        <p className="mt-2 text-[13px] leading-6 text-gray-700">
                          Fall threshold
                        </p>

                        <div className="flex gap-2 mt-3">
                          {[1, 2, 3, 5].map(
                            (threshold) => (
                              <span
                                key={threshold}
                                className="px-2.5 py-1 rounded-lg bg-white border border-blue-100 text-[11px] font-medium text-gray-700"
                              >
                                {threshold}%
                              </span>
                            )
                          )}
                        </div>
                      </div>

                    </div>

                  </div>

                  <div className="px-6 py-6 md:px-8 border-t border-gray-200 bg-white/70">

                    <button
                      onClick={
                        runComparison
                      }
                      disabled={loading}
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
                        shadow-[0_5px_18px_rgba(0,0,0,0.15)]
                        transition-all
                        hover:bg-gray-800
                        active:scale-[0.98]
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      "
                    >
                      {loading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Comparing...
                        </>
                      ) : (
                        <>
                          Compare Thresholds

                          <svg
                            className="transition-transform group-hover:translate-x-1"
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

              {/* Comparison */}
              {comparison && (
                <Comparison
                  results={
                    comparison
                  }
                />
              )}

              {/* New Research */}
              <div className="w-full max-w-3xl mx-auto pt-2">

                <button
                  onClick={
                    startNewResearch
                  }
                  disabled={loading}
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-gray-200
                    bg-white
                    py-4
                    text-[13px]
                    font-semibold
                    text-gray-800
                    shadow-sm
                    transition-all
                    hover:border-gray-300
                    hover:bg-gray-50
                    disabled:opacity-50
                  "
                >
                  Start New Research Question
                </button>

              </div>

            </div>
          )}

      </div>

      {/* =================================
          FOOTER
      ================================= */}

      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">

          <p className="text-[11px] text-gray-400">
            ResearchAI · Evidence over intuition.
          </p>

          <p className="text-[11px] text-gray-400">
            For research purposes only.
          </p>

        </div>
      </footer>

    </main>
  );
}


/* =================================
   Parameter
================================= */

function Parameter({
  label,
  value,
  last = false,
}) {
  return (
    <div
      className={`
        flex
        flex-col
        sm:flex-row
        sm:items-center
        sm:justify-between
        gap-1
        px-5
        py-4
        ${!last ? "border-b border-gray-100" : ""}
      `}
    >
      <span className="text-[10px] font-semibold tracking-[0.14em] text-gray-400 uppercase">
        {label}
      </span>

      <span className="text-[13px] font-medium text-gray-800">
        {value}
      </span>
    </div>
  );
}


/* =================================
   Entry timing formatter
================================= */

function formatEntryTiming(value) {
  if (value === "next_open") {
    return "Next day's open";
  }

  if (value === "same_close") {
    return "Same day's close";
  }

  return "Next day's close";
}


/* =================================
   Back button
================================= */

function BackButton({
  onClick,
}) {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <button
        onClick={onClick}
        className="
          inline-flex
          items-center
          gap-2
          text-[12px]
          font-medium
          text-gray-400
          hover:text-gray-950
          transition-colors
        "
      >
        <span className="transition-transform group-hover:-translate-x-1">
          ←
        </span>

        Back
      </button>
    </div>
  );
}