"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

export default function Comparison({ results }) {
  if (!results || results.length === 0) {
    return null;
  }

  const chartData = results.map((item) => ({
    ...item,
    chartReturn:
      Number(item.tradeCount) > 0
        ? Number(item.averageReturn)
        : null,
  }));

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-7 shadow-sm">

      {/* HEADER */}

      <div className="mb-7">
        <p className="text-sm font-semibold text-blue-600 tracking-wide">
          ROBUSTNESS CHECK
        </p>

        <h2 className="text-2xl font-bold tracking-tight mt-1">
          Does the result depend on the threshold?
        </h2>

        <p className="text-gray-500 mt-2 leading-relaxed">
          We compare multiple fall thresholds while
          keeping the holding period, test period,
          and entry timing fixed.
        </p>
      </div>


      {/* TABLE */}

      <div className="overflow-x-auto rounded-xl border border-gray-200">

        <table className="w-full text-left">

          <thead className="bg-gray-50">
            <tr className="border-b border-gray-200">

              <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Fall
              </th>

              <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Trades
              </th>

              <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Win Rate
              </th>

              <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Avg Return
              </th>

              <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Total Return
              </th>

            </tr>
          </thead>

          <tbody>

            {results.map((item) => {
              const hasTrades =
                Number(item.tradeCount) > 0;

              const averageReturn =
                Number(item.averageReturn || 0);

              const totalReturn =
                Number(item.totalReturn || 0);

              return (
                <tr
                  key={item.threshold}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition"
                >

                  <td className="py-4 px-4 font-semibold">
                    {item.threshold}%
                  </td>

                  <td className="py-4 px-4 text-gray-700">
                    {item.tradeCount}
                  </td>

                  <td className="py-4 px-4 text-gray-700">
                    {hasTrades
                      ? `${item.winRate}%`
                      : "—"}
                  </td>

                  <td
                    className={`py-4 px-4 font-semibold ${
                      !hasTrades
                        ? "text-gray-400"
                        : averageReturn > 0
                        ? "text-green-600"
                        : averageReturn < 0
                        ? "text-red-600"
                        : "text-gray-700"
                    }`}
                  >
                    {hasTrades
                      ? formatReturn(averageReturn)
                      : "—"}
                  </td>

                  <td
                    className={`py-4 px-4 font-semibold ${
                      !hasTrades
                        ? "text-gray-400"
                        : totalReturn > 0
                        ? "text-green-600"
                        : totalReturn < 0
                        ? "text-red-600"
                        : "text-gray-700"
                    }`}
                  >
                    {hasTrades
                      ? formatReturn(totalReturn)
                      : "—"}
                  </td>

                </tr>
              );
            })}

          </tbody>

        </table>

      </div>


      {/* CHART */}

      <div className="mt-10">

        <h3 className="font-bold text-lg tracking-tight">
          Average Return by Fall Threshold
        </h3>

        <p className="text-sm text-gray-500 mt-1">
          Thresholds without qualifying trades are
          excluded from the chart.
        </p>

        <div className="mt-5 w-full h-[350px]">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 20,
                left: 10,
                bottom: 20,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e5e7eb"
              />

              <XAxis
                dataKey="threshold"
                tickFormatter={(value) =>
                  `${value}%`
                }
                tick={{
                  fontSize: 13,
                  fill: "#6b7280",
                }}
                tickLine={false}
                axisLine={{
                  stroke: "#d1d5db",
                }}
              />

              <YAxis
                tickFormatter={(value) =>
                  `${value}%`
                }
                tick={{
                  fontSize: 13,
                  fill: "#6b7280",
                }}
                tickLine={false}
                axisLine={false}
                width={55}
              />

              <ReferenceLine
                y={0}
                stroke="#9ca3af"
              />

              <Tooltip
                cursor={{
                  fill: "#f9fafb",
                }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  boxShadow:
                    "0 4px 12px rgba(0,0,0,0.08)",
                }}
                formatter={(value) => {
                  if (
                    value === null ||
                    value === undefined
                  ) {
                    return [
                      "No trades",
                      "Average Return",
                    ];
                  }

                  return [
                    `${Number(value).toFixed(2)}%`,
                    "Average Return",
                  ];
                }}
                labelFormatter={(value) =>
                  `Fall threshold: ${value}%`
                }
              />

              <Bar
                dataKey="chartReturn"
                name="Average Return"
                radius={[6, 6, 0, 0]}
                maxBarSize={65}
                fill="#111827"
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>


      {/* NO TRADE EXPLANATION */}

      {results.some(
        (item) =>
          Number(item.tradeCount) === 0
      ) && (

        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-5">

          <h3 className="font-bold">
            Why is a threshold showing "—"?
          </h3>

          <p className="text-gray-600 mt-2 leading-relaxed">
            A threshold with zero qualifying events
            cannot produce a meaningful win rate or
            return. It is therefore shown as "—"
            instead of treating the absence of trades
            as a 0% return.
          </p>

        </div>

      )}


      {/* INTERPRETATION */}

      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-5">

        <h3 className="font-bold">
          Research interpretation
        </h3>

        <p className="text-gray-600 mt-2 leading-relaxed">
          Comparing multiple thresholds helps determine
          whether the observed result is sensitive to
          the choice of fall threshold.
        </p>

        <p className="text-gray-600 mt-3 leading-relaxed">
          A stronger research conclusion should consider
          several reasonable parameter values rather than
          selecting only the most favourable result.
        </p>

        <p className="text-gray-600 mt-3 leading-relaxed">
          {buildInterpretation(results)}
        </p>

      </div>

    </div>
  );
}


/* =================================
   HELPERS
================================= */

function formatReturn(value) {
  const number = Number(value || 0);

  return `${number > 0 ? "+" : ""}${number.toFixed(2)}%`;
}


function buildInterpretation(results) {
  const validResults =
    results.filter(
      (item) =>
        Number(item.tradeCount) > 0
    );

  const noTradeResults =
    results.filter(
      (item) =>
        Number(item.tradeCount) === 0
    );

  if (validResults.length === 0) {
    return (
      "None of the tested thresholds produced qualifying events in the selected historical period."
    );
  }

  const positive =
    validResults.filter(
      (item) =>
        Number(item.averageReturn) > 0
    );

  const negative =
    validResults.filter(
      (item) =>
        Number(item.averageReturn) < 0
    );

  let text;

  if (
    positive.length > 0 &&
    negative.length > 0
  ) {
    text =
      "The results vary across thresholds: some produced positive average returns while others produced negative average returns.";
  } else if (
    positive.length === validResults.length
  ) {
    text =
      "All thresholds with qualifying trades produced positive average returns in this historical sample.";
  } else {
    text =
      "The thresholds with qualifying trades did not consistently produce positive average returns.";
  }

  if (noTradeResults.length > 0) {
    text += ` ${noTradeResults
      .map(
        (item) => `${item.threshold}%`
      )
      .join(", ")} ${
      noTradeResults.length === 1
        ? "threshold produced"
        : "thresholds produced"
    } no qualifying trades.`;
  }

  return text;
}