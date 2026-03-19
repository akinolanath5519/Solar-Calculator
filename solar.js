document.addEventListener("DOMContentLoaded", function () {
  const scpData = [
    { category: "Lighting", name: "LED Bulb", watts: 10, qty: 6, hours: 6, enabled: true },
    { category: "Lighting", name: "Security Light", watts: 20, qty: 2, hours: 10, enabled: false },

    { category: "Entertainment", name: "Television", watts: 120, qty: 1, hours: 6, enabled: true },
    { category: "Entertainment", name: "Decoder", watts: 25, qty: 1, hours: 6, enabled: true },
    { category: "Entertainment", name: "Sound System", watts: 150, qty: 1, hours: 3, enabled: false },

    { category: "Cooling", name: "Standing Fan", watts: 75, qty: 2, hours: 8, enabled: true },
    { category: "Cooling", name: "Ceiling Fan", watts: 60, qty: 2, hours: 8, enabled: false },
    { category: "Cooling", name: "Air Conditioner (1HP)", watts: 900, qty: 1, hours: 6, enabled: false },

    { category: "Kitchen", name: "Fridge", watts: 180, qty: 1, hours: 10, enabled: true },
    { category: "Kitchen", name: "Freezer", watts: 250, qty: 1, hours: 8, enabled: false },
    { category: "Kitchen", name: "Microwave", watts: 1200, qty: 1, hours: 0.5, enabled: false },

    { category: "Work & Business", name: "Laptop", watts: 65, qty: 2, hours: 8, enabled: true },
    { category: "Work & Business", name: "Desktop Computer", watts: 200, qty: 1, hours: 8, enabled: false },
    { category: "Work & Business", name: "Printer", watts: 100, qty: 1, hours: 1, enabled: false },
    { category: "Work & Business", name: "WiFi Router", watts: 15, qty: 1, hours: 24, enabled: true },
    { category: "Work & Business", name: "POS Machine", watts: 30, qty: 1, hours: 10, enabled: false },

    { category: "Utilities", name: "Water Pump", watts: 750, qty: 1, hours: 1, enabled: false },
    { category: "Utilities", name: "CCTV System", watts: 80, qty: 1, hours: 24, enabled: false }
  ];

  let currentStep = 1;
  const totalSteps = 4;
  let activeCategory = "All";

  const steps = document.querySelectorAll(".scp-step");
  const stepLabels = document.querySelectorAll(".scp-step-labels span");
  const progressBar = document.getElementById("scpProgressBar");
  const prevBtn = document.getElementById("scpPrevBtn");
  const nextBtn = document.getElementById("scpNextBtn");
  const tabsContainer = document.getElementById("scpCategoryTabs");
  const applianceGrid = document.getElementById("scpApplianceGrid");

  // Modal elements
  const modal = document.getElementById("scpQuoteModal");
  const quoteBtn = document.getElementById("scpQuoteBtn");
  const closeModal = document.getElementById("scpCloseModal");
  const cancelModal = document.getElementById("scpCancelModal");
  const quoteForm = document.getElementById("scpQuoteForm");
  const modalForm = document.getElementById("scpModalForm");
  const successMessage = document.getElementById("scpSuccessMessage");

  function formatCurrency(num) {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0
    }).format(num);
  }

  function updateChoiceCards() {
    document.querySelectorAll('.scp-choice-card input[type="radio"]').forEach(input => {
      input.addEventListener("change", function () {
        const name = this.name;
        document.querySelectorAll(`input[name="${name}"]`).forEach(radio => {
          radio.closest(".scp-choice-card").classList.remove("active");
        });
        this.closest(".scp-choice-card").classList.add("active");
      });
    });
  }

  function renderTabs() {
    const categories = ["All", ...new Set(scpData.map(item => item.category))];
    tabsContainer.innerHTML = "";

    categories.forEach(cat => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `scp-tab ${cat === activeCategory ? "active" : ""}`;
      btn.textContent = cat;
      btn.addEventListener("click", () => {
        activeCategory = cat;
        renderTabs();
        renderAppliances();
      });
      tabsContainer.appendChild(btn);
    });
  }

  function renderAppliances() {
    applianceGrid.innerHTML = "";

    const filtered = activeCategory === "All"
      ? scpData
      : scpData.filter(item => item.category === activeCategory);

    filtered.forEach(item => {
      const index = scpData.indexOf(item);

      const card = document.createElement("div");
      card.className = `scp-appliance-card ${item.enabled ? "enabled" : ""}`;
      card.setAttribute("data-index", index);

      card.innerHTML = `
        <div class="scp-appliance-head">
          <div>
            <div class="scp-appliance-name">${item.name}</div>
            <div class="scp-appliance-meta">${item.category} • ${item.watts}W estimated load</div>
          </div>
          <label class="scp-toggle">
            <input type="checkbox" class="scp-enable" data-index="${index}" ${item.enabled ? "checked" : ""}>
            <span class="scp-slider"></span>
          </label>
        </div>

        <div class="scp-fields">
          <div class="scp-field">
            <label>Quantity</label>
            <input type="number" min="0" step="1" class="scp-qty" data-index="${index}" value="${item.qty}">
          </div>
          <div class="scp-field">
            <label>Hours / Day</label>
            <input type="number" min="0" step="0.5" class="scp-hours" data-index="${index}" value="${item.hours}">
          </div>
        </div>
      `;

      applianceGrid.appendChild(card);
    });

    attachApplianceEvents();
  }

  function attachApplianceEvents() {
    document.querySelectorAll(".scp-enable").forEach(el => {
      el.addEventListener("change", function () {
        const index = parseInt(this.dataset.index);
        scpData[index].enabled = this.checked;
        renderAppliances();
      });
    });

    document.querySelectorAll(".scp-qty").forEach(el => {
      el.addEventListener("input", function () {
        const index = parseInt(this.dataset.index);
        scpData[index].qty = parseFloat(this.value) || 0;
      });
    });

    document.querySelectorAll(".scp-hours").forEach(el => {
      el.addEventListener("input", function () {
        const index = parseInt(this.dataset.index);
        scpData[index].hours = parseFloat(this.value) || 0;
      });
    });
  }

  function showStep(step) {
    steps.forEach(s => s.classList.remove("active"));
    document.querySelector(`.scp-step[data-step="${step}"]`).classList.add("active");

    stepLabels.forEach((label, i) => {
      label.classList.toggle("active", i === step - 1);
    });

    progressBar.style.width = `${(step / totalSteps) * 100}%`;
    prevBtn.disabled = step === 1;
    nextBtn.textContent = step === totalSteps ? "Recalculate" : "Next";

    if (step === 4) {
      calculateResults();
    }
  }

  function getSelectedValue(name, fallback = "") {
    const selected = document.querySelector(`input[name="${name}"]:checked`);
    return selected ? selected.value : fallback;
  }

  function mapInverter(requiredKw, priority) {
    let adjusted = requiredKw * 1.25;

    if (priority === "Comfort & Convenience" || priority === "Replace Generator Completely") {
      adjusted = requiredKw * 1.35;
    }

    if (adjusted <= 1.2) return { label: "1.5 kVA Inverter", kVA: 1.5 };
    if (adjusted <= 2.8) return { label: "3.5 kVA Inverter", kVA: 3.5 };
    if (adjusted <= 4.0) return { label: "5 kVA Inverter", kVA: 5 };
    if (adjusted <= 6.0) return { label: "7.5 kVA Inverter", kVA: 7.5 };
    if (adjusted <= 8.0) return { label: "10 kVA Inverter", kVA: 10 };
    return { label: "15 kVA+ Custom System", kVA: 15 };
  }

  function getPackageTier(dailyKwh, peakKw, priority) {
    if (priority === "Lower Upfront Cost") {
      if (dailyKwh <= 3 && peakKw <= 1.5) return "Starter Package";
      if (dailyKwh <= 7 && peakKw <= 3.5) return "Standard Package";
      return "Premium / Custom Package";
    }

    if (priority === "Replace Generator Completely") {
      if (dailyKwh <= 6 && peakKw <= 3) return "Enhanced Standard Package";
      if (dailyKwh <= 14 && peakKw <= 6) return "Premium Package";
      return "Enterprise / Full Independence Package";
    }

    if (dailyKwh <= 3 && peakKw <= 1.5) return "Starter Package";
    if (dailyKwh <= 8 && peakKw <= 4) return "Standard Package";
    if (dailyKwh <= 15 && peakKw <= 7) return "Premium Package";
    return "Enterprise / Custom Package";
  }

  function estimatePriceRange(inverterKva, batteryKwh, solarKw, priority) {
    // Rough Nigeria-facing estimate logic (editable)
    let base = 250000;
    let inverterCost = inverterKva * 220000;
    let batteryCost = batteryKwh * 280000;
    let solarCost = solarKw * 180000;

    let subtotal = base + inverterCost + batteryCost + solarCost;

    if (priority === "Lower Upfront Cost") subtotal *= 0.95;
    if (priority === "Comfort & Convenience") subtotal *= 1.08;
    if (priority === "Replace Generator Completely") subtotal *= 1.15;

    const min = Math.round(subtotal * 0.92);
    const max = Math.round(subtotal * 1.15);

    return { min, max };
  }

  function calculateResults() {
    const propertyType = getSelectedValue("scp_property_type", "Home");
    const priority = getSelectedValue("scp_priority", "Best Value");
    const backupHours = parseFloat(getSelectedValue("scp_backup_hours", "4"));
    const generatorSpend = parseFloat(document.getElementById("scpGeneratorSpend").value) || 0;
    const gridBill = parseFloat(document.getElementById("scpGridBill").value) || 0;

    let totalWh = 0;
    let totalPeakWatts = 0;

    scpData.forEach(item => {
      if (item.enabled && item.qty > 0 && item.hours > 0) {
        totalWh += item.watts * item.qty * item.hours;
        totalPeakWatts += item.watts * item.qty;
      }
    });

    const dailyKwh = totalWh / 1000;

    // diversity factor: realistic simultaneous usage assumption
    let diversityFactor = 0.7;
    if (propertyType === "Office" || propertyType === "Shop") diversityFactor = 0.75;
    if (priority === "Replace Generator Completely") diversityFactor = 0.8;

    const peakKw = (totalPeakWatts * diversityFactor) / 1000;

    // battery sizing based on average hourly load and backup target
    const avgHourlyKwh = dailyKwh / 24;
    let backupEnergy = avgHourlyKwh * backupHours;

    if (priority === "Replace Generator Completely") {
      backupEnergy *= 1.15;
    }

    const usableBatteryFactor = 0.85;
    const batteryKwh = backupEnergy / usableBatteryFactor;

    // solar sizing
    let peakSunHours = 4.5;
    let systemEfficiency = 0.8;

    if (priority === "Lower Upfront Cost") {
      systemEfficiency = 0.78;
    }
    if (priority === "Replace Generator Completely") {
      systemEfficiency = 0.82;
    }

    const solarKw = dailyKwh / (peakSunHours * systemEfficiency);

    // inverter
    const inverter = mapInverter(peakKw, priority);

    // package
    const packageTier = getPackageTier(dailyKwh, peakKw, priority);

    // pricing
    const price = estimatePriceRange(inverter.kVA, batteryKwh, solarKw, priority);

    // savings
    const genSavings = generatorSpend > 0 ? Math.round(generatorSpend * 0.65) : 0;
    const gridSavings = gridBill > 0 ? Math.round(gridBill * 0.55) : 0;

    // update results
    document.getElementById("scpDailyEnergy").textContent = `${dailyKwh.toFixed(2)} kWh/day`;
    document.getElementById("scpPeakLoad").textContent = `${peakKw.toFixed(2)} kW`;
    document.getElementById("scpInverter").textContent = inverter.label;
    document.getElementById("scpBattery").textContent = `${batteryKwh.toFixed(1)} kWh`;
    document.getElementById("scpSolarSize").textContent = `${solarKw.toFixed(2)} kW`;
    document.getElementById("scpPackage").textContent = packageTier;
    document.getElementById("scpPriceRange").textContent = `${formatCurrency(price.min)} - ${formatCurrency(price.max)}`;
    document.getElementById("scpGenSavings").textContent = formatCurrency(genSavings);
    document.getElementById("scpGridSavings").textContent = formatCurrency(gridSavings);

    document.getElementById("scpSummaryText").textContent =
      `Based on your selected appliances and usage pattern for this ${propertyType.toLowerCase()}, we estimate your energy demand at ${dailyKwh.toFixed(2)} kWh per day with a likely peak load of ${peakKw.toFixed(2)} kW. To support approximately ${backupHours} hours of backup, a ${inverter.label}, about ${batteryKwh.toFixed(1)} kWh battery storage, and roughly ${solarKw.toFixed(2)} kW of solar panels would be a practical starting recommendation. Your best-fit solution is our ${packageTier}, with an estimated project budget range of ${formatCurrency(price.min)} to ${formatCurrency(price.max)} depending on brand selection, installation scope, and site conditions.`;

    // WhatsApp CTA
    const phone = "2348078265499";
    const waText = `Hello, I used your solar calculator and I want a detailed quote.%0A%0AProperty Type: ${propertyType}%0APriority: ${priority}%0ADaily Energy: ${dailyKwh.toFixed(2)} kWh/day%0APeak Load: ${peakKw.toFixed(2)} kW%0ABackup Hours: ${backupHours}%0ARecommended Inverter: ${inverter.label}%0ABattery Storage: ${batteryKwh.toFixed(1)} kWh%0ASolar Size: ${solarKw.toFixed(2)} kW%0APackage: ${packageTier}%0APrice Range: ${formatCurrency(price.min)} - ${formatCurrency(price.max)}`;
    document.getElementById("scpWhatsAppBtn").href = `https://wa.me/${phone}?text=${waText}`;
  }

  // Modal Functions
  function openModal() {
    modal.classList.add("active");
    document.body.classList.add("modal-open"); // Use class instead of inline style
    // Reset form
    modalForm.style.display = "block";
    successMessage.style.display = "none";
    document.getElementById("scpQuoteForm").reset();
    document.querySelectorAll(".scp-form-group input").forEach(input => {
      input.classList.remove("error");
    });
  }

  function closeModalFunc() {
    modal.classList.remove("active");
    document.body.classList.remove("modal-open");
  }

  function validateForm() {
    let isValid = true;
    const name = document.getElementById("scpName");
    const email = document.getElementById("scpEmail");
    
    // Reset errors
    name.classList.remove("error");
    email.classList.remove("error");
    
    // Validate name
    if (!name.value.trim()) {
      name.classList.add("error");
      isValid = false;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim() || !emailRegex.test(email.value)) {
      email.classList.add("error");
      isValid = false;
    }
    
    return isValid;
  }

  // Event Listeners
  quoteBtn.addEventListener("click", function (e) {
    e.preventDefault();
    openModal();
  });

  closeModal.addEventListener("click", closeModalFunc);
  cancelModal.addEventListener("click", closeModalFunc);

  // Close modal when clicking outside
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      closeModalFunc();
    }
  });

  // Form submission
  quoteForm.addEventListener("submit", function (e) {
    e.preventDefault();
    
    if (validateForm()) {
      // Get form data
      const name = document.getElementById("scpName").value;
      const email = document.getElementById("scpEmail").value;
      const phone = document.getElementById("scpPhone").value;
      
      // Get calculator results
      const propertyType = getSelectedValue("scp_property_type", "Home");
      const priority = getSelectedValue("scp_priority", "Best Value");
      const dailyEnergy = document.getElementById("scpDailyEnergy").textContent;
      const peakLoad = document.getElementById("scpPeakLoad").textContent;
      const inverter = document.getElementById("scpInverter").textContent;
      const battery = document.getElementById("scpBattery").textContent;
      const solarSize = document.getElementById("scpSolarSize").textContent;
      const packageTier = document.getElementById("scpPackage").textContent;
      const priceRange = document.getElementById("scpPriceRange").textContent;
      
      // Here you would typically send this data to your server
      console.log("Quote Request:", {
        name,
        email,
        phone,
        propertyType,
        priority,
        dailyEnergy,
        peakLoad,
        inverter,
        battery,
        solarSize,
        packageTier,
        priceRange
      });
      
      // Show success message
      modalForm.style.display = "none";
      successMessage.style.display = "block";
      
      // Auto close after 3 seconds
      setTimeout(() => {
        closeModalFunc();
      }, 3000);
    }
  });

  nextBtn.addEventListener("click", function () {
    if (currentStep < totalSteps) {
      currentStep++;
      showStep(currentStep);
    } else {
      calculateResults();
    }
  });

  prevBtn.addEventListener("click", function () {
    if (currentStep > 1) {
      currentStep--;
      showStep(currentStep);
    }
  });

  renderTabs();
  renderAppliances();
  updateChoiceCards();
  showStep(currentStep);
});