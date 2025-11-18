//(() => {
//    const state = {
//        selectedNote: 0,
//        bets: new Map(),
//        betHistory: [],
//        balance: 0
//    };
//
//    const dom = {
//        balance: document.querySelector("#balance"),
//        banknotes: document.querySelectorAll("[data-banknote]"),
//        symbols: document.querySelectorAll("[data-symbol]"),
//        rollBtn: document.querySelector("#roll-btn"),
//        undoBtn: document.querySelector("#undo-btn"),
//        toast: document.querySelector("#toast"),
//        diceResult: document.querySelector("#dice-result"),
//        betLabels: document.querySelectorAll("[data-bet-label]")
//    };
//
//    const showToast = (msg, type = "error") => {
//        dom.toast.textContent = msg;
//        dom.toast.className = `toast toast-${type}`;
//        dom.toast.hidden = false;
//        setTimeout(() => (dom.toast.hidden = true), 2500);
//    };
//
//    const formatCurrency = (n) => n.toLocaleString("en-US");
//
//    const syncBalance = (value) => {
//        state.balance = value;
//        dom.balance.textContent = formatCurrency(value);
//    };
//
//    const updateBetLabels = () => {
//        dom.betLabels.forEach((label) => {
//            const symbol = label.dataset.betLabel;
//            const amount = state.bets.get(symbol) || 0;
//            label.textContent = amount > 0 ? formatCurrency(amount) : "";
//        });
//    };
//
//    const selectBanknote = (value) => {
//        state.selectedNote = value;
//        dom.banknotes.forEach((btn) =>
//            btn.classList.toggle("active", Number(btn.dataset.banknote) === value)
//        );
//        showToast(`Selected ${formatCurrency(value)}`, "info");
//    };
//
//    const placeBet = (symbol) => {
//        if (!state.selectedNote) {
//            return showToast("Select a banknote first.");
//        }
//        if (state.selectedNote > state.balance) {
//            return showToast("Not enough balance for that banknote.");
//        }
//        const current = state.bets.get(symbol) || 0;
//        const newAmount = current + state.selectedNote;
//        const totalBet = [...state.bets.values()].reduce((sum, amt) => sum + amt, 0) + state.selectedNote;
//
//        if (totalBet > state.balance) {
//            return showToast("Total bet exceeds available balance.");
//        }
//
//        state.bets.set(symbol, newAmount);
//        state.betHistory.push({ symbol, amount: state.selectedNote });
//        updateBetLabels();
//    };
//
//    const undoBet = () => {
//        const last = state.betHistory.pop();
//        if (!last) {
//            return showToast("No bets to undo.");
//        }
//        const current = state.bets.get(last.symbol) || 0;
//        const updated = current - last.amount;
//        if (updated <= 0) {
//            state.bets.delete(last.symbol);
//        } else {
//            state.bets.set(last.symbol, updated);
//        }
//        updateBetLabels();
//    };
//
//    const rollDice = async () => {
//        if (!state.betHistory.length) {
//            return showToast("Place at least one bet before rolling.");
//        }
//        try {
//            dom.rollBtn.disabled = true;
//            const payload = {
//                bets: Object.fromEntries(state.bets)
//            };
//            const response = await fetch("/game/result", {
//                method: "POST",
//                headers: { "Content-Type": "application/json" },
//                body: JSON.stringify(payload)
//            });
//
//            if (!response.ok) {
//                const error = await response.json().catch(() => ({ error: "Unknown error" }));
//                throw new Error(error.error || "Unable to roll dice.");
//            }
//
//            const data = await response.json();
//            const { diceResult = [], balance, error } = data;
//            if (error) throw new Error(error);
//
//            dom.diceResult.textContent = diceResult.join(" - ");
//            syncBalance(balance);
//            state.bets.clear();
//            state.betHistory = [];
//            updateBetLabels();
//            showToast("Roll complete!", "success");
//        } catch (err) {
//            showToast(err.message || "Failed to roll dice.");
//        } finally {
//            dom.rollBtn.disabled = false;
//        }
//    };
//
//    dom.banknotes.forEach((btn) =>
//        btn.addEventListener("click", () => selectBanknote(Number(btn.dataset.banknote)))
//    );
//
//    dom.symbols.forEach((spot) =>
//        spot.addEventListener("click", () => placeBet(spot.dataset.symbol))
//    );
//
//    dom.undoBtn.addEventListener("click", undoBet);
//    dom.rollBtn.addEventListener("click", rollDice);
//
//    // Initial balance from data attribute or session-backed endpoint
//    syncBalance(Number(dom.balance.dataset.value || 0));
//})();
