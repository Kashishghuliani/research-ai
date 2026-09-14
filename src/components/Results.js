"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

export default function Results({
  result,
  onNewExperiment,
}) {
  if (!result) {
    return null;
  }

  const {
    parameters = {},
    tradeCount = 0,
    winningTrades = 0,
    losingTrades = 0,
    winRate = 0,
    averageReturn = 0,
    totalReturn = 0,
    bestTrade = 0,
    worstTrade = 0,
    trades = [],
    dataType = "historical",
    dataSource = "Historical market data",
    fallDefinition,
  } = result;

  const isHistorical = dataType === "historical";

  const formatReturn = (value) => {
    const number = Number(value || 0);

    return `${number > 0 ? "+" : ""}${number.toFixed(2)}%`;
  };

  const formatEntryTiming = (value) => {
    if (value === "next_open") {
      return "Next day's open";
    }

    if (value === "same_close") {
      return "Same day's close";
    }

    return "Next day's close";
  };

  const tradeChartData = trades.map((trade, index) => ({
    name: `Trade ${index + 1}`,
    return: Number(trade.return || 0),
  }));

  const averageIsPositive = Number(averageReturn) >= 0;
  const totalIsPositive = Number(totalReturn) >= 0;

  return (
    <div className="space-y-7">

      {/* =================================
          RESULTS HERO
      ================================= */}

      <section className="overflow-hidden rounded-3xl bg-[#111111] text-white shadow-xl">

        <div className="p-7 md:p-9">

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">

            <div>

              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-gray-300">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                EXPERIMENT COMPLETE
              </div>

              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-5">
                Experiment Results
              </h2>

              <p className="text-gray-400 mt-3 max-w-2xl leading-relaxed">
                Evidence generated from the selected research parameters
                and dataset.
              </p>

            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 min-w-[180px]">

              <p className="text-xs uppercase tracking-wider text-gray-500">
                Data
              </p>

              <p className="font-semibold mt-1">
                {isHistorical ? "Historical" : "Simulated"}
              </p>

              <p className="text-xs text-gray-500 mt-1">
                {isHistorical
                  ? dataSource
                  : "Synthetic market data"}
              </p>

            </div>

          </div>

          {/* Summary */}

          <div className="mt-8 rounded-2xl bg-white/5 border border-white/10 p-5 md:p-6">

            <p className="text-xs uppercase tracking-wider text-gray-500">
              Experiment Summary
            </p>

            <p className="text-lg md:text-xl font-semibold mt-3 leading-relaxed">
              Buy after a{" "}
              <span className="text-white">
                {parameters.fallPercentage}%
              </span>{" "}
              fall and hold for{" "}
              <span className="text-white">
                {parameters.holdingPeriod}
              </span>{" "}
              trading days.
            </p>

            <p className="text-gray-400 mt-2 text-sm">
              Tested over {parameters.testPeriod} year(s)
              with entry at{" "}
              {formatEntryTiming(parameters.entryTiming)}.
            </p>

          </div>

        </div>

        {/* Hero metrics */}

        <div className="grid grid-cols-2 md:grid-cols-4 border-t border-white/10">

          <HeroMetric
            label="Trades"
            value={tradeCount}
          />

          <HeroMetric
            label="Win Rate"
            value={`${winRate}%`}
          />

          <HeroMetric
            label="Avg. Return"
            value={formatReturn(averageReturn)}
            positive={averageIsPositive}
          />

          <HeroMetric
            label="Total Return"
            value={formatReturn(totalReturn)}
            positive={totalIsPositive}
          />

        </div>

      </section>


      {/* =================================
          PARAMETERS
      ================================= */}

      <section className="rounded-3xl border border-gray-200 bg-white p-6 md:p-7 shadow-sm">

        <SectionHeading
          eyebrow="EXPERIMENT"
          eyebrowClass="text-gray-500"
          title="Parameters"
          description="The exact conditions used to generate the result."
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">

          <Metric
            label="Fall threshold"
            value={`${parameters.fallPercentage ?? "-"}%`}
          />

          <Metric
            label="Holding period"
            value={`${parameters.holdingPeriod ?? "-"} day(s)`}
          />

          <Metric
            label="Test period"
            value={`${parameters.testPeriod ?? "-"} year(s)`}
          />

          <Metric
            label="Entry timing"
            value={formatEntryTiming(parameters.entryTiming)}
          />

        </div>

      </section>


      {/* =================================
          PERFORMANCE
      ================================= */}

      <section className="rounded-3xl border border-gray-200 bg-white p-6 md:p-7 shadow-sm">

        <SectionHeading
          eyebrow="PERFORMANCE"
          eyebrowClass="text-green-600"
          title="Performance breakdown"
          description="A summary of how the qualifying trades performed."
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">

          <PerformanceMetric
            label="Winning trades"
            value={winningTrades}
            type="positive"
          />

          <PerformanceMetric
            label="Losing trades"
            value={losingTrades}
            type="negative"
          />

          <PerformanceMetric
            label="Best trade"
            value={formatReturn(bestTrade)}
            type="positive"
          />

          <PerformanceMetric
            label="Worst trade"
            value={formatReturn(worstTrade)}
            type="negative"
          />

        </div>

      </section>


      {/* =================================
          EVIDENCE QUALITY
      ================================= */}

      <section className="rounded-3xl border border-gray-200 bg-white p-6 md:p-7 shadow-sm">

        <SectionHeading
          eyebrow="EVIDENCE QUALITY"
          eyebrowClass="text-purple-600"
          title="How much should we trust this result?"
          description="Important context behind the evidence."
        />

        <div className="grid md:grid-cols-2 gap-4 mt-6">

          <EvidenceItem
            label="Data"
            value={isHistorical ? "Historical" : "Simulated"}
            description={
              isHistorical
                ? `${dataSource}.`
                : "Synthetic market data."
            }
          />

          <EvidenceItem
            label="Sample size"
            value={`${tradeCount} trades`}
            description="Number of qualifying events found by the experiment."
          />

          <EvidenceItem
            label="Reproducibility"
            value="Deterministic"
            description="The same parameters applied to the same dataset produce the same calculation."
          />

          <EvidenceItem
            label="Experiment type"
            value="Backtest"
            description="Historical observations are evaluated using explicit entry and exit rules."
          />

        </div>

        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">

          <div className="flex items-start gap-3">

            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 font-bold">
              !
            </div>

            <div>

              <p className="font-semibold text-amber-900">
                Confidence limitation
              </p>

              <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                {isHistorical
                  ? "The results are based on historical NIFTY 50 data. They do not account for all real-world costs, slippage, taxes, liquidity constraints, or market impact. Historical performance does not guarantee future results."
                  : "This experiment uses simulated data and should be treated as a demonstration of the research workflow rather than evidence of real-world trading performance."}
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =================================
          TRADE RETURNS
      ================================= */}

      <section className="rounded-3xl border border-gray-200 bg-white p-6 md:p-7 shadow-sm">

        <SectionHeading
          eyebrow="TRADE-LEVEL EVIDENCE"
          eyebrowClass="text-blue-600"
          title="Trade Returns"
          description="Return observed after each qualifying market fall."
        />

        {trades.length === 0 ? (

          <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">

            <p className="font-semibold text-gray-700">
              No qualifying trades were found.
            </p>

            <p className="text-sm text-gray-500 mt-1">
              Try changing the fall threshold or test period.
            </p>

          </div>

        ) : (

          <>

            {/* Trade cards */}

            <div className="mt-6 space-y-3">

              {trades.map((trade, index) => {

                const returnValue = Number(
                  trade.return || 0
                );

                const positive = returnValue >= 0;

                return (

                  <div
                    key={index}
                    className="group rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-gray-300 hover:shadow-sm"
                  >

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                      <div className="flex items-start gap-4">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-sm font-bold text-gray-600">
                          {index + 1}
                        </div>

                        <div>

                          <p className="font-semibold text-gray-900">
                            Trade {index + 1}
                          </p>

                          <p className="text-sm text-gray-500 mt-1">
                            Fall {trade.fall}%{" "}
                            <span className="mx-1">•</span>
                            Entry {trade.entryDate}{" "}
                            <span className="mx-1">•</span>
                            Exit {trade.exitDate}
                          </p>

                        </div>

                      </div>

                      <div
                        className={`rounded-xl px-4 py-2 text-right ${
                          positive
                            ? "bg-green-50"
                            : "bg-red-50"
                        }`}
                      >

                        <p
                          className={`text-lg font-bold ${
                            positive
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatReturn(returnValue)}
                        </p>

                      </div>

                    </div>


                    <div className="grid grid-cols-3 gap-3 mt-5">

                      <TradeDetail
                        label="Entry Price"
                        value={trade.entryPrice}
                      />

                      <TradeDetail
                        label="Exit Price"
                        value={trade.exitPrice}
                      />

                      <TradeDetail
                        label="Holding"
                        value={`${trade.holdingPeriod} days`}
                      />

                    </div>

                  </div>

                );

              })}

            </div>


            {/* Chart */}

            <div className="mt-10 rounded-2xl border border-gray-200 bg-gray-50/70 p-5 md:p-6">

              <div>

                <h4 className="text-xl font-bold tracking-tight">
                  Return by Trade
                </h4>

                <p className="text-sm text-gray-500 mt-1">
                  Each bar represents the return generated
                  by one qualifying trade.
                </p>

              </div>

              <div className="w-full h-[380px] mt-7">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <BarChart
                    data={tradeChartData}
                    margin={{
                      top: 35,
                      right: 20,
                      left: 5,
                      bottom: 20,
                    }}
                    barCategoryGap="22%"
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e5e7eb"
                    />

                    <XAxis
                      dataKey="name"
                      tick={{
                        fontSize: 12,
                        fill: "#6b7280",
                      }}
                      tickLine={false}
                      axisLine={false}
                    />

                    <YAxis
                      tickFormatter={(value) =>
                        `${value}%`
                      }
                      tick={{
                        fontSize: 12,
                        fill: "#6b7280",
                      }}
                      tickLine={false}
                      axisLine={false}
                      width={55}
                    />

                    <Tooltip
                      cursor={{ fill: "#f3f4f6" }}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e5e7eb",
                        boxShadow:
                          "0 8px 30px rgba(0,0,0,0.08)",
                      }}
                      formatter={(value) =>
                        `${Number(value).toFixed(2)}%`
                      }
                    />

                    <ReferenceLine
                      y={0}
                      stroke="#9ca3af"
                      strokeWidth={1}
                    />

                    <Bar
                      dataKey="return"
                      name="Return"
                      maxBarSize={65}
                      radius={[6, 6, 6, 6]}
                    >

                      {tradeChartData.map(
                        (entry, index) => (
                          <Cell
                            key={`trade-${index}`}
                            fill={
                              entry.return >= 0
                                ? "#16a34a"
                                : "#dc2626"
                            }
                          />
                        )
                      )}

                      <LabelList
                        dataKey="return"
                        position="top"
                        formatter={(value) =>
                          `${Number(value) > 0 ? "+" : ""}${Number(value).toFixed(2)}%`
                        }
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      />

                    </Bar>

                  </BarChart>

                </ResponsiveContainer>

              </div>

            </div>

          </>

        )}

      </section>


      {/* =================================
          INTERPRETATION
      ================================= */}

      <section className="rounded-3xl border border-gray-200 bg-white p-6 md:p-7 shadow-sm">

        <SectionHeading
          eyebrow="INTERPRETATION"
          eyebrowClass="text-blue-600"
          title="What do these results mean?"
          description="Separate the observed evidence from what we can reasonably conclude."
        />

        <div className="mt-7 space-y-7">

          <InterpretationBlock title="What the data shows">

            <p>
              The experiment identified{" "}
              <strong>{tradeCount}</strong>{" "}
              qualifying events. The historical win rate
              was <strong>{winRate}%</strong> with an average
              return of{" "}
              <strong>{formatReturn(averageReturn)}</strong>.
            </p>

          </InterpretationBlock>


          <InterpretationBlock title="What we can reasonably conclude">

            <p>
              {tradeCount < 10
                ? "The sample is too small to establish a reliable trading edge. These observations describe what happened in the selected historical period, but they are not sufficient to generalize to future market conditions."
                : averageReturn > 0
                ? "The selected historical period produced a positive average return after qualifying falls. This is evidence worth investigating further, but it does not establish that the strategy will remain profitable."
                : "The selected historical period did not produce a positive average return after qualifying falls. This result does not prove the strategy cannot work under different parameters or market conditions."}
            </p>

          </InterpretationBlock>


          {fallDefinition && (

            <InterpretationBlock title="Fall definition">

              <p>{fallDefinition}</p>

            </InterpretationBlock>

          )}


          <InterpretationBlock title="What could invalidate this result">

            <ul className="space-y-2">

              <li>• The sample may be too small.</li>

              <li>• Transaction costs and slippage are not included.</li>

              <li>• Different fall thresholds may produce different results.</li>

              <li>• Different holding periods may produce different results.</li>

              <li>• Market conditions can change over time.</li>

              <li>• Historical performance does not guarantee future performance.</li>

            </ul>

          </InterpretationBlock>


          <InterpretationBlock title="What should we investigate next">

            <div className="grid md:grid-cols-2 gap-3">

              <NextStep text="Test multiple fall thresholds." />

              <NextStep text="Test multiple holding periods." />

              <NextStep text="Test different market regimes." />

              <NextStep text="Include transaction costs and slippage." />

              <NextStep text="Test a longer historical period." />

            </div>

          </InterpretationBlock>

        </div>

      </section>


      {/* =================================
          RESEARCH INTEGRITY
      ================================= */}

      <section className="rounded-3xl border border-gray-200 bg-gray-50 p-6 md:p-7">

        <div className="flex items-start gap-4">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-gray-200 font-bold">
            ✓
          </div>

          <div>

            <h3 className="text-lg font-bold">
              Research Integrity
            </h3>

            <p className="text-sm text-gray-600 mt-2 leading-relaxed">

              {isHistorical
                ? "This experiment uses historical NIFTY 50 market data. The results describe past observations and should not be interpreted as investment advice, guaranteed future performance, or proof of a trading strategy."
                : "This prototype uses simulated market data. It demonstrates an AI-assisted research workflow and should not be interpreted as historical performance, investment advice, or a guaranteed trading strategy."}

            </p>

          </div>

        </div>

      </section>


      {/* =================================
          NEW RESEARCH
      ================================= */}

      <button
        onClick={onNewExperiment}
        className="group w-full rounded-2xl bg-black text-white py-4 font-semibold shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
      >
        Start New Research Question
        <span className="ml-2 inline-block transition group-hover:translate-x-1">
          →
        </span>
      </button>

    </div>
  );
}


/* =================================
   HERO METRIC
================================= */

function HeroMetric({
  label,
  value,
  positive,
}) {
  return (
    <div className="px-5 py-5 md:px-6">

      <p className="text-xs uppercase tracking-wider text-gray-500">
        {label}
      </p>

      <p
        className={`text-2xl font-bold mt-2 ${
          positive === true
            ? "text-green-400"
            : positive === false
            ? "text-red-400"
            : "text-white"
        }`}
      >
        {value}
      </p>

    </div>
  );
}


/* =================================
   SECTION HEADING
================================= */

function SectionHeading({
  eyebrow,
  eyebrowClass,
  title,
  description,
}) {
  return (
    <div>

      <p
        className={`text-xs font-bold tracking-[0.16em] ${eyebrowClass}`}
      >
        {eyebrow}
      </p>

      <h3 className="text-2xl font-bold tracking-tight mt-2">
        {title}
      </h3>

      {description && (
        <p className="text-gray-500 mt-2 text-sm">
          {description}
        </p>
      )}

    </div>
  );
}


/* =================================
   METRIC
================================= */

function Metric({
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">

      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="font-bold text-lg mt-2 text-gray-900">
        {value}
      </p>

    </div>
  );
}


/* =================================
   PERFORMANCE METRIC
================================= */

function PerformanceMetric({
  label,
  value,
  type,
}) {
  const positive = type === "positive";

  return (
    <div
      className={`rounded-2xl p-5 border ${
        positive
          ? "bg-green-50 border-green-100"
          : "bg-red-50 border-red-100"
      }`}
    >

      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p
        className={`text-2xl font-bold mt-2 ${
          positive
            ? "text-green-700"
            : "text-red-700"
        }`}
      >
        {value}
      </p>

    </div>
  );
}


/* =================================
   EVIDENCE ITEM
================================= */

function EvidenceItem({
  label,
  value,
  description,
}) {
  return (
    <div className="rounded-2xl border border-gray-200 p-5">

      <div className="flex items-center justify-between gap-4">

        <p className="font-semibold">
          {label}
        </p>

        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold">
          {value}
        </span>

      </div>

      <p className="text-sm text-gray-500 mt-3 leading-relaxed">
        {description}
      </p>

    </div>
  );
}


/* =================================
   TRADE DETAIL
================================= */

function TradeDetail({
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">

      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className="font-semibold mt-1 text-sm">
        {value}
      </p>

    </div>
  );
}


/* =================================
   INTERPRETATION BLOCK
================================= */

function InterpretationBlock({
  title,
  children,
}) {
  return (
    <div>

      <h4 className="font-bold text-gray-900">
        {title}
      </h4>

      <div className="text-gray-600 mt-2 text-sm leading-7">
        {children}
      </div>

    </div>
  );
}


/* =================================
   NEXT STEP
================================= */

function NextStep({
  text,
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
      {text}
    </div>
  );
}
