// game.js

document.addEventListener("DOMContentLoaded", () => {
    const symbols = document.querySelectorAll(".symbol");
    const notes = document.querySelectorAll(".note");
    const balanceEl = document.getElementById("balance");
    const rollBtn = document.getElementById("rollDice");
    const resetBtn = document.getElementById("resetBet");
    const diceResultsEl = document.getElementById("diceResults");
    const winningsEl = document.getElementById("winnings");

    let selectedNote = 0;
    let pendingBets = {}; // mirror session pendingBets

    // Select note value
    notes.forEach(note => {
        note.addEventListener("click", () => {
            selectedNote = parseInt(note.dataset.value);
            notes.forEach(n => n.classList.remove("selected"));
            note.classList.add("selected");
        });
    });

    // Place bet on symbol
    symbols.forEach(symbol => {
        symbol.addEventListener("click", () => {
            if (selectedNote <= 0) {
                alert("Select a note first!");
                return;
            }

            const symName = symbol.dataset.symbol;

            fetch("/placeBet", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `symbol=${symName}&amount=${selectedNote}`
            })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                    return;
                }

                balanceEl.textContent = data.newBalance;
                pendingBets = data.pendingBets;

                // Visual stacking
                let stackEl = symbol.querySelector(".stack");
                if (!stackEl) {
                    stackEl = document.createElement("div");
                    stackEl.classList.add("stack");
                    symbol.appendChild(stackEl);
                }
                const noteDiv = document.createElement("div");
                noteDiv.textContent = `៛${selectedNote}`;
                noteDiv.classList.add("stacked-note");
                stackEl.appendChild(noteDiv);
            })
            .catch(err => console.error(err));
        });
    });

    // Undo last bet
    resetBtn.addEventListener("click", () => {
        fetch("/undoLastBet", { method: "POST" })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }

            balanceEl.textContent = data.newBalance;
            pendingBets = data.pendingBets;

            // Remove last stacked note visually
            symbols.forEach(symbol => {
                const stackEl = symbol.querySelector(".stack");
                if (stackEl && stackEl.lastChild) {
                    stackEl.removeChild(stackEl.lastChild);
                }
            });
        })
        .catch(err => console.error(err));
    });

    // Roll dice
    rollBtn.addEventListener("click", () => {
        fetch("/rollDice", { method: "POST" })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }

            balanceEl.textContent = data.newBalance;
            pendingBets = {};

            // Clear visual stacks
            symbols.forEach(symbol => {
                const stackEl = symbol.querySelector(".stack");
                if (stackEl) stackEl.remove();
            });

            // Show dice results
            diceResultsEl.textContent = `Dice Results: ${data.diceResults.join(", ")}`;

            // Show round winnings
            let roundMsg = [];
            for (const sym in data.roundResults) {
                const amt = data.roundResults[sym];
                if (amt > 0) roundMsg.push(`🎉 ${sym}: +${amt}៛`);
                else roundMsg.push(`❌ ${sym}: ${amt}៛`);
            }
            winningsEl.innerHTML = roundMsg.join("<br>");
        })
        .catch(err => console.error(err));
    });
});
