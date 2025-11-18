// file: src/main/resources/static/js/game.js

document.addEventListener("DOMContentLoaded", () => {
  console.log("Kla Klouk game.js loaded");

  /* ------------------- DOM ELEMENTS ------------------- */

  const balanceEl = document.getElementById("balanceAmount");
  const highestBalanceEl = document.getElementById("highestBalance");

  const betCellEls = Array.from(document.querySelectorAll(".js-bet-cell"));
  const chipEls = Array.from(document.querySelectorAll(".js-chip"));

  const undoButton = document.getElementById("undoButton");
  const rollButton = document.getElementById("rollButton");

  const dieEls = Array.from(document.querySelectorAll(".js-die"));
  const diceContainer = document.getElementById("diceContainer");
  const statusMessageEl = document.getElementById("statusMessage");

  // scoreboard bits inside Player card
  const totalWinsEl = document.getElementById("totalWins");
  const totalLossesEl = document.getElementById("totalLosses");
  const winRateEl = document.getElementById("winRate");
  const winRateBarEl = document.getElementById("winRateBar");

  /* ------------------- STATE ------------------- */

  let balance = parseInt(balanceEl?.dataset.balance || "0", 10) || 0;
  let highestBalance =
    parseInt(highestBalanceEl?.dataset.highest || String(balance), 10) ||
    balance;

  let selectedChip = null; // currently selected wager (number or null)
  const bets = {}; // { SYMBOL: amount }
  const betHistory = []; // [{symbol, amount}, ...]

  const symbolEmojiMap = {
    TIGER: "🐯",
    GOURD: "🍲",
    ROOSTER: "🐔",
    FISH: "🐟",
    CRAB: "🦀",
    SHRIMP: "🦐"
  };

  /* ------------------- UTIL FUNCTIONS ------------------- */

  function formatRiel(value) {
    return value.toLocaleString("en-US") + " riel";
  }

  function showStatus(message, type = "info") {
    if (!statusMessageEl) return;

    let colorClass = "text-slate-200";
    if (type === "error") colorClass = "text-red-300";
    if (type === "success") colorClass = "text-emerald-300";
    if (type === "info") colorClass = "text-sky-300";

    statusMessageEl.className = "mt-1 text-[11px] md:text-xs " + colorClass;
    statusMessageEl.textContent = message;
  }

  function updateBalanceUI() {
    if (!balanceEl) return;
    balanceEl.dataset.balance = String(balance);
    balanceEl.textContent = formatRiel(balance);
  }

  function updateHighestBalanceUI() {
    if (!highestBalanceEl) return;
    highestBalanceEl.dataset.highest = String(highestBalance);
    highestBalanceEl.textContent = formatRiel(highestBalance);
  }

  function updateBetAmountUI(symbol) {
    const cell = betCellEls.find((el) => el.dataset.symbol === symbol);
    if (!cell) return;

    const amountSpan = cell.querySelector(".js-bet-amount");
    if (!amountSpan) return;

    const amount = bets[symbol] || 0;
    amountSpan.textContent = formatRiel(amount);
  }

  function clearAllBetsUI() {
    betCellEls.forEach((cell) => {
      const symbol = cell.dataset.symbol;
      if (!symbol) return;
      bets[symbol] = 0;
      updateBetAmountUI(symbol);
    });
  }

  function resetBetHighlights() {
    betCellEls.forEach((el) =>
      el.classList.remove("ring-2", "ring-emerald-400")
    );
  }

  function setSelectedChipUI(chipEl) {
    chipEls.forEach((el) =>
      el.classList.remove(
        "border-emerald-500",
        "text-emerald-200",
        "bg-emerald-500/10"
      )
    );
    if (chipEl) {
      chipEl.classList.add(
        "border-emerald-500",
        "text-emerald-200",
        "bg-emerald-500/10"
      );
    }
  }

  function setDiceRolling(isRolling) {
    if (!diceContainer) return;
    if (isRolling) diceContainer.classList.add("animate-pulse");
    else diceContainer.classList.remove("animate-pulse");
  }

  function updateDiceUI(diceResultArray) {
    // diceResultArray like ["TIGER","GOURD","ROOSTER"]
    for (let i = 0; i < dieEls.length; i++) {
      const dieEl = dieEls[i];
      const symbol = diceResultArray[i] || "";
      const emoji = symbolEmojiMap[symbol] || "❓";
      dieEl.textContent = emoji;
      dieEl.setAttribute("data-symbol", symbol);
      dieEl.setAttribute("title", symbol);
    }
  }

  function getTotalBet() {
    return Object.values(bets).reduce((sum, v) => sum + (v || 0), 0);
  }

  function updateScoreboard(data) {
    // total wins
    if (typeof data.totalWins === "number" && totalWinsEl) {
      totalWinsEl.textContent = data.totalWins;
    }
    // total losses
    if (typeof data.totalLosses === "number" && totalLossesEl) {
      totalLossesEl.textContent = data.totalLosses;
    }
    // win rate + bar
    if (typeof data.winRate === "number" && winRateEl) {
      const clamped = Math.max(0, Math.min(100, data.winRate));
      winRateEl.textContent = clamped.toFixed(1) + "%";
      if (winRateBarEl) {
        winRateBarEl.style.width = clamped + "%";
      }
    }
  }

  /* ------------------- EVENT HANDLERS ------------------- */

  // chip selection (wager notes on the left)
  chipEls.forEach((chipEl) => {
    chipEl.addEventListener("click", () => {
      const amount = parseInt(chipEl.dataset.amount || "0", 10);
      if (!amount || isNaN(amount)) {
        showStatus("Invalid chip value.", "error");
        return;
      }
      selectedChip = amount;
      setSelectedChipUI(chipEl);
      showStatus("Selected wager: " + formatRiel(amount), "info");
    });
  });

  // placing bets on mat tiles
  betCellEls.forEach((cellEl) => {
    const symbol = cellEl.dataset.symbol;
    if (!symbol) return;

    bets[symbol] = bets[symbol] || 0;
    updateBetAmountUI(symbol);

    cellEl.addEventListener("click", () => {
      if (selectedChip == null) {
        showStatus("Choose a wager note first.", "error");
        resetBetHighlights();
        cellEl.classList.add("ring-2", "ring-emerald-400");
        return;
      }

      if (balance < selectedChip) {
        showStatus("Not enough balance for that bet.", "error");
        return;
      }

      balance -= selectedChip;
      bets[symbol] += selectedChip;
      betHistory.push({ symbol, amount: selectedChip });

      updateBalanceUI();
      updateBetAmountUI(symbol);

      resetBetHighlights();
      cellEl.classList.add("ring-2", "ring-emerald-400");

      const totalBet = getTotalBet();
      showStatus(
        `Bet ${formatRiel(selectedChip)} on ${symbol}. Total bet: ${formatRiel(
          totalBet
        )}.`,
        "success"
      );
    });
  });

  // undo last bet
  if (undoButton) {
    undoButton.addEventListener("click", () => {
      if (betHistory.length === 0) {
        showStatus("No bets to undo.", "error");
        return;
      }

      const last = betHistory.pop(); // {symbol, amount}
      const { symbol, amount } = last;

      bets[symbol] = Math.max(0, (bets[symbol] || 0) - amount);
      balance += amount;

      updateBalanceUI();
      updateBetAmountUI(symbol);

      showStatus(
        `Undid last bet of ${formatRiel(amount)} on ${symbol}.`,
        "info"
      );
    });
  }

  // roll dice (send bets to backend)
  if (rollButton) {
    rollButton.addEventListener("click", async () => {
      const totalBet = getTotalBet();
      if (totalBet === 0) {
        showStatus("Place at least one bet before rolling.", "error");
        return;
      }

      // 🔥 NEW: build object with ONLY bets > 0 (avoid 0 for @Positive)
      const filteredBets = {};
      for (const [symbol, amount] of Object.entries(bets)) {
        if (amount > 0) {
          filteredBets[symbol] = amount;
        }
      }

      // Safety: if somehow all were 0, stop.
      if (Object.keys(filteredBets).length === 0) {
        showStatus("Place at least one bet before rolling.", "error");
        return;
      }

      rollButton.disabled = true;
      if (undoButton) undoButton.disabled = true;
      setDiceRolling(true);
      showStatus("Rolling dice…", "info");

      try {
        const payload = { bets: filteredBets };

        const response = await fetch("/game/result", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
            // For CSRF later:
            // "X-CSRF-TOKEN": document.querySelector('meta[name="_csrf"]').content
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error("Server error: " + response.status);
        }

        const data = await response.json();
        console.log("Server result:", data);

        if (data.error) {
          throw new Error(data.error);
        }

        // balance
        if (typeof data.balance === "number") {
          balance = data.balance;
          updateBalanceUI();
        }

        // highest balance
        if (typeof data["highest balance"] === "number") {
          highestBalance = data["highest balance"];
          updateHighestBalanceUI();
        }

        // dice results
        if (Array.isArray(data.diceResult)) {
          updateDiceUI(data.diceResult);
        }

        // scoreboard (wins, losses, winRate)
        updateScoreboard(data);

        // clear bets for new round
        Object.keys(bets).forEach((symbol) => (bets[symbol] = 0));
        betHistory.length = 0;
        clearAllBetsUI();

        const resultText = Array.isArray(data.diceResult)
          ? data.diceResult.join(" · ")
          : "Unknown";

        showStatus(
          `Dice rolled: ${resultText}. New balance: ${formatRiel(balance)}.`,
          "success"
        );
      } catch (err) {
        console.error(err);
        showStatus(err.message || "Failed to roll dice.", "error");
      } finally {
        rollButton.disabled = false;
        if (undoButton) undoButton.disabled = false;
        setDiceRolling(false);
      }
    });
  }

  /* ------------------- INITIAL RENDER ------------------- */

  updateBalanceUI();
  updateHighestBalanceUI();
  clearAllBetsUI();
  showStatus(
    "Select a wager note, tap a tile on the mat, then press Roll Dice.",
    "info"
  );
});
