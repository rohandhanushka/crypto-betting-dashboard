/**
 * NEXUS CRYPTO & SPORTS BETTING DASHBOARD
 * Core Engine & Interactive UI Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // APPLICATION STATE
  // =========================================================================
  const state = {
    balanceUSD: 4520.00,
    currencyMode: 'USD', // 'USD', 'BTC', 'ETH'
    cryptoRates: {
      BTC: 64480.20,
      ETH: 3452.80,
      SOL: 154.20,
      TON: 5.84,
    },
    betslip: [],
    betType: 'combo', // 'single', 'combo', 'system'
    stake: 50.00,
    oddsFormat: 'decimal', // 'decimal', 'american', 'fractional'
    selectedSport: 'all',
  };

  // =========================================================================
  // DOM ELEMENT SELECTORS
  // =========================================================================
  const elements = {
    // Wallet & Header
    balanceDisplay: document.getElementById('balanceDisplay'),
    currSymbol: document.getElementById('currSymbol'),
    currUnit: document.getElementById('currUnit'),
    walletCard: document.getElementById('walletCard'),
    openDepositModalBtn: document.getElementById('openDepositModalBtn'),
    depositModal: document.getElementById('depositModal'),
    closeDepositModalBtn: document.getElementById('closeDepositModalBtn'),
    copyAddressBtn: document.getElementById('copyAddressBtn'),
    depositAddressText: document.getElementById('depositAddressText'),

    // Mobile Navigation & Drawers
    sidebar: document.getElementById('sidebar'),
    menuToggleBtn: document.getElementById('menuToggleBtn'),
    sidebarCloseBtn: document.getElementById('sidebarCloseBtn'),
    betslipPanel: document.getElementById('betslipPanel'),
    betslipTriggerBtn: document.getElementById('betslipTriggerBtn'),
    closeBetslipBtn: document.getElementById('closeBetslipBtn'),
    headerSlipCount: document.getElementById('headerSlipCount'),

    // Search & Filters
    globalSearch: document.getElementById('globalSearch'),
    catTabs: document.querySelectorAll('.cat-tab'),
    matchesContainer: document.getElementById('matchesContainer'),
    oddsFormatSelect: document.getElementById('oddsFormatSelect'),

    // Betslip Elements
    betslipBadge: document.getElementById('betslipBadge'),
    betslipItems: document.getElementById('betslipItems'),
    emptySlipNotice: document.getElementById('emptySlipNotice'),
    clearSlipBtn: document.getElementById('clearSlipBtn'),
    slipTypeTabs: document.querySelectorAll('.slip-tab'),
    presetChips: document.querySelectorAll('.preset-chip'),
    stakeInput: document.getElementById('stakeInput'),
    totalOddsDisplay: document.getElementById('totalOddsDisplay'),
    potentialWinDisplay: document.getElementById('potentialWinDisplay'),
    placeBetBtn: document.getElementById('placeBetBtn'),

    // Crypto & Toasts
    refreshCryptoBtn: document.getElementById('refreshCryptoBtn'),
    toastContainer: document.getElementById('toastContainer'),
  };

  // =========================================================================
  // TOAST NOTIFICATION UTILITY
  // =========================================================================
  window.toast = (message, type = 'info') => {
    if (!elements.toastContainer) return;
    const toastEl = document.createElement('div');
    toastEl.className = `toast ${type}`;

    let icon = '⚡';
    if (type === 'success') icon = '✓';
    if (type === 'warn') icon = '⚠';
    if (type === 'error') icon = '✕';

    toastEl.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    elements.toastContainer.appendChild(toastEl);

    setTimeout(() => {
      toastEl.style.transition = 'all 0.3s ease';
      toastEl.style.opacity = '0';
      toastEl.style.transform = 'translateY(10px)';
      setTimeout(() => toastEl.remove(), 300);
    }, 3500);
  };

  // =========================================================================
  // WALLET & BALANCE CONTROLLER
  // =========================================================================
  function renderBalance() {
    if (!elements.balanceDisplay) return;

    if (state.currencyMode === 'USD') {
      elements.currSymbol.textContent = '$';
      elements.currUnit.textContent = 'USD';
      elements.balanceDisplay.textContent = state.balanceUSD.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } else if (state.currencyMode === 'BTC') {
      elements.currSymbol.textContent = '₿';
      elements.currUnit.textContent = 'BTC';
      const btcVal = state.balanceUSD / state.cryptoRates.BTC;
      elements.balanceDisplay.textContent = btcVal.toFixed(4);
    } else if (state.currencyMode === 'ETH') {
      elements.currSymbol.textContent = 'Ξ';
      elements.currUnit.textContent = 'ETH';
      const ethVal = state.balanceUSD / state.cryptoRates.ETH;
      elements.balanceDisplay.textContent = ethVal.toFixed(3);
    }
  }

  // Toggle currency when clicking balance card
  if (elements.walletCard) {
    elements.walletCard.addEventListener('click', (e) => {
      if (e.target.closest('#openDepositModalBtn')) return;
      const modes = ['USD', 'BTC', 'ETH'];
      const nextIdx = (modes.indexOf(state.currencyMode) + 1) % modes.length;
      state.currencyMode = modes[nextIdx];
      renderBalance();
      window.toast(`Currency display switched to ${state.currencyMode}`, 'info');
    });
  }

  // =========================================================================
  // DEPOSIT MODAL LOGIC
  // =========================================================================
  if (elements.openDepositModalBtn && elements.depositModal) {
    elements.openDepositModalBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      elements.depositModal.classList.add('open');
    });
  }

  if (elements.closeDepositModalBtn) {
    elements.closeDepositModalBtn.addEventListener('click', () => {
      elements.depositModal.classList.remove('open');
    });
  }

  if (elements.depositModal) {
    elements.depositModal.addEventListener('click', (e) => {
      if (e.target === elements.depositModal) {
        elements.depositModal.classList.remove('open');
      }
    });
  }

  // Copy Address
  if (elements.copyAddressBtn && elements.depositAddressText) {
    elements.copyAddressBtn.addEventListener('click', () => {
      navigator.clipboard?.writeText(elements.depositAddressText.textContent.trim());
      elements.copyAddressBtn.textContent = 'Copied!';
      window.toast('Deposit address copied to clipboard!', 'success');
      setTimeout(() => {
        elements.copyAddressBtn.textContent = 'Copy';
      }, 2000);
    });
  }

  // Coin picker inside Deposit modal
  const coinOptions = document.querySelectorAll('.deposit-coin-opt');
  coinOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      coinOptions.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      const coin = opt.dataset.coin;
      const mockAddresses = {
        USDT: '0x71C...a84E9d7F39b',
        BTC: 'bc1q9p3v6gq2s...d8z4t7',
        ETH: '0x32A...c9F408De12e',
        SOL: '7xKX...4qH9zPv8K2L',
      };
      if (elements.depositAddressText) {
        elements.depositAddressText.textContent = mockAddresses[coin] || '0x71C...a84E9d7F39b';
      }
      window.toast(`Switched deposit channel to ${coin}`, 'info');
    });
  });

  // Demo Fund Deposit Buttons
  const demoFundButtons = document.querySelectorAll('.btn-demo-fund');
  demoFundButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const amount = parseFloat(btn.dataset.amount || 0);
      state.balanceUSD += amount;
      renderBalance();
      elements.depositModal.classList.remove('open');
      window.toast(`Deposit Confirmed: +$${amount.toFixed(2)} USD added!`, 'success');
    });
  });

  // Global Quick Crypto Stake Action from Cards
  window.selectCryptoStake = (coin) => {
    window.toast(`Selected ${coin} as primary stake asset. Opening betslip...`, 'info');
    openBetslipDrawer();
  };

  // =========================================================================
  // BETSLIP INTERACTIVE LOGIC
  // =========================================================================
  function generateBetId(match, bet) {
    return `${match}_${bet}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
  }

  // Handle all Clickable Odd Buttons on Page
  function bindOddButtons() {
    const oddButtons = document.querySelectorAll('.odd-btn');
    oddButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const match = btn.dataset.match || 'Selected Match';
        const bet = btn.dataset.bet || 'Match Winner';
        const odds = parseFloat(btn.dataset.odds || 1.85);
        const betId = generateBetId(match, bet);

        toggleBetSelection(betId, match, bet, odds, btn);
      });
    });
  }

  function toggleBetSelection(id, match, bet, odds, btnElement) {
    const existingIndex = state.betslip.findIndex(item => item.id === id);

    if (existingIndex > -1) {
      state.betslip.splice(existingIndex, 1);
      btnElement.classList.remove('selected');
      window.toast(`Removed from Betslip: ${bet}`, 'warn');
    } else {
      state.betslip.push({ id, match, bet, odds, originalOdds: odds });
      btnElement.classList.add('selected');
      window.toast(`Added to Betslip: ${bet} (${odds.toFixed(2)}x)`, 'success');

      if (window.innerWidth <= 1024) {
        openBetslipDrawer();
      }
    }

    renderBetslip();
  }

  function removeBet(id) {
    const idx = state.betslip.findIndex(b => b.id === id);
    if (idx > -1) {
      const removed = state.betslip[idx];
      state.betslip.splice(idx, 1);

      const allOddButtons = document.querySelectorAll('.odd-btn');
      allOddButtons.forEach(btn => {
        const btnId = generateBetId(btn.dataset.match, btn.dataset.bet);
        if (btnId === id) {
          btn.classList.remove('selected');
        }
      });

      window.toast(`Removed ${removed.bet}`, 'warn');
      renderBetslip();
    }
  }

  function renderBetslip() {
    const count = state.betslip.length;

    if (elements.betslipBadge) elements.betslipBadge.textContent = count;
    if (elements.headerSlipCount) elements.headerSlipCount.textContent = count;

    const activeBetsCounter = document.getElementById('activeBetsCounter');
    if (activeBetsCounter) activeBetsCounter.textContent = count > 0 ? count : '3';

    if (!elements.betslipItems) return;

    if (count === 0) {
      elements.betslipItems.innerHTML = `
        <div class="betslip-empty-state">
          <div class="empty-icon-wrap">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
          </div>
          <p class="empty-title">Your Betslip is Empty</p>
          <p class="empty-desc">Click any highlighted odd on the dashboard to build your winning ticket!</p>
        </div>
      `;
      if (elements.placeBetBtn) elements.placeBetBtn.disabled = true;
      if (elements.totalOddsDisplay) elements.totalOddsDisplay.textContent = '0.00x';
      if (elements.potentialWinDisplay) elements.potentialWinDisplay.textContent = '$0.00';
      return;
    }

    if (elements.placeBetBtn) elements.placeBetBtn.disabled = false;

    elements.betslipItems.innerHTML = '';
    state.betslip.forEach(bet => {
      const card = document.createElement('div');
      card.className = 'bet-item-card';
      card.innerHTML = `
        <div class="bet-item-top">
          <span class="bet-item-match">${escapeHtml(bet.match)}</span>
          <button class="bet-item-remove" data-id="${bet.id}" title="Remove bet">✕</button>
        </div>
        <div class="bet-item-main">
          <span class="bet-item-pick">${escapeHtml(bet.bet)}</span>
          <span class="bet-item-odd">${formatOdds(bet.odds)}</span>
        </div>
      `;
      elements.betslipItems.appendChild(card);
    });

    const removeBtns = elements.betslipItems.querySelectorAll('.bet-item-remove');
    removeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        removeBet(btn.dataset.id);
      });
    });

    calculatePayout();
  }

  // Calculate Parlay / Combo Odds and Estimated Win
  function calculatePayout() {
    if (state.betslip.length === 0) return;

    let totalOdds = 1.00;
    if (state.betType === 'combo') {
      totalOdds = state.betslip.reduce((acc, curr) => acc * curr.odds, 1);
    } else {
      totalOdds = state.betslip.reduce((acc, curr) => acc + curr.odds, 0) / state.betslip.length;
    }

    const stakeVal = parseFloat(elements.stakeInput?.value || state.stake);
    const potentialWin = stakeVal * totalOdds;

    if (elements.totalOddsDisplay) {
      elements.totalOddsDisplay.textContent = `${totalOdds.toFixed(2)}x`;
    }

    if (elements.potentialWinDisplay) {
      elements.potentialWinDisplay.textContent = `$${potentialWin.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
  }

  // Odds formatting converter
  function formatOdds(decimal) {
    if (state.oddsFormat === 'american') {
      if (decimal >= 2.0) {
        return `+${Math.round((decimal - 1) * 100)}`;
      } else {
        return `-${Math.round(100 / (decimal - 1))}`;
      }
    } else if (state.oddsFormat === 'fractional') {
      return approximateFraction(decimal - 1);
    }
    return decimal.toFixed(2);
  }

  function approximateFraction(val) {
    const tolerance = 0.05;
    for (let d = 1; d <= 20; d++) {
      const n = Math.round(val * d);
      if (Math.abs(val - n / d) < tolerance) {
        return `${n}/${d}`;
      }
    }
    return `${val.toFixed(1)}/1`;
  }

  if (elements.oddsFormatSelect) {
    elements.oddsFormatSelect.addEventListener('change', (e) => {
      state.oddsFormat = e.target.value;
      renderBetslip();
      window.toast(`Odds format set to ${state.oddsFormat.toUpperCase()}`, 'info');
    });
  }

  elements.slipTypeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      elements.slipTypeTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.betType = tab.dataset.type;
      calculatePayout();
    });
  });

  if (elements.stakeInput) {
    elements.stakeInput.addEventListener('input', (e) => {
      state.stake = Math.max(1, parseFloat(e.target.value || 0));
      calculatePayout();
    });
  }

  elements.presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      elements.presetChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const val = chip.dataset.stake;
      if (val === 'max') {
        elements.stakeInput.value = state.balanceUSD;
      } else {
        elements.stakeInput.value = val;
      }
      state.stake = parseFloat(elements.stakeInput.value);
      calculatePayout();
    });
  });

  if (elements.clearSlipBtn) {
    elements.clearSlipBtn.addEventListener('click', () => {
      state.betslip = [];
      const allOddButtons = document.querySelectorAll('.odd-btn');
      allOddButtons.forEach(btn => btn.classList.remove('selected'));
      renderBetslip();
      window.toast('Betslip cleared', 'info');
    });
  }

  if (elements.placeBetBtn) {
    elements.placeBetBtn.addEventListener('click', () => {
      if (state.betslip.length === 0) {
        window.toast('Please select at least one match odd!', 'error');
        return;
      }

      const stakeAmount = parseFloat(elements.stakeInput.value || 0);

      if (stakeAmount <= 0) {
        window.toast('Please enter a valid stake amount', 'error');
        return;
      }

      if (stakeAmount > state.balanceUSD) {
        window.toast('Insufficient funds! Please deposit to continue.', 'error');
        elements.depositModal.classList.add('open');
        return;
      }

      state.balanceUSD -= stakeAmount;
      renderBalance();

      const ticketId = 'NX-' + Math.floor(100000 + Math.random() * 900000);
      const estWin = elements.potentialWinDisplay.textContent;

      window.toast(`Bet Placed Successfully! Ticket: #${ticketId} | Potential Win: ${estWin}`, 'success');

      state.betslip = [];
      const allOddButtons = document.querySelectorAll('.odd-btn');
      allOddButtons.forEach(btn => btn.classList.remove('selected'));
      renderBetslip();

      if (elements.betslipPanel) {
        elements.betslipPanel.classList.remove('open');
      }
    });
  }

  // =========================================================================
  // CATEGORY TABS & MATCHES FILTERING
  // =========================================================================
  elements.catTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      elements.catTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const sport = tab.dataset.sport;
      state.selectedSport = sport;

      const matchCards = document.querySelectorAll('.match-card');
      matchCards.forEach(card => {
        if (sport === 'all' || card.dataset.sport === sport) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // =========================================================================
  // GLOBAL SEARCH FILTERING
  // =========================================================================
  if (elements.globalSearch) {
    elements.globalSearch.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const matchCards = document.querySelectorAll('.match-card');
      const cryptoCards = document.querySelectorAll('.crypto-card');

      matchCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(query) ? 'flex' : 'none';
      });

      cryptoCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(query) ? 'flex' : 'none';
      });
    });

    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        elements.globalSearch.focus();
      }
    });
  }

  // =========================================================================
  // MOBILE NAVIGATION & BETSLIP DRAWER HANDLERS
  // =========================================================================
  function openBetslipDrawer() {
    if (elements.betslipPanel) {
      elements.betslipPanel.classList.add('open');
    }
  }

  if (elements.betslipTriggerBtn) {
    elements.betslipTriggerBtn.addEventListener('click', () => {
      if (elements.betslipPanel.classList.contains('open')) {
        elements.betslipPanel.classList.remove('open');
      } else {
        openBetslipDrawer();
      }
    });
  }

  if (elements.closeBetslipBtn) {
    elements.closeBetslipBtn.addEventListener('click', () => {
      elements.betslipPanel.classList.remove('open');
    });
  }

  if (elements.menuToggleBtn && elements.sidebar) {
    elements.menuToggleBtn.addEventListener('click', () => {
      elements.sidebar.classList.add('open');
    });
  }

  if (elements.sidebarCloseBtn && elements.sidebar) {
    elements.sidebarCloseBtn.addEventListener('click', () => {
      elements.sidebar.classList.remove('open');
    });
  }

  // =========================================================================
  // REAL-TIME SIMULATED ODDS & CRYPTO TICKERS
  // =========================================================================
  setInterval(() => {
    const oddButtons = document.querySelectorAll('.matches-grid .odd-btn');
    if (oddButtons.length === 0) return;

    const randomBtn = oddButtons[Math.floor(Math.random() * oddButtons.length)];
    const numSpan = randomBtn.querySelector('.odd-num');
    if (!numSpan) return;

    const currentOdd = parseFloat(randomBtn.dataset.odds || 1.85);
    const isUp = Math.random() > 0.5;
    const delta = (Math.random() * 0.08 + 0.02) * (isUp ? 1 : -1);
    const newOdd = Math.max(1.10, parseFloat((currentOdd + delta).toFixed(2)));

    randomBtn.dataset.odds = newOdd;
    numSpan.textContent = newOdd.toFixed(2);

    randomBtn.classList.remove('odd-flash-up', 'odd-flash-down');
    void randomBtn.offsetWidth;
    randomBtn.classList.add(isUp ? 'odd-flash-up' : 'odd-flash-down');

    const betId = generateBetId(randomBtn.dataset.match, randomBtn.dataset.bet);
    const slipItem = state.betslip.find(b => b.id === betId);
    if (slipItem) {
      slipItem.odds = newOdd;
      renderBetslip();
    }
  }, 5000);

  if (elements.refreshCryptoBtn) {
    elements.refreshCryptoBtn.addEventListener('click', () => {
      state.cryptoRates.BTC += (Math.random() * 200 - 100);
      state.cryptoRates.ETH += (Math.random() * 20 - 10);
      state.cryptoRates.SOL += (Math.random() * 4 - 2);

      const btcEl = document.getElementById('btcPrice');
      const ethEl = document.getElementById('ethPrice');
      const solEl = document.getElementById('solPrice');

      if (btcEl) btcEl.textContent = `$${state.cryptoRates.BTC.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      if (ethEl) ethEl.textContent = `$${state.cryptoRates.ETH.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      if (solEl) solEl.textContent = `$${state.cryptoRates.SOL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

      renderBalance();
      window.toast('Crypto exchange rates synchronized with Binance & Pyth Oracles', 'success');
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function(m) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[m];
    });
  }

  // Initialization
  bindOddButtons();
  renderBalance();
  renderBetslip();
});