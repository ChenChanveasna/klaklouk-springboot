document.addEventListener('DOMContentLoaded', () => {

    // --- Game State ---
    let balance = typeof currentBalance === 'number' ? currentBalance : 0;
    let selectedChipValue = 0;
    let isRolling = false;

    const symbols = ['TIGER', 'GOURD', 'ROOSTER', 'SHRIMP', 'CRAB', 'FISH'];

    let bets = {
        TIGER: 0,
        GOURD: 0,
        ROOSTER: 0,
        SHRIMP: 0,
        CRAB: 0,
        FISH: 0
    };

    let betHistory = [];

    // --- DOM Elements ---
    const balanceDisplay   = document.getElementById('balance');
    const balanceChangeEl  = document.getElementById('balance-change');

    const banknoteWrappers = document.querySelectorAll('.banknote-wrapper');
    const symbolDivs       = document.querySelectorAll('.symbol');
    const rollBtn          = document.getElementById('roll-btn');
    const undoBtn          = document.getElementById('undo-btn');
    const diceImages       = [
        document.getElementById('dice-1'),
        document.getElementById('dice-2'),
        document.getElementById('dice-3')
    ];

    // Scoreboard elements
    const totalWinsEl      = document.getElementById('totalWins');
    const totalLossesEl    = document.getElementById('totalLosses');
    const winRateEl        = document.getElementById('winRate');
    const winRateBarEl     = document.getElementById('winRateBar');
    const highestBalanceEl = document.getElementById('highestBalance');

    // Reset modal elements
    const resetModal    = document.getElementById('reset-modal');
    const resetGameBtn  = document.getElementById('reset-game-btn');
    const resetLoginBtn = document.getElementById('reset-login-btn');

    // --- Helper: Modal ---
    function showResetModal() {
        if (resetModal) resetModal.classList.remove('hidden');
    }

    function hideResetModal() {
        if (resetModal) resetModal.classList.add('hidden');
    }

    // --- Helper: UI updates ---
    function updateUI() {
        // main balance (always reflects current balance state)
        if (balanceDisplay) {
            balanceDisplay.innerText = balance.toLocaleString();
        }

        // bet labels on symbols
        for (const [symbol, amount] of Object.entries(bets)) {
            const label = document.getElementById(`bet-label-${symbol}`);
            if (!label) continue;

            const amountSpan = label.querySelector('.bet-amount');
            if (amountSpan) {
                amountSpan.innerText = amount.toLocaleString();
            }

            if (amount > 0) {
                label.style.opacity = '1';
                label.style.transform = 'scale(1)';
            } else {
                label.style.opacity = '0';
                label.style.transform = 'scale(0.8)';
            }
        }
    }

    function updateScoreboardFromData(data) {
        if (!data || typeof data !== 'object') return;

        if (typeof data.totalWins === 'number' && totalWinsEl) {
            totalWinsEl.innerText = data.totalWins;
        }
        if (typeof data.totalLosses === 'number' && totalLossesEl) {
            totalLossesEl.innerText = data.totalLosses;
        }
        if (typeof data.winRate === 'number' && winRateEl) {
            const clamped = Math.max(0, Math.min(100, data.winRate));
            winRateEl.innerText = clamped.toFixed(1) + '%';
            if (winRateBarEl) {
                winRateBarEl.style.width = clamped + '%';
            }
        }

        // support both "highest balance" and "highestBalance" keys
        let highest = null;
        if (typeof data['highest balance'] === 'number') {
            highest = data['highest balance'];
        } else if (typeof data.highestBalance === 'number') {
            highest = data.highestBalance;
        }

        if (highest !== null && highestBalanceEl) {
            highestBalanceEl.innerText = highest.toLocaleString() + ' riel';
        }
    }

    function updateDiceImagesFromResult(diceResultArray) {
        if (!Array.isArray(diceResultArray)) return;
        diceImages.forEach((dice, index) => {
            const sym = diceResultArray[index];
            if (!sym) return;
            dice.src = `/images/symbol_${sym.toLowerCase()}.png`;
        });
    }

    // Show +X / -X under balance
    function showBalanceChange(delta) {
        if (!balanceChangeEl) return;

        // If no change, just hide (but keep last text to preserve height)
        if (delta === 0) {
            balanceChangeEl.style.opacity = '0';
            return;
        }

        const absVal = Math.abs(delta).toLocaleString();

        if (delta > 0) {
            balanceChangeEl.classList.remove('text-rose-400');
            balanceChangeEl.classList.add('text-emerald-400');
            balanceChangeEl.innerText = `+${absVal}`;
        } else {
            balanceChangeEl.classList.remove('text-emerald-400');
            balanceChangeEl.classList.add('text-rose-400');
            balanceChangeEl.innerText = `-${absVal}`;
        }

        balanceChangeEl.style.opacity = '1';

        // fade out after a bit, but do NOT clear the text
        setTimeout(() => {
            balanceChangeEl.style.opacity = '0';
        }, 2500);
    }

    // --- 1. Banknote selection ---
    banknoteWrappers.forEach(wrapper => {
        wrapper.addEventListener('click', () => {
            if (isRolling) return;

            banknoteWrappers.forEach(w => w.classList.remove('selected'));
            wrapper.classList.add('selected');

            selectedChipValue = parseInt(wrapper.getAttribute('data-value'), 10) || 0;
            console.log('Chip selected:', selectedChipValue);
        });
    });

    // --- 2. Place bets ---
    symbolDivs.forEach(div => {
        div.addEventListener('click', () => {
            if (isRolling) return;

            if (selectedChipValue === 0) {
                alert('Please select a wager amount from the left first!');
                return;
            }
            if (balance < selectedChipValue) {
                alert('Not enough balance!');
                return;
            }

            const symbol = div.getAttribute('data-symbol');
            if (!symbol) return;

            const before = balance;

            // deduct & record
            balance -= selectedChipValue;
            bets[symbol] += selectedChipValue;
            betHistory.push({ symbol, amount: selectedChipValue });

            const delta = balance - before; // negative number
            showBalanceChange(delta);       // immediate "-X"
            updateUI();

            div.classList.add('scale-[1.02]', 'brightness-110');
            setTimeout(() => div.classList.remove('scale-[1.02]', 'brightness-110'), 100);
        });
    });

    // --- 3. Undo ---
    undoBtn.addEventListener('click', () => {
        if (isRolling || betHistory.length === 0) return;

        const last = betHistory.pop();
        const before = balance;

        balance += last.amount;
        bets[last.symbol] -= last.amount;

        const delta = balance - before; // positive number
        showBalanceChange(delta);       // immediate "+X"
        updateUI();
    });

    // --- 4. Roll Dice (backend) ---
    rollBtn.addEventListener('click', () => {
        if (isRolling) return;

        const totalBet = Object.values(bets).reduce((a, b) => a + b, 0);
        if (totalBet === 0) {
            alert('Please place a bet on the mat first!');
            return;
        }

        startRollWithBackend();
    });

    async function startRollWithBackend() {
        isRolling = true;
        undoBtn.disabled = true;
        rollBtn.disabled = true;
        rollBtn.innerText = 'Rolling...';
        rollBtn.classList.add('opacity-75', 'cursor-not-allowed');

        const balanceBeforeRound = balance;

        // we wait for both animation and server
        let animationDone = false;
        let serverDone = false;
        let serverData = null;

        const maybeApplyServerResult = () => {
            if (!animationDone || !serverDone || !serverData) return;

            // 1) dice result
            if (Array.isArray(serverData.diceResult)) {
                updateDiceImagesFromResult(serverData.diceResult);
            }

            // 2) delayed balance + delta
            let newBalanceValue = null;
            let roundDelta = 0;

            if (typeof serverData.balance === 'number') {
                newBalanceValue = serverData.balance;
                roundDelta = newBalanceValue - balanceBeforeRound;

                balance = newBalanceValue;
                updateUI();               // main number
                showBalanceChange(roundDelta); // "+X" or "-X" for round
            }

            // 3) scoreboard
            updateScoreboardFromData(serverData);

            // 4) clear bets + history for new round
            betHistory = [];
            for (let key in bets) {
                bets[key] = 0;
            }
            updateUI();

            // 5) reset controls
            isRolling = false;
            undoBtn.disabled = false;
            rollBtn.disabled = false;
            rollBtn.innerText = 'Roll Dice';
            rollBtn.classList.remove('opacity-75', 'cursor-not-allowed');

            // 6) if player is out of money, show reset modal
            if (newBalanceValue === 0) {
                showResetModal();
            }
        };

        // --- animation ---
        let animationCount = 0;
        const maxAnimations = 20;
        const animInterval = setInterval(() => {
            diceImages.forEach(dice => {
                const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
                dice.src = `/images/symbol_${randomSymbol.toLowerCase()}.png`;
            });
            animationCount++;
            if (animationCount >= maxAnimations) {
                clearInterval(animInterval);
                animationDone = true;
                maybeApplyServerResult();
            }
        }, 100);

        // --- backend call ---
        try {
            const filteredBets = {};
            for (const [symbol, amount] of Object.entries(bets)) {
                if (amount > 0) {
                    filteredBets[symbol] = amount;
                }
            }

            if (Object.keys(filteredBets).length === 0) {
                throw new Error('No valid bets to send.');
            }

            const response = await fetch('/game/result', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ bets: filteredBets })
            });

            if (!response.ok) {
                const text = await response.text();
                console.error('Error response body:', text);
                throw new Error('Server error: ' + response.status);
            }

            const data = await response.json();
            console.log('Server result:', data);

            if (data.error) {
                throw new Error(data.error);
            }

            serverData = data;
            serverDone = true;
            maybeApplyServerResult();

        } catch (err) {
            console.error(err);
            alert(err.message || 'Something went wrong when rolling dice.');

            isRolling = false;
            undoBtn.disabled = false;
            rollBtn.disabled = false;
            rollBtn.innerText = 'Roll Dice';
            rollBtn.classList.remove('opacity-75', 'cursor-not-allowed');
        }
    }

    // --- 5. Reset modal button handlers ---

    // Back to login
    if (resetLoginBtn) {
        resetLoginBtn.addEventListener('click', () => {
            window.location.href = '/login';
        });
    }

    // Reset game
    if (resetGameBtn) {
        resetGameBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('/game/reset', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                    // no body needed; player is from session
                });

                if (!response.ok) {
                    const text = await response.text();
                    console.error('Error response body (reset):', text);
                    throw new Error('Server error: ' + response.status);
                }

                const data = await response.json();
                if (data.error) {
                    throw new Error(data.error);
                }

                // update balance from server
                if (typeof data.balance === 'number') {
                    balance = data.balance;
                }

                // clear bets & history
                betHistory = [];
                for (let key in bets) {
                    bets[key] = 0;
                }

                updateUI();
                showBalanceChange(0); // effectively hides delta
                updateScoreboardFromData(data);
                hideResetModal();

            } catch (err) {
                console.error(err);
                alert(err.message || 'Could not reset game. Please try again.');
            }
        });
    }

    // --- Initial UI ---
    updateUI();
});
