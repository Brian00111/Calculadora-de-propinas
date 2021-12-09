const form = document.querySelector("#form");
const cliente = document.querySelector("#cliente");
let pedido = {};

function save(e) {
  e.preventDefault();
  const numTable = document.querySelector("#mesaPedido");
  const timeTable = document.querySelector("#horaPedido");

  if (!isNaN(numTable.value) && timeTable.value.length > 0) {
    pedido.mesa = numTable.value;
    pedido.hora = timeTable.value;

    api(e);
  } else {
    createError("input");
  }
}

function createError(error) {
  let content = document.querySelector("#pedido");
  let p = document.createElement("p");
  p.className = "alert alert-danger mt-2 opacity-75";

  if (error === "input") {
    p.textContent = "Todos los campos son obligatorios";
  }
  content.appendChild(p);

  setTimeout(() => {
    p.remove();
  }, 1500);
}

async function api(e) {
  let request = await fetch("http://127.0.0.1:4000/platillos");
  let response = await request.json();

  createResponse(response, e);
}

async function createResponse(response, e) {
  e.stopPropagation();

  let formulario = document.querySelector("#pedido");
  let dates = await response;
  let title = document.querySelector(".title-platillos");
  let sectionPlatillos = document.querySelector(".contentPlatillos");

  dates.map(({ id, nombre, precio, categoria }) => {
    let tipo =
      categoria === 1
        ? "comida"
        : categoria === 2
        ? "Bebidas"
        : categoria === 3
        ? "Postres"
        : null;

    let plato = document.createElement("tr");
    let td = document.createElement("td");
    let input = document.createElement("input");
    input.type = "number";
    input.min = 0;
    input.max = 100;
    input.value = "0";
    input.dataset.id = id;
    input.className = "form-control";
    input.onchange = (e) => {
      cargarPlatos(e, pedido, dates, id);
    };

    plato.style.height = "50px";
    plato.innerHTML = `
        <td>${nombre}</td>
        <td style="width: 100px; text-align:center;"><b>$${precio}</b></td>
        <td style="width: 70px;">${tipo}</td>
    `;

    td.appendChild(input);
    plato.appendChild(td);
    sectionPlatillos.appendChild(plato);
  });

  title.classList.remove("d-none");
  formulario.classList.add("expansed");
}

