import { NextResponse } from "next/server";

const ALLOWED_ENTRIES = [
  "same_close",
  "next_open",
  "next_close",
];

export async function POST(request) {
  try {
    const {
      fallPercentage,
      holdingPeriod,
      testPeriod,
      entryTiming,
    } = await request.json();

    const fall = Number(fallPercentage);
    const holding = Number(holdingPeriod);
    const years = Number(testPeriod);
    const entry = entryTiming || "next_open";

    // --------------------------------
    // Validate
    // --------------------------------

    if (!Number.isFinite(fall) || fall <= 0) {
      return NextResponse.json(
        { error: "Fall threshold must be greater than 0." },
        { status: 400 }
      );
    }

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
          error: "Test period must be greater than 0.",
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

    // --------------------------------
    // Dates
    // --------------------------------

    const now = new Date();

    const testStartDate = new Date(now);

    testStartDate.setFullYear(
      testStartDate.getFullYear() - years
    );

    /*
      Extra history is fetched so that:
      1. Previous trading day's close is available.
      2. Trades near the beginning/end of
         the requested period can be evaluated.
    */

    const fetchStartDate = new Date(testStartDate);

    fetchStartDate.setDate(
      fetchStartDate.getDate() - holding - 15
    );

    const period1 = Math.floor(
      fetchStartDate.getTime() / 1000
    );

    const period2 = Math.floor(
      now.getTime() / 1000
    );

    // --------------------------------
    // Yahoo Finance
    // --------------------------------

    const yahooUrl =
      `https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEI` +
      `?period1=${period1}` +
      `&period2=${period2}` +
      `&interval=1d` +
      `&events=history`;

    const response = await fetch(yahooUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `Historical data request failed: ${response.status}`
      );
    }

    const yahooData = await response.json();

    const chart = yahooData?.chart?.result?.[0];

    if (!chart) {
      throw new Error(
        "No NIFTY historical data was returned."
      );
    }

    const timestamps = chart.timestamp || [];

    const quote = chart.indicators?.quote?.[0];

    if (!quote) {
      throw new Error(
        "NIFTY price data is unavailable."
      );
    }

    const opens = quote.open || [];
    const highs = quote.high || [];
    const lows = quote.low || [];
    const closes = quote.close || [];

    // --------------------------------
    // Clean dataset
    // --------------------------------

    const marketData = [];

    for (let i = 0; i < timestamps.length; i++) {
      const open = opens[i];
      const high = highs[i];
      const low = lows[i];
      const close = closes[i];

      if (
        !Number.isFinite(open) ||
        !Number.isFinite(high) ||
        !Number.isFinite(low) ||
        !Number.isFinite(close)
      ) {
        continue;
      }

      const date = new Date(
        timestamps[i] * 1000
      );

      marketData.push({
        date: date.toISOString().split("T")[0],
        open,
        high,
        low,
        close,
        timestamp: timestamps[i] * 1000,
      });
    }

    if (marketData.length < holding + 2) {
      throw new Error(
        "Not enough historical NIFTY data."
      );
    }

    // --------------------------------
    // Run experiment
    // --------------------------------

    const testStartTime =
      testStartDate.getTime();

    const trades = [];

    for (let i = 1; i < marketData.length; i++) {
      const previousDay = marketData[i - 1];
      const fallDay = marketData[i];

      // Only consider events in requested period.
      if (fallDay.timestamp < testStartTime) {
        continue;
      }

      // --------------------------------
      // Fall definition
      // --------------------------------

      const intradayFall =
        ((fallDay.low - previousDay.close) /
          previousDay.close) *
        100;

      if (intradayFall > -fall) {
        continue;
      }

      // --------------------------------
      // Entry
      // --------------------------------

      let entryIndex;

      if (entry === "same_close") {
        entryIndex = i;
      } else {
        entryIndex = i + 1;
      }

      if (entryIndex >= marketData.length) {
        continue;
      }

      // --------------------------------
      // Exit
      // --------------------------------

      const exitIndex =
        entryIndex + holding;

      if (exitIndex >= marketData.length) {
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

      if (entry === "same_close") {
        entryPrice = entryDay.close;
      } else if (entry === "next_close") {
        entryPrice = entryDay.close;
      } else {
        entryPrice = entryDay.open;
      }

      const exitPrice = exitDay.close;

      // --------------------------------
      // Return
      // --------------------------------

      const tradeReturn =
        ((exitPrice - entryPrice) /
          entryPrice) *
        100;

      trades.push({
        fallDate: fallDay.date,
        entryDate: entryDay.date,
        exitDate: exitDay.date,

        fall: Number(
          intradayFall.toFixed(2)
        ),

        previousClose: Number(
          previousDay.close.toFixed(2)
        ),

        entryPrice: Number(
          entryPrice.toFixed(2)
        ),

        exitPrice: Number(
          exitPrice.toFixed(2)
        ),

        return: Number(
          tradeReturn.toFixed(2)
        ),

        holdingPeriod: holding,
        entryTiming: entry,
      });
    }

    // --------------------------------
    // Statistics
    // --------------------------------

    const tradeCount = trades.length;

    const winningTrades = trades.filter(
      (trade) => trade.return > 0
    ).length;

    const losingTrades = trades.filter(
      (trade) => trade.return <= 0
    ).length;

    const totalReturn = trades.reduce(
      (sum, trade) => sum + trade.return,
      0
    );

    const averageReturn =
      tradeCount > 0
        ? totalReturn / tradeCount
        : 0;

    const winRate =
      tradeCount > 0
        ? (winningTrades / tradeCount) * 100
        : 0;

    const bestTrade =
      tradeCount > 0
        ? Math.max(
            ...trades.map(
              (trade) => trade.return
            )
          )
        : 0;

    const worstTrade =
      tradeCount > 0
        ? Math.min(
            ...trades.map(
              (trade) => trade.return
            )
          )
        : 0;

    // --------------------------------
    // Response
    // --------------------------------

    return NextResponse.json({
      parameters: {
        fallPercentage: fall,
        holdingPeriod: holding,
        testPeriod: years,
        entryTiming: entry,
      },

      tradeCount,
      winningTrades,
      losingTrades,

      winRate: Number(
        winRate.toFixed(2)
      ),

      averageReturn: Number(
        averageReturn.toFixed(2)
      ),

      totalReturn: Number(
        totalReturn.toFixed(2)
      ),

      bestTrade: Number(
        bestTrade.toFixed(2)
      ),

      worstTrade: Number(
        worstTrade.toFixed(2)
      ),

      trades,

      dataType: "historical",

      market: "NIFTY 50",

      dataSource:
        "Yahoo Finance historical market data",

      fallDefinition:
        "Intraday low compared with previous trading day's close",

      costAssumptions:
        "Transaction costs, taxes, slippage and market impact are not included.",

      message:
        tradeCount === 0
          ? "No qualifying historical events were found for the selected parameters."
          : `${tradeCount} qualifying historical event(s) found.`,
    });
  } catch (error) {
    console.error(
      "Backtest error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error.message ||
          "Backtest failed.",
      },
      { status: 500 }
    );
  }
}