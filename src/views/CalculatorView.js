import { updateUserProfile } from "../services/auth.js";

export async function renderCalculatorView(state) {
  const html = `
    <div class="section-container fade-in">
      <div class="calculator-container-max">
        
        <div class="calculator-header">
          <p class="section-tagline">Simulador Financiero</p>
          <h2>Calculadora Hipotecaria Avanzada</h2>
          <p>Calcula tus aportaciones mensuales, desglosa el pago de capital e interés y simula tu tabla de amortización completa en segundos.</p>
        </div>

        <div class="calculator-split">
          
          <!-- Entradas del Simulador -->
          <div class="calculator-input-card glass-premium">
            <h3>1. Parámetros del Crédito</h3>
            
            <div class="calculator-input-group-stack">
              <div class="filter-group">
                <label>Valor de la Propiedad ($ MXN)</label>
                <input type="number" class="filter-input" id="sim-price" value="5000000" step="50000">
              </div>

              <div class="filter-group">
                <label>Enganche (%)</label>
                <input type="number" class="filter-input" id="sim-down-pct" value="20" min="10" max="90">
              </div>

              <div class="calculator-grid-half">
                <div class="filter-group">
                  <label>Tasa Anual (%)</label>
                  <input type="number" class="filter-input" id="sim-rate" value="10.25" step="0.05">
                </div>
                <div class="filter-group">
                  <label>Plazo (Años)</label>
                  <select class="filter-select" id="sim-years">
                    <option value="5">5 Años</option>
                    <option value="10">10 Años</option>
                    <option value="15">15 Años</option>
                    <option value="20" selected>20 Años</option>
                    <option value="30">30 Años</option>
                  </select>
                </div>
              </div>
              
              <div class="calculator-input-footer-summary">
                <div class="calculator-input-footer-row">
                  <span>Enganche Requerido:</span>
                  <strong id="sim-down-cash">$0</strong>
                </div>
                <div class="calculator-input-footer-row">
                  <span>Monto Total del Crédito:</span>
                  <strong id="sim-loan-principal">$0</strong>
                </div>
              </div>

              <button class="btn btn-primary btn-full-width margin-top-sm" id="sim-calc-btn">Recalcular Amortización</button>
            </div>
          </div>

          <!-- Resultados y Desglose -->
          <div>
            <div class="calc-result-display calculator-result-card glass-premium">
              <span class="calc-result-title">Pago Mensual Estimado</span>
              <p class="monthly-payment-amount" id="sim-payment-out">$0.00</p>
              <p class="cat-info">Tasa Fija Cat Promedio 12.8% sin IVA</p>
              <button class="btn btn-success" id="sim-preapprove-btn">
                <i data-lucide="check-circle" class="icon-inline icon-lg"></i> Pre-Aprobación Bancaria Digital
              </button>
            </div>
            
            <div class="margin-top-lg">
              <h3 class="calculator-table-header">Desglose del Primer Año</h3>
              <div class="comparator-table-wrapper">
                <table class="comparator-table">
                  <thead>
                    <tr>
                      <th>Año</th>
                      <th>Pago Anual</th>
                      <th>Abono a Capital</th>
                      <th>Pago Intereses</th>
                      <th>Saldo Restante</th>
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

    function formatMXN(num) {
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        maximumFractionDigits: 0
      }).format(num);
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
            <td class="font-bold">Año ${year}</td>
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
            <td colspan="5" class="text-muted font-italic bg-primary">... Desglose simplificado de los años restantes hasta completar los ${years} años ...</td>
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

    // Preapproval button action
    document.getElementById("sim-preapprove-btn").addEventListener("click", () => {
      if (!appState.currentUser) {
        alert("Por favor inicia sesión para procesar tu pre-aprobación hipotecaria.");
        return;
      }
      const price = parseFloat(priceInput.value) || 0;
      const principal = price * (1 - (parseFloat(downPctInput.value)/100));

      const credits = appState.currentUser.credits || [];
      credits.push({
        id: `cred-${Date.now()}`,
        bank: "MudaT Pre-Aprobado (Simulación Completa)",
        amount: principal,
        status: "Pre-Aprobado en 5 min",
        monthlyPayment: parseFloat(outPayment.textContent.replace(/[^0-9]/g, '')) || 0
      });
      appState.currentUser.credits = credits;
      updateUserProfile(appState.currentUser);
      
      alert("¡Felicidades Sergio! Tu crédito hipotecario por " + formatMXN(principal) + " ha sido Pre-Aprobado de forma digital gracias a tu excelente historial crediticio y documentos en plataforma. Revisa tu certificado de pre-aprobación en tu perfil.");
    });
  }

  return { html, init };
}

