import { L, formatCurrency } from "../services/i18n.js";

export async function renderCalculatorView(state) {
  const html = `
    <div class="section-container fade-in">
      <div class="calculator-container-max">
        
        <div class="calculator-header">
          <p class="section-tagline">${L("Simulador Financiero", "Financial Simulator")}</p>
          <h2>${L("Calculadora Hipotecaria Avanzada", "Advanced Mortgage Calculator")}</h2>
          <p>${L("Calcula tus aportaciones mensuales, desglosa el pago de capital e interés y simula tu tabla de amortización completa en segundos.", "Calculate your monthly payments, break down principal and interest, and simulate your full amortization schedule in seconds.")}</p>
        </div>

        <div class="calculator-split">
          
          <!-- Entradas del Simulador -->
          <div class="calculator-input-card glass-premium">
            <h3>${L("1. Parámetros del Crédito", "1. Loan Parameters")}</h3>
            
            <div class="calculator-input-group-stack">
              <div class="filter-group">
                <label>${L("Valor de la Propiedad ($ MXN)", "Property Value ($ MXN)")}</label>
                <input type="number" class="filter-input" id="sim-price" value="5000000" step="50000">
              </div>

              <div class="filter-group">
                <label>${L("Enganche (%)", "Down Payment (%)")}</label>
                <input type="number" class="filter-input" id="sim-down-pct" value="20" min="10" max="90">
              </div>

              <div class="calculator-grid-half">
                <div class="filter-group">
                  <label>${L("Tasa Anual (%)", "Annual Rate (%)")}</label>
                  <input type="number" class="filter-input" id="sim-rate" value="10.25" step="0.05">
                </div>
                <div class="filter-group">
                  <label>${L("Plazo (Años)", "Term (Years)")}</label>
                  <select class="filter-select" id="sim-years">
                    <option value="5">5 ${L("Años", "Years")}</option>
                    <option value="10">10 ${L("Años", "Years")}</option>
                    <option value="15">15 ${L("Años", "Years")}</option>
                    <option value="20" selected>20 ${L("Años", "Years")}</option>
                    <option value="30">30 ${L("Años", "Years")}</option>
                  </select>
                </div>
              </div>
              
              <div class="calculator-input-footer-summary">
                <div class="calculator-input-footer-row">
                  <span>${L("Enganche Requerido:", "Required Down Payment:")}</span>
                  <strong id="sim-down-cash">$0</strong>
                </div>
                <div class="calculator-input-footer-row">
                  <span>${L("Monto Total del Crédito:", "Total Loan Amount:")}</span>
                  <strong id="sim-loan-principal">$0</strong>
                </div>
              </div>

              <button class="btn btn-primary btn-full-width margin-top-sm" id="sim-calc-btn">${L("Recalcular Amortización", "Recalculate Amortization")}</button>
            </div>
          </div>

          <!-- Resultados y Desglose -->
          <div>
            <div class="calc-result-display calculator-result-card glass-premium">
              <span class="calc-result-title">${L("Pago Mensual Estimado", "Estimated Monthly Payment")}</span>
              <p class="monthly-payment-amount" id="sim-payment-out">$0.00</p>
              <p class="cat-info">${L("Tasa Fija Cat Promedio 12.8% sin IVA", "Fixed Rate Avg. APR 12.8% excl. VAT")}</p>
              <p class="calc-disclaimer">${L("*Cálculo simulado con fines informativos. Para mayores informes o asesoría hipotecaria personalizada, contacta a un asesor.", "*Simulated calculation for informational purposes. For more information or personalized mortgage advice, contact an advisor.")}</p>
              <a href="https://wa.me/525512345678?text=${encodeURIComponent(L("Hola, realicé una simulación hipotecaria en MudaT y me gustaría recibir mayores informes con un asesor.", "Hello, I ran a mortgage simulation on MudaT and would like more information from an advisor."))}" target="_blank" rel="noopener" class="btn btn-primary" id="sim-contact-advisor-btn">
                <i data-lucide="message-circle" class="icon-inline icon-lg"></i> ${L("Contactar a un Asesor", "Contact an Advisor")}
              </a>
            </div>
            
            <div class="margin-top-lg">
              <h3 class="calculator-table-header">${L("Tabla de Amortización Anual", "Annual Amortization Schedule")}</h3>
              <div class="comparator-table-wrapper">
                <table class="comparator-table">
                  <thead>
                    <tr>
                      <th>${L("Año", "Year")}</th>
                      <th>${L("Pago Anual", "Annual Payment")}</th>
                      <th>${L("Abono a Capital", "Principal Paid")}</th>
                      <th>${L("Pago Intereses", "Interest Paid")}</th>
                      <th>${L("Saldo Restante", "Remaining Balance")}</th>
                    </tr>
                  </thead>
                  <tbody id="amortization-table-body">
                    <!-- Se llena dinámicamente -->
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  `;

  function init(appState) {
    const priceInput = document.getElementById("sim-price");
    const downPctInput = document.getElementById("sim-down-pct");
    const rateInput = document.getElementById("sim-rate");
    const yearsSelect = document.getElementById("sim-years");
    
    const outDownCash = document.getElementById("sim-down-cash");
    const outPrincipal = document.getElementById("sim-loan-principal");
    const outPayment = document.getElementById("sim-payment-out");
    const tableBody = document.getElementById("amortization-table-body");

    let lastMonthlyPayment = 0;

    function formatMXN(num) {
      return formatCurrency(num, "MXN");
    }

    function calculateMortgage() {
      const price = parseFloat(priceInput.value) || 0;
      const downPct = parseFloat(downPctInput.value) || 0;
      const downpayment = price * (downPct / 100);
      const principal = price - downpayment;

      const annualRate = parseFloat(rateInput.value) || 0;
      const monthlyRate = (annualRate / 12) / 100;
      const years = parseInt(yearsSelect.value) || 20;
      const totalMonths = years * 12;

      let monthlyPayment = 0;
      if (principal > 0) {
        if (monthlyRate > 0) {
          monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
        } else {
          monthlyPayment = principal / totalMonths;
        }
      }
      lastMonthlyPayment = Math.round(monthlyPayment);

      // Render general details
      outDownCash.textContent = formatMXN(downpayment);
      outPrincipal.textContent = formatMXN(principal);
      outPayment.textContent = formatMXN(monthlyPayment);

      // Render Amortization Schedule (Year-by-Year)
      let balance = principal;
      let tableHtml = "";
      const yearlyPayment = monthlyPayment * 12;

      for (let year = 1; year <= Math.min(years, 10); year++) {
        let yearlyInterest = 0;
        let yearlyPrincipalPaid = 0;

        for (let month = 1; month <= 12; month++) {
          const interestMonth = balance * monthlyRate;
          const principalMonth = monthlyPayment - interestMonth;
          yearlyInterest += interestMonth;
          yearlyPrincipalPaid += principalMonth;
          balance -= principalMonth;
        }

        // Avoid negative values
        balance = Math.max(0, balance);

        tableHtml += `
          <tr>
            <td class="font-bold">${L("Año", "Year")} ${year}</td>
            <td>${formatMXN(yearlyPayment)}</td>
            <td class="color-success font-semibold">${formatMXN(yearlyPrincipalPaid)}</td>
            <td class="color-danger">${formatMXN(yearlyInterest)}</td>
            <td class="font-bold">${formatMXN(balance)}</td>
          </tr>
        `;
      }

      if (years > 10) {
        tableHtml += `
          <tr>
            <td colspan="5" class="text-muted font-italic bg-primary">... ${L(`Desglose simplificado de los años restantes hasta completar los ${years} años`, `Simplified breakdown of remaining years up to ${years} years`)} ...</td>
          </tr>
        `;
      }

      tableBody.innerHTML = tableHtml;
    }

    // Bind recalculate
    document.getElementById("sim-calc-btn").addEventListener("click", calculateMortgage);
    
    // Bind inputs changes to auto-recalculate
    priceInput.addEventListener("input", calculateMortgage);
    downPctInput.addEventListener("input", calculateMortgage);
    rateInput.addEventListener("input", calculateMortgage);
    yearsSelect.addEventListener("change", calculateMortgage);

    // Apply first calculation
    calculateMortgage();
  }

  return { html, init };
}