function cargarPlatos({ target: { value } }, { mesa, hora }, date, id) {
  this.value = Number(value);

  if (this.value < 1 && document.querySelector(`div[data-id="${id}"]`)) {
    document.querySelector(`div[data-id="${id}"]`).remove();
    document.querySelector("#cliente .btnGuardar").remove();
    document.querySelector(".contentDetails .cliente").remove();
    document.querySelector(".contentDetails .propinas").remove();

    pedido.platos = pedido.platos.filter((elementos) => elementos[1] !== id);

    return;
  }
  let elemento = date.filter((element) => element.id === id)[0];
  let precio = elemento.precio;
  let name = elemento.nombre;

  let content = document.querySelector("#cliente");
  let title = content.querySelector("h2");
  let details = content.querySelector(".contentDetails");
  let table = document.createElement("div");
  table.className = "cliente";

  let btnDelete = document.createElement("button");
  btnDelete.className = "btn btn-danger";
  btnDelete.dataset.id = id;
  btnDelete.textContent = "eliminar";
  btnDelete.onclick = ({ target }) => deletePlato(target);

  let btnGuardar = document.createElement("button");
  btnGuardar.className = "btn btn-primary d-block m-auto mt-4 btnGuardar";
  btnGuardar.textContent = "Guardar Cliente";
  btnGuardar.onclick = () => guardarCliente();

  if (content.querySelector(".cliente")) {
    pedido.platos.map((elemento) => {
      if (elemento[1] === id && this.value > 1) {
        document.querySelector(
          `.cliente > div[data-id="${id}"] .cantidad span`
        ).textContent = value++;
        document.querySelector(
          `.cliente > div[data-id="${id}"] .subtotal span`
        ).textContent = precio * value - precio;

        let filtrar = pedido.platos.filter((elementos) => elementos[1] !== id);
        pedido.platos = filtrar;

        let platosNuevos = [
          ...pedido.platos,
          [name, id, precio, this.value, precio * value - precio],
        ];
        pedido.platos = platosNuevos;
      }
      if (elemento[1] === id && this.value === 1) {
        document.querySelector(
          `.cliente > div[data-id="${id}"] .cantidad span`
        ).textContent = value;
        document.querySelector(
          `.cliente > div[data-id="${id}"] .subtotal span`
        ).textContent = precio;

        let filtrar = pedido.platos.filter((elementos) => elementos[1] !== id);
        pedido.platos = filtrar;

        let platosNuevos = [
          ...pedido.platos,
          [name, id, precio, this.value, precio],
        ];
        pedido.platos = platosNuevos;
      }
    });

    if (!document.querySelector(`div[data-id="${id}"]`)) {
      let newPlato = document.createElement(`div`);
      newPlato.style.borderTop = "1px solid #d9d9d9";
      newPlato.className = "plato";
      newPlato.dataset.id = id;
      newPlato.innerHTML = `
        <h5>-${name}</h5>
        <p class="cantidad"><b>Cantidad</b> <span>${value}</span></p>
        <p><b>Precio</b>$${precio}</p>
        <p class="subtotal"><b>Subtotal:</b>$<span>${precio}</span></p>
      `;
      newPlato.appendChild(btnDelete);
      document.querySelector(".cliente").appendChild(newPlato);

      let platosNuevos = [
        ...pedido.platos,
        [name, id, precio, this.value, precio],
      ];
      pedido.platos = platosNuevos;
    } else {
      return;
    }
  } else {
    let platosNuevos = [[name, id, precio, this.value, precio]];
    pedido.platos = platosNuevos;

    table.innerHTML = `
      <p><span class="iconify" data-icon="ic:round-table-restaurant"></span><b>Mesa:</b> ${mesa}</p>
      <p><span class="iconify" data-icon="bi:clock-fill"></span><b>Hora:</b> ${hora}</p>

      <h4>Platos Pedidos</h4>
    <div data-id="${id}" class="plato">
      <h5>-${name}</h5>
      <p class="cantidad"><b>Cantidad</b> <span>${value}</span></p>
      <p><b>Precio</b>$${precio}</p>
      <p class="subtotal"><b>Subtotal:</b>$<span>${precio}</span></p>        
    </div>
  `;
    table.querySelector(".plato").appendChild(btnDelete);
    details.appendChild(table);
    propinas("crear");
  }

  if (!content.querySelector(".btnGuardar")) {
    content.appendChild(btnGuardar);
  }

  title.classList.remove("d-none");
  content.style.display = "block";
  content.querySelector(".contentCliente").style.paddingbottom = "3em";
  details.classList.remove("activo");
}

function deletePlato(plato) {
  let dataId = plato.dataset.id;
  let platoActual = document.querySelector(`div[data-id="${dataId}"]`);

  let filtrar = pedido.platos.filter(
    (elementos) => elementos[1] !== Number(dataId)
  );

  if (document.querySelector(`input[data-id="${dataId}"]`)) {
    document.querySelector(`input[data-id="${dataId}"]`).value = "0";
  }

  pedido.platos = filtrar;
  platoActual.remove();
  document.querySelector("#cliente .btnGuardar").remove();
  document.querySelector(".contentDetails .cliente").remove();
  document.querySelector(".contentDetails .propinas").remove();
}

function propinas(llamado) {
  let content = document.querySelector("#cliente .contentDetails");

  if (llamado === "crear") {
    let contentPropinas = document.createElement("div");
    contentPropinas.className = "propinas";
    contentPropinas.innerHTML = `
      <h3>Propinas</h3>

      <div class="inputs">
          <label class="check" for="10%">
            <input type="checkbox" name="10%" value="10" id="10%">
            <span class="checkmark"></span>
            10%
          </label>

          <label class="check" for="25%">
            <input type="checkbox" name="25%" value="25" id="25%">
            <span class="checkmark"></span>
            25%
          </label>

          <label class="check" for="50%">
            <input type="checkbox" name="50%" value="50" id="50%">
            <span class="checkmark"></span>
            50%
          </label>
      </div>
    `;
    content.appendChild(contentPropinas);
  }
}

