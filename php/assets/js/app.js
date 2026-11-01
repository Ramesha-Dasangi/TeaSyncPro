/**
 * TeaSyncPro - Core JavaScript Helpers
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Live Header Clock
    const liveTimeEl = document.getElementById('live-time');
    if (liveTimeEl) {
        function updateClock() {
            const now = new Date();
            liveTimeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }
        updateClock();
        setInterval(updateClock, 1000);
    }

    // 2. Modal open & close triggers
    document.querySelectorAll('[data-modal-target]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = btn.getAttribute('data-modal-target');
            const modal = document.getElementById(targetId);
            if (modal) {
                modal.classList.add('active');
            }
        });
    });

    document.querySelectorAll('.modal-close, [data-modal-close]').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal-overlay');
            if (modal) {
                modal.classList.remove('active');
            }
        });
    });

    // Close modal when clicking outside dialog
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    });

    // 3. Collection Weight Auto-Calculation
    const grossInput = document.getElementById('calc-gross');
    const deductionInput = document.getElementById('calc-deduction');
    const deductionPctInput = document.getElementById('calc-deduction-pct');
    const netDisplay = document.getElementById('calc-net');
    const payoutDisplay = document.getElementById('calc-payout');
    const rateInput = document.getElementById('calc-rate');

    function calculateNet() {
        if (!grossInput || !netDisplay) return;
        const gross = parseFloat(grossInput.value) || 0;
        let deduction = 0;

        if (deductionInput) {
            deduction = parseFloat(deductionInput.value) || 0;
        } else if (deductionPctInput) {
            const pct = parseFloat(deductionPctInput.value) || 0;
            deduction = (gross * pct) / 100;
        }

        const net = Math.max(0, gross - deduction);
        netDisplay.textContent = net.toFixed(2);

        if (payoutDisplay && rateInput) {
            const rate = parseFloat(rateInput.value) || 0;
            payoutDisplay.textContent = 'Rs. ' + (net * rate).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
    }

    if (grossInput) {
        grossInput.addEventListener('input', calculateNet);
        if (deductionInput) deductionInput.addEventListener('input', calculateNet);
        if (deductionPctInput) deductionPctInput.addEventListener('input', calculateNet);
        calculateNet();
    }
});

// Toast notification helper
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.4s ease';
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}
