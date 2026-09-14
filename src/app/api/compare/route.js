import { NextResponse } from "next/server";

const ALLOWED_ENTRIES = [
  "same_close",
  "next_open",
  "next_close",
];

export async function POST(request) {
  try {
    const {
      holdingPeriod,
      testPeriod,
      thresholds,
      entryTiming,
    } = await request.json();

    const holding = Number(holdingPeriod);
    const years = Number(testPeriod);

    const selectedThresholds =
      Array.isArray(thresholds) && thresholds.length > 0
        ? thresholds.map(Number).filter(
            (value) =>
              Number.isFinite(value) &&
              value > 0
          )
        : [1, 2, 3, 5];

    const entry =
      entryTiming || "next_open";

    // --------------------------------
    // Validate
    // --------------------------------

    if (
      !Number.isFinite(holding) ||
      holding <= 0 ||
      !Number.isInteger(holding)
    ) {
      return NextResponse.json(
        {
          error:
            "Holding period must be a positive whole number.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(years) ||
      years <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Test period must be greater than 0.",
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_ENTRIES.includes(entry)) {
      return NextResponse.json(
        {
          error: "Invalid entry timing.",
        },
        { status: 400 }
      );
    }

    if (selectedThresholds.length === 0) {
      return NextResponse.json(
        {
          error:
            "At least one valid threshold is required.",
        },
        { status: 400 }
      );
    }

    // --------------------------------
    // Dates
    // --------------------------------

    const now = new Date();

    const testStartDate = new Date(now);

    testStartDate.setFullYear(
      testStartDate.getFullYear() - years
    );

    const fetchStartDate =
      new Date(testStartDate);

    fetchStartDate.setDate(
      fetchStartDate.getDate() -
        holding -
        15
    );

    const period1 = Math.floor(
      fetchStartDate.getTime() / 1000
    );

    const period2 = Math.floor(
      now.getTime() / 1000
    );

    // --------------------------------
    // Fetch NIFTY data ONCE
    // --------------------------------

    const yahooUrl =
      `https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEI` +
      `?period1=${period1}` +
      `&period2=${period2}` +
      `&interval=1d` +
      `&events=history`;

    const response = await fetch(
      yahooUrl,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        `Historical data request failed: ${response.status}`
      );
    }

    const yahooData =
      await response.json();

    const chart =
      yahooData?.chart?.result?.[0];

    if (!chart) {
      throw new Error(
        "No NIFTY historical data was returned."
      );
    }

    const timestamps =
      chart.timestamp || [];

    const quote =
      chart.indicators?.quote?.[0];

    if (!quote) {
      throw new Error(
        "NIFTY price data is unavailable."
      );
    }

    const opens =
      quote.open || [];

    const lows =
      quote.low || [];

    const closes =
      quote.close || [];

    // --------------------------------
    // Clean dataset
    // --------------------------------

    const marketData = [];

    for (
      let i = 0;
      i < timestamps.length;
      i++
    ) {
      const open = opens[i];
      const low = lows[i];
      const close = closes[i];

      if (
        !Number.isFinite(open) ||
        !Number.isFinite(low) ||
        !Number.isFinite(close)
      ) {
        continue;
      }

      const date = new Date(
        timestamps[i] * 1000
      );

      marketData.push({
        date:
          date
            .toISOString()
            .split("T")[0],

        open,
        low,
        close,

        timestamp:
          timestamps[i] * 1000,
      });
    }

    if (
      marketData.length <
      holding + 2
    ) {
      throw new Error(
        "Not enough historical NIFTY data."
      );
    }

    // --------------------------------
    // Same dataset for every threshold
    // --------------------------------

    const results =
      selectedThresholds.map(
        (threshold) =>
          runExperiment(
            marketData,
            threshold,
            holding,
            years,
            testStartDate,
            entry
          )
      );

    return NextResponse.json({
      results,

      dataType:
        "historical",

      market:
        "NIFTY 50",

      dataSource:
        "Yahoo Finance historical market data",

      fallDefinition:
        "Intraday low compared with previous trading day's close",

      entryTiming:
        entry,

      holdingPeriod:
        holding,

      testPeriod:
        years,
    });
  } catch (error) {
    console.error(
      "Comparison error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error.message ||
          "Comparison failed.",
      },
      { status: 500 }
    );
  }
}


// =====================================
// RUN ONE THRESHOLD
// =====================================

function runExperiment(
  marketData,
  threshold,
  holding,
  years,
  testStartDate,
  entry
) {
  const trades = [];

  const testStartTime =
    testStartDate.getTime();

  for (
    let i = 1;
    i < marketData.length;
    i++
  ) {
    const previousDay =
      marketData[i - 1];

    const fallDay =
      marketData[i];

    // Only use events inside
    // requested historical period.
    if (
      fallDay.timestamp <
      testStartTime
    ) {
      continue;
    }

    // --------------------------------
    // Fall calculation
    // --------------------------------

    const intradayFall =
      (
        (
          fallDay.low -
          previousDay.close
        ) /
        previousDay.close
      ) * 100;

    if (
      intradayFall > -threshold
    ) {
      continue;
    }

    // --------------------------------
    // Entry
    // --------------------------------

    let entryIndex;

    if (
      entry === "same_close"
    ) {
      entryIndex = i;
    } else {
      entryIndex = i + 1;
    }

    if (
      entryIndex >=
      marketData.length
    ) {
      continue;
    }

    // --------------------------------
    // Exit
    // --------------------------------

    const exitIndex =
      entryIndex + holding;

    if (
      exitIndex >=
      marketData.length
    ) {
      continue;
    }

    const entryDay =
      marketData[entryIndex];

    const exitDay =
      marketData[exitIndex];

    // --------------------------------
    // Entry price
    // --------------------------------

    let entryPrice;

    if (
      entry === "same_close"
    ) {
      entryPrice =
        entryDay.close;
    } else if (
      entry === "next_close"
    ) {
      entryPrice =
        entryDay.close;
    } else {
      entryPrice =
        entryDay.open;
    }

    const exitPrice =
      exitDay.close;

    // --------------------------------
    // Return
    // --------------------------------

    const tradeReturn =
      (
        (
          exitPrice -
          entryPrice
        ) /
        entryPrice
      ) * 100;

    trades.push(
      Number(
        tradeReturn.toFixed(2)
      )
    );
  }

  // --------------------------------
  // Statistics
  // --------------------------------

  const tradeCount =
    trades.length;

  const winningTrades =
    trades.filter(
      (value) => value > 0
    ).length;

  const totalReturn =
    trades.reduce(
      (sum, value) =>
        sum + value,
      0
    );

  const averageReturn =
    tradeCount > 0
      ? totalReturn /
        tradeCount
      : 0;

  const winRate =
    tradeCount > 0
      ? (
          winningTrades /
          tradeCount
        ) * 100
      : 0;

  return {
    threshold,

    tradeCount,

    winningTrades,

    losingTrades:
      tradeCount -
      winningTrades,

    winRate:
      Number(
        winRate.toFixed(2)
      ),

    averageReturn:
      Number(
        averageReturn.toFixed(2)
      ),

    totalReturn:
      Number(
        totalReturn.toFixed(2)
      ),

    testPeriod: years,

    holdingPeriod: holding,

    entryTiming: entry,
  };
}