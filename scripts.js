// Función para disparar confeti
function shootConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
}

// Disparar confeti al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  shootConfetti();
});

// Función para agregar participantes
function addParticipant() {
  const container = document.getElementById("participantsContainer");
  const div = document.createElement("div");
  div.className = "input-group mb-2";
  div.innerHTML = `
    <input type="text" class="form-control participant" placeholder="Nombre del participante" required oninput="updateCooperantes()">
    <button type="button" class="btn btn-outline-danger" onclick="removeParticipant(this)">
      <i class="bi bi-trash"></i>
    </button>
  `;
  container.appendChild(div);
}

// Función para eliminar participantes
function removeParticipant(button) {
  button.closest(".input-group").remove();
  updateCooperantes(); // Actualizar cooperantes al eliminar un participante
}

// Función para agregar elementos
function addElement() {
  const container = document.getElementById("elementsContainer");
  const card = document.createElement("div");
  card.className = "card mb-3";
  card.innerHTML = `
    <div class="card-body">
      <div class="row">
        <div class="col-md-4">
          <input type="text" class="form-control mb-2" placeholder="Nombre del elemento (ej. Pastel)" required>
        </div>
        <div class="col-md-3">
          <input type="number" class="form-control mb-2" placeholder="Costo ($)" min="0" required>
        </div>
        <div class="col-md-5">
          <label class="form-label">Cooperantes:</label>
          <button type="button" class="btn btn-outline-secondary btn-sm mb-2" onclick="selectAllCooperantes(this)">
            <i class="bi bi-check-all"></i> Seleccionar todos
          </button>
          <div class="cooperantes"></div>
        </div>
        <div class="col-md-12 text-end">
          <button type="button" class="btn btn-outline-danger btn-sm" onclick="removeElement(this)">
            <i class="bi bi-trash"></i> Eliminar elemento
          </button>
        </div>
      </div>
    </div>
  `;
  container.appendChild(card);
  updateCooperantes(); // Actualizar cooperantes al agregar un elemento
}

// Función para eliminar un elemento
function removeElement(button) {
  button.closest(".card").remove();
}

// Función para actualizar los checkboxes de cooperantes
function updateCooperantes() {
  const participants = document.querySelectorAll(".participant");
  const cooperantesContainers = document.querySelectorAll(".cooperantes");

  cooperantesContainers.forEach(container => {
    const existingCheckboxes = Array.from(container.querySelectorAll("input[type='checkbox']"));
    const checkedValues = existingCheckboxes.filter(checkbox => checkbox.checked).map(checkbox => checkbox.value);

    container.innerHTML = ""; // Limpiar el contenedor de cooperantes
    participants.forEach(participant => {
      const participantName = participant.value.trim();
      if (participantName) { // Solo agregar si el nombre no está vacío
        const label = document.createElement("label");
        label.className = "form-check";
        label.innerHTML = `
          <input type="checkbox" class="form-check-input" value="${participantName}" ${checkedValues.includes(participantName) ? "checked" : ""}>
          ${participantName}
        `;
        container.appendChild(label);
      }
    });
  });
}

// Función para seleccionar todos los cooperantes en un elemento
function selectAllCooperantes(button) {
  const cooperantesContainer = button.closest(".col-md-5").querySelector(".cooperantes");
  const checkboxes = cooperantesContainer.querySelectorAll("input[type='checkbox']");
  checkboxes.forEach(checkbox => {
    checkbox.checked = true;
  });
}

// Función para calcular los costos
document.getElementById("birthdayForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const resultsContent = document.getElementById("resultsContent");
  resultsContent.innerHTML = "";

  // Obtener datos
  const birthdayPerson = document.getElementById("birthdayPerson").value;
  const participants = Array.from(document.querySelectorAll(".participant")).map(input => input.value.trim()).filter(Boolean);
  const elements = Array.from(document.querySelectorAll("#elementsContainer .card")).map(card => {
    const name = card.querySelector("input[type='text']").value;
    const cost = parseFloat(card.querySelector("input[type='number']").value);
    const cooperantes = Array.from(card.querySelectorAll(".cooperantes input:checked")).map(checkbox => checkbox.value);
    return { name, cost, cooperantes };
  });

  // Calcular costos
  const totalCost = elements.reduce((sum, element) => sum + element.cost, 0);
  const participantCosts = {};

  participants.forEach(participant => {
    participantCosts[participant] = {
      total: 0,
      details: {}
    };
  });

  elements.forEach(element => {
    const costPerPerson = element.cost / element.cooperantes.length;
    element.cooperantes.forEach(cooperante => {
      participantCosts[cooperante].total += costPerPerson;
      participantCosts[cooperante].details[element.name] = (participantCosts[cooperante].details[element.name] || 0) + costPerPerson;
    });
  });

  // Mostrar resultados
  resultsContent.innerHTML = `
    <p><strong>Costo total:</strong> $${totalCost.toFixed(2)}</p>
    <p><strong>Cumpleañero:</strong> ${birthdayPerson} (no paga)</p>
    <h5>Detalle por participante:</h5>
    <div class="table-responsive">
      <table class="table table-striped table-bordered text-center">
        <thead class="table-dark">
          <tr>
            <th>Participante</th>
            ${elements.map(element => `<th>${element.name}</th>`).join("")}
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${participants.map(participant => `
            <tr>
              <td>${participant}</td>
              ${elements.map(element => `
                <td>$${(participantCosts[participant].details[element.name] || 0).toFixed(2)}</td>
              `).join("")}
              <td><strong>$${participantCosts[participant].total.toFixed(2)}</strong></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;

  // Mostrar la sección de resultados y hacer scroll
  document.getElementById("results").classList.remove("d-none");
  document.getElementById("results").scrollIntoView({ behavior: "smooth" });

  // Disparar confeti al mostrar resultados
  shootConfetti();
});

// Función para capturar y copiar la imagen de los resultados
document.getElementById("copyButton").addEventListener("click", function () {
  const resultsCard = document.getElementById("results");

  // Guardar el fondo original
  const originalBackground = document.querySelector(".background-blur").style.backgroundImage;

  // Eliminar temporalmente la imagen de fondo
  document.querySelector(".background-blur").style.backgroundImage = "none";

  // Usar html2canvas para capturar la sección de resultados
  html2canvas(resultsCard).then(canvas => {
    // Restaurar la imagen de fondo
    document.querySelector(".background-blur").style.backgroundImage = originalBackground;

    // Convertir el canvas a una imagen PNG
    canvas.toBlob(blob => {
      // Copiar la imagen al portapapeles
      if (navigator.clipboard && navigator.clipboard.write) {
        navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob })
        ]).then(() => {
          // Mostrar el modal de confirmación
          const copyModal = new bootstrap.Modal(document.getElementById("copyModal"));
          copyModal.show();

          // Cerrar el modal automáticamente después de 3 segundos
          setTimeout(() => {
            copyModal.hide();
          }, 3000);
        }).catch(err => {
          console.error("Error al copiar la imagen:", err);
          alert("No se pudo copiar la captura. Inténtalo de nuevo.");
        });
      } else {
        alert("Tu navegador no soporta la copia al portapapeles. Intenta usar Chrome o Edge.");
      }
    });
  });
});

// Actualizar cooperantes al cargar la página
document.addEventListener("DOMContentLoaded", updateCooperantes);