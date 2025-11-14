let currentBalance = parseInt(document.getElementById("balance").textContent);
let bets = {}; // symbol -> bet amount
let lastBet = null;
let selectedBanknote = null;

// Banknote selection
document.querySelectorAll(".banknote").forEach(note => {
    note.addEventListener("click", () => {
        selectedBanknote = parseInt(note.dataset.value);
        console.log("Selected banknote:", selectedBanknote);
    });
});

// Symbol click to place bet
document.querySelectorAll(".symbol").forEach(symbolDiv => {
    symbolDiv.addEventListener("click", () => {
        if (!selectedBanknote) return alert("Select a banknote first!");
        const symbol = symbolDiv.dataset.symbol;

        if (currentBalance < selectedBanknote) return alert("Not enough balance!");

        bets[symbol] = (bets[symbol] || 0) + selectedBanknote;
        currentBalance -= selectedBanknote;
        lastBet = {symbol: symbol, amount: selectedBanknote};

        document.getElementById("balance").textContent = currentBalance;
        updateSymbolBetDisplay(symbolDiv, symbol);
    });
});

// Update bet amount label on symbol
function updateSymbolBetDisplay(symbolDiv, symbol) {
    const label = symbolDiv.querySelector(".bet-label");
    label.querySelector(".bet-amount").textContent = bets[symbol];
    label.classList.remove("hidden");
}

// Undo last bet
document.getElementById("undo-btn").addEventListener("click", () => {
    if (!lastBet) return;
    const {symbol, amount} = lastBet;
    bets[symbol] -= amount;
    if (bets[symbol] <= 0) delete bets[symbol];
    currentBalance += amount;
    document.getElementById("balance").textContent = currentBalance;

    const symbolDiv = document.querySelector(`.symbol[data-symbol="${symbol}"]`);
    const label = symbolDiv.querySelector(".bet-label");
    if (bets[symbol]) {
        label.querySelector(".bet-amount").textContent = bets[symbol];
    } else {
        label.classList.add("hidden");
    }
    lastBet = null;
});

// Roll Dice (send all bets)
document.getElementById("roll-btn").addEventListener("click", async () => {
    if (Object.keys(bets).length === 0) return alert("Place at least one bet!");

    const response = await fetch(`/game/result?playerName=${playerName}`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(bets)
    });

    const data = await response.json();
    currentBalance = data.balance;
    document.getElementById("balance").textContent = currentBalance;

    // Update Dice Result
    const diceContainer = document.getElementById("dice-result");
    diceContainer.innerHTML = "";
    data.diceResult.forEach(symbol => {
        const img = document.createElement("img");
        img.src = `/images/symbol_${symbol.toLowerCase()}.png`;
        img.alt = symbol;
        img.classList.add("w-12", "h-12");
        diceContainer.appendChild(img);
    });

    // Update leaderboard
    const leaderboard = document.getElementById("leaderboard");
    leaderboard.innerHTML = "";
    data.leaderboard.forEach(p => {
        const li = document.createElement("li");
        li.textContent = `${p.name} - ${p.balance} riel`;
        leaderboard.appendChild(li);
    });

    // Clear bets
    bets = {};
    lastBet = null;
    document.querySelectorAll(".bet-label").forEach(label => label.classList.add("hidden"));
});