function calcularPropina({ target: { type, value, checked } }) {
  this.value = Number(value);

  let calculos = document.querySelector(".calculos");

  if (calculos) {
    calculos.remove();
  }

  if (checked === true && type === "checkbox") {
    let content = document.querySelector(".propinas");
    let calculosContent = document.createElement("div");
    calculosContent.className = "calculos";
    let calcSubtotal = pedido.platos
      .map((element) => element[4])
      .reduce((a, b) => a + b);

    let calcPropina = Math.ceil((calcSubtotal * this.value) / 100);
    let totalPagar = calcSubtotal + calcPropina;

    calculosContent.innerHTML = `
    <p class="subtotal"><b>Subtotal Consumo</b>: $<span>${calcSubtotal}</span></p>
    <p class="calcPropina"><b>Propina</b>: $<span>${calcPropina}</span></p>
    <p class="total"><b>Total a Pagar</b>: $<span>${totalPagar}</span></p>
  `;
    content.appendChild(calculosContent);
    return;
  }
}

function guardarCliente() {
  let spinner = document.querySelector(".spinner");
  spinner.classList.toggle("d-block");

  if (localStorage.getItem("clientes")) {
    let clienteGuardados = JSON.parse(localStorage.getItem("clientes"));
    let agregarNuevo = [...clienteGuardados, pedido];

    localStorage.setItem("clientes", JSON.stringify(agregarNuevo));
  } else {
    let pedidoActual = JSON.stringify([pedido]);
    localStorage.setItem("clientes", pedidoActual);
  }
  setTimeout(() => {
    spinner.classList.toggle("d-block");
  }, 2000);
}

function cargarClientes() {
  let clientesGuardados = JSON.parse(localStorage.getItem("clientes"));
  let content = document.querySelector(".contentClientesRecientes");
  let title = content.querySelector("h2");
  let details = content.querySelector(".details");

  clientesGuardados.map((cliente) => {
    const { hora, mesa, platos } = cliente;
    let table = document.createElement("div");
    table.className = "clienteReciente";
    table.innerHTML = `
        <p><span class="iconify" data-icon="ic:round-table-restaurant"></span><b>Mesa:</b> ${mesa}</p>
        <p><span class="iconify" data-icon="bi:clock-fill"></span><b>Hora:</b> ${hora}</p>
  
        <h4>Platos Pedidos</h4>
    `;
    platos.map((element) => {
      let plato = document.createElement("div");
      plato.className = "plato";
      plato.dataset.id = element[1];
      plato.innerHTML = `
        <h5>-${element[0]}</h5>
        <p class="cantidad"><b>Cantidad</b> <span>${element[3]}</span></p>
        <p><b>Precio</b>$${element[2]}</p>
        <p class="subtotal"><b>Subtotal:</b>$<span>${element[4]}</span></p> 
      `;
      table.appendChild(plato);
    });

    details.appendChild(table);
  });

  title.classList.remove("d-none");
  content.style.display = "block";
  content.style.paddingTop = "3em";
  details.classList.add("activo");
}

cliente.addEventListener("click", (e) => calcularPropina(e), false);
form.addEventListener("submit", (e) => save(e));
document.addEventListener("DOMContentLoaded", () => {
  let content = document.querySelector("#pedido");
  if (localStorage.getItem("clientes")) {
    let btnVerClientes = document.createElement("button");
    btnVerClientes.className =
      "btn btn-secondary d-block m-auto mt-4 btnGuardar";
    btnVerClientes.textContent = "ver clientes";
    btnVerClientes.onclick = () => {
      cargarClientes();
    };

    content.appendChild(btnVerClientes);
  }
});
