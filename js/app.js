// ==========================================
// ESTADO DE LA APLICACIÓN (Base de Datos en Memoria)
// ==========================================

if (!localStorage.getItem("wallet_balance")) {
    localStorage.setItem("wallet_balance", "500000");
}

if (!localStorage.getItem("wallet_transactions")) {
    let transaccionesIniciales = [
        { fecha: "10 Jul, 2026 - 14:32", tipo: "Depósito", desc: "Carga de Fondos", monto: 50000, icono: "📥", clase: "success" },
        { fecha: "09 Jul, 2026 - 21:15", tipo: "Transferencia", desc: "Regalo de cumpleaños", monto: -15000, icono: "📤", clase: "danger" },
        { fecha: "05 Jul, 2026 - 10:00", tipo: "Retiro", desc: "Cajero Automático", monto: -20000, icono: "📤", clase: "danger" }
    ];
    localStorage.setItem("wallet_transactions", JSON.stringify(transaccionesIniciales));
}

const contactosDisponibles = [
    "Kimberly Molina",
    "Juan Pérez",
    "María López",
    "Carlos Silva",
    "Ana Martínez"
];

// ==========================================
// LÓGICA CON JQUERY
// ==========================================
$(document).ready(function () {

    // --- EFECTOS VISUALES EN MENU.HTML ---
    if ($("#menu-container").length > 0) {
        $("#menu-container").hide().fadeIn(1000);
    }

    // --- ACTUALIZACIÓN DINÁMICA DE SALDO ---
    function renderizarSaldo() {
        if ($("#current-balance").length > 0) {
            let saldoActual = parseInt(localStorage.getItem("wallet_balance"));
            $("#current-balance")
                .text("$" + saldoActual.toLocaleString("es-CL"))
                .fadeOut(100).fadeIn(300);
        }
    }
    renderizarSaldo();

    // --- VALIDACIÓN DE LOGIN ---
    $("#form-login").on("submit", function (event) {
        event.preventDefault();
        let email = $("#email").val().trim();
        let password = $("#password").val();

        if (email === "kemberlin@correo.com" && password === "123456") {
            localStorage.setItem("wallet_user", "Kemberlin");
            window.location.href = "menu.html";
        } else {
            $(".card").addClass("border-danger").delay(500).queue(function (next) {
                $(this).removeClass("border-danger");
                next();
            });
            alert("❌ Credenciales incorrectas. (kemberlin@correo.com / 123456)");
        }
    });

    if ($("#user-greeting").length > 0) {
        let usuario = localStorage.getItem("wallet_user") || "Usuario";
        $("#user-greeting").text("¡Hola, " + usuario + "! 👋");
    }

    // --- REALIZAR DEPÓSITO (deposit.html) ---
    $("#form-deposit").on("submit", function (event) {
        event.preventDefault();
        let montoDeposito = parseInt($("#amount").val());
        let saldoActual = parseInt(localStorage.getItem("wallet_balance"));

        if (montoDeposito > 0) {
            let nuevoSaldo = saldoActual + montoDeposito;
            localStorage.setItem("wallet_balance", nuevoSaldo);

            let transacciones = JSON.parse(localStorage.getItem("wallet_transactions"));
            transacciones.unshift({
                fecha: "Hoy - " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                tipo: "Depósito",
                desc: "Depósito Web",
                monto: montoDeposito,
                icono: "📥",
                clase: "success"
            });
            localStorage.setItem("wallet_transactions", JSON.stringify(transacciones));

            // Abrimos el modal explícitamente
            $("#modalExitoDeposito").modal("show");
        }
    });

    // --- SOLUCIÓN DE REDIRECCIÓN FORZADA CON JQUERY ---
    $("#btn-redirigir-deposito").on("click", function () {
        window.location.href = "menu.html";
    });

    $("#btn-redirigir-transferencia").on("click", function () {
        window.location.href = "menu.html";
    });


    // --- AUTOCOMPLETADO EN SENDMONEY.HTML ---
    $("#search-contact").on("keyup", function () {
        let sugerenciasContenedor = $("#autocomplete-results");
        let texto = $(this).val().toLowerCase();
        sugerenciasContenedor.empty().hide();

        if (texto.length > 0) {
            let filtrados = contactosDisponibles.filter(c => c.toLowerCase().includes(texto));

            if (filtrados.length > 0) {
                sugerenciasContenedor.show();
                filtrados.forEach(contacto => {
                    sugerenciasContenedor.append(`<button type="button" class="list-group-item list-group-item-action py-2 item-sugerido">${contacto}</button>`);
                });
            }
        }
    });

    $(document).on("click", ".item-sugerido", function () {
        let nombreSeleccionado = $(this).text();
        $("#search-contact").val(nombreSeleccionado);
        $("#autocomplete-results").empty().hide();
    });

    // --- REALIZAR TRANSFERENCIA (sendmoney.html) ---
    $("#form-send-money").on("submit", function (event) {
        event.preventDefault();
        let montoEnvio = parseInt($("#send-amount").val());
        let saldoActual = parseInt(localStorage.getItem("wallet_balance"));
        let destinatario = $("#search-contact").val().trim();

        if (montoEnvio > saldoActual) {
            alert("❌ Saldo insuficiente para realizar esta transferencia.");
            return;
        }

        if (montoEnvio > 0 && destinatario !== "") {
            let nuevoSaldo = saldoActual - montoEnvio;
            localStorage.setItem("wallet_balance", nuevoSaldo);

            let transacciones = JSON.parse(localStorage.getItem("wallet_transactions"));
            transacciones.unshift({
                fecha: "Hoy - " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                tipo: "Transferencia",
                desc: "Envío a " + destinatario,
                monto: -montoEnvio,
                icono: "📤",
                clase: "danger"
            });
            localStorage.setItem("wallet_transactions", JSON.stringify(transacciones));

            $("#transfer-detail-text").text(`Has transferido $${montoEnvio.toLocaleString("es-CL")} con éxito a ${destinatario}.`);
            $("#modalExitoTransferencia").modal("show");
        }
    });

    // --- AGREGAR NUEVO CONTACTO ---
    $("#form-add-contact").on("submit", function (event) {
        event.preventDefault();
        let nombre = $("#contact-name").val().trim();
        let email = $("#contact-email").val().trim();

        contactosDisponibles.push(nombre);

        let nuevoItem = $(`
            <li class="list-group-item d-flex justify-content-between align-items-center px-0 py-3" style="display:none;">
                <div>
                    <h4 class="h6 mb-0 font-weight-bold">${nombre}</h4>
                    <small class="text-muted">${email}</small>
                </div>
                <span class="badge badge-pill badge-primary text-white p-2">Nuevo</span>
            </li>
        `);

        $("#lista-contactos").prepend(nuevoItem);
        nuevoItem.slideDown(500);

        $("#form-add-contact")[0].reset();
        $("#modalNuevoContacto").modal("hide");
    });

    // --- RENDERIZAR TABLA DE ÚLTIMOS MOVIMIENTOS ---
    if ($("#tabla-movimientos").length > 0) {
        let transacciones = JSON.parse(localStorage.getItem("wallet_transactions")) || [];
        let tbody = $("#tabla-movimientos");
        tbody.empty();

        transacciones.forEach(t => {
            let prefijo = t.monto > 0 ? "+" : "";
            let fila = `
                <tr>
                    <td class="text-muted align-middle">${t.fecha}</td>
                    <td class="align-middle">
                        <span class="badge p-2 rounded bg-light text-${t.clase}">${t.icono} ${t.tipo}</span>
                        <span class="ml-2 font-weight-bold">${t.desc}</span>
                    </td>
                    <td class="text-muted align-middle">Sistema Alke Wallet</td>
                    <td class="text-right text-${t.clase} font-weight-bold align-middle">${prefijo}$${Math.abs(t.monto).toLocaleString("es-CL")}</td>
                </tr>
            `;
            tbody.append(fila);
        });
    }
    // --- LÓGICA DE CIERRE DE SESIÓN ---
    $(document).on("click", "#btn-logout", function (event) {
        // Evitamos que se redireccione antes de limpiar los datos
        event.preventDefault();

        // Removemos los datos de sesión del usuario
        localStorage.removeItem("wallet_user");

        // Redirigimos de forma segura a la página principal de bienvenida
        window.location.href = "index.html";
    });
});