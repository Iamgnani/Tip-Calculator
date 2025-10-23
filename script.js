(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  const billEl = $("#bill");
  const peopleEl = $("#people");
  const tipPerPersonEl = $("#tipPerPerson");
  const totalPerPersonEl = $("#totalPerPerson");
  const tipBtns = $$(".tip-btn");
  const customTipEl = $("#customTip");
  const resetBtn = $("#resetBtn");
  const peopleError = $("#peopleError");

  let state = {
    bill: 0,
    tipPercent: 0,
    people: 1,
  };

  function formatMoney(v) {
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }).format(v);
    } catch (e) {
      // fallback
      return "₹" + v.toFixed(2);
    }
  }

  function setActiveTipButton(percent) {
    tipBtns.forEach((b) => {
      const p = Number(b.dataset.tip);
      if (p === percent) b.classList.add("active");
      else b.classList.remove("active");
    });
  }

  function compute() {
    const { bill, tipPercent, people } = state;
    if (people <= 0 || isNaN(people)) {
      peopleError.textContent = "Number of people must be at least 1";
      setResultText(tipPerPersonEl, formatMoney(0));
      setResultText(totalPerPersonEl, formatMoney(0));
      return;
    }
    peopleError.textContent = "";

    const tipTotal = bill * (tipPercent / 100);
    const tipPer = tipTotal / people;
    const totalPer = bill / people + tipPer;

    setResultText(tipPerPersonEl, formatMoney(isFinite(tipPer) ? tipPer : 0));
    setResultText(
      totalPerPersonEl,
      formatMoney(isFinite(totalPer) ? totalPer : 0)
    );
  }

  // animate when result text changes
  function setResultText(el, text) {
    if (el.textContent !== text) {
      el.textContent = text;
      el.classList.remove("anim");
      // force reflow to restart animation
      void el.offsetWidth;
      el.classList.add("anim");
      // remove class after animation ends
      clearTimeout(el._animTimeout);
      el._animTimeout = setTimeout(() => el.classList.remove("anim"), 500);
    }
  }

  function updateStateFromInputs() {
    state.bill = parseFloat(billEl.value) || 0;
    state.people = parseInt(peopleEl.value, 10) || 0;
    const customVal = parseFloat(customTipEl.value);
    if (!isNaN(customVal) && customVal >= 0) {
      state.tipPercent = customVal;
      setActiveTipButton(null);
    }
    compute();
    resetBtn.disabled = !(state.bill || state.tipPercent || state.people !== 1);
  }

  // Preset tip buttons
  tipBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const p = Number(btn.dataset.tip);
      state.tipPercent = p;
      customTipEl.value = "";
      setActiveTipButton(p);
      updateStateFromInputs();
    });
  });

  // Inputs
  [billEl, peopleEl].forEach((el) => {
    el.addEventListener("input", () => updateStateFromInputs());
  });

  customTipEl.addEventListener("input", () => {
    const v = parseFloat(customTipEl.value);
    if (!isNaN(v) && v >= 0) {
      state.tipPercent = v;
      setActiveTipButton(null);
    }
    updateStateFromInputs();
  });

  resetBtn.addEventListener("click", () => {
    billEl.value = "";
    peopleEl.value = "1";
    customTipEl.value = "";
    state = { bill: 0, tipPercent: 0, people: 1 };
    setActiveTipButton(null);
    compute();
    resetBtn.disabled = true;
  });

  // init
  compute();
})();
