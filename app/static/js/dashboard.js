// Productos iniciales (estado local)
const productosIniciales = [
    { id: 1, producto: "Laptop HP ProBook 450", categoria: "Computadoras", stock: 15, precio: 15000 },
    { id: 2, producto: "Mouse Logitech M185", categoria: "Accesorios", stock: 25, precio: 350 },
    { id: 3, producto: "Monitor Samsung 24\"", categoria: "Monitores", stock: 8, precio: 4500 },
    { id: 4, producto: "Teclado Mecánico Redragon", categoria: "Accesorios", stock: 12, precio: 1250 },
    { id: 5, producto: "Impresora Epson L3250", categoria: "Impresoras", stock: 6, precio: 5800 },
    { id: 6, producto: "Disco SSD Kingston 1TB", categoria: "Almacenamiento", stock: 20, precio: 1900 },
    { id: 7, producto: "Memoria RAM Kingston 16GB", categoria: "Componentes", stock: 18, precio: 1350 },
    { id: 8, producto: "Router TP-Link Archer C6", categoria: "Redes", stock: 10, precio: 1100 },
    { id: 9, producto: "Cámara Web Logitech C920", categoria: "Accesorios", stock: 9, precio: 2100 },
    { id: 10, producto: "Laptop Dell Inspiron 15", categoria: "Computadoras", stock: 7, precio: 18500 },
    { id: 11, producto: "Switch Cisco 24 Puertos", categoria: "Redes", stock: 5, precio: 6800 },
    { id: 12, producto: "SSD Samsung 500GB", categoria: "Almacenamiento", stock: 14, precio: 1450 },
    { id: 13, producto: "Monitor LG UltraWide 29\"", categoria: "Monitores", stock: 4, precio: 6900 },
    { id: 14, producto: "UPS APC 1200VA", categoria: "Energía", stock: 6, precio: 3200 },
    { id: 15, producto: "Proyector Epson X49", categoria: "Proyectores", stock: 3, precio: 9800 }
];

// Estado local
let productosState = [...productosIniciales];
let productosSortMode = "default";
let productosFocusId = null;

// Categorías iniciales y estado
const categoriasIniciales = [
    { id: 1, nombre: "Computadoras", descripcion: "Equipos de escritorio y portátiles" },
    { id: 2, nombre: "Monitores", descripcion: "Pantallas y monitores" },
    { id: 3, nombre: "Accesorios", descripcion: "Mouse, teclados, cámaras y periféricos" },
    { id: 4, nombre: "Componentes", descripcion: "RAM, tarjetas, procesadores y hardware interno" },
    { id: 5, nombre: "Almacenamiento", descripcion: "SSD, HDD y memorias externas" },
    { id: 6, nombre: "Redes", descripcion: "Routers, switches y puntos de acceso" },
    { id: 7, nombre: "Impresoras", descripcion: "Impresoras y multifuncionales" },
    { id: 8, nombre: "Energía", descripcion: "UPS, reguladores y baterías" },
    { id: 9, nombre: "Audio", descripcion: "Bocinas, audífonos y micrófonos" },
    { id: 10, nombre: "Proyectores", descripcion: "Equipos de proyección" },
    { id: 11, nombre: "Software", descripcion: "Licencias y programas" },
    { id: 12, nombre: "Consumibles", descripcion: "Tóner, tinta, papel y suministros" },
    { id: 13, nombre: "Mobiliario", descripcion: "Escritorios, sillas y muebles" },
    { id: 14, nombre: "Seguridad", descripcion: "Cámaras, DVR y controles de acceso" },
    { id: 15, nombre: "Herramientas", descripcion: "Kits de mantenimiento y reparación" }
];

let categoriasState = [...categoriasIniciales];

function actualizarHora() {
    const fecha = new Date();
    const hora = fecha.getHours().toString().padStart(2, "0");
    const minutos = fecha.getMinutes().toString().padStart(2, "0");
    const segundos = fecha.getSeconds().toString().padStart(2, "0");
    const el = document.getElementById("hora");
    if (el) el.innerHTML = `${hora}:${minutos}:${segundos}`;
}

function cerrarSesion() {
    localStorage.removeItem("isAuthenticated");
    window.location.href = "/login";
}

function formatearPrecio(precio) {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 0
    }).format(precio);
}

function getProductosOrdenados(productos = productosState) {
    const lista = [...productos];

    switch (productosSortMode) {
        case "stock-asc":
            return lista.sort((a, b) => Number(a.stock) - Number(b.stock));
        case "stock-desc":
            return lista.sort((a, b) => Number(b.stock) - Number(a.stock));
        case "precio-asc":
            return lista.sort((a, b) => Number(a.precio) - Number(b.precio));
        case "precio-desc":
            return lista.sort((a, b) => Number(b.precio) - Number(a.precio));
        case "nombre-asc":
            return lista.sort((a, b) => (a.producto || "").toString().localeCompare((b.producto || "").toString()));
        case "categoria-asc":
            return lista.sort((a, b) => (a.categoria || "").toString().localeCompare((b.categoria || "").toString()));
        default:
            return lista;
    }
}

function getAlertasProductos(productos = productosState) {
    return productos.filter((producto) => Number(producto.stock) <= 5);
}

function getProductosParaMostrar(productos = productosState) {
    const lista = getProductosOrdenados(productos);
    if (productosFocusId !== null) {
        return lista.filter((producto) => Number(producto.id) === Number(productosFocusId));
    }
    return lista;
}

function renderNotificationsPanel() {
    const badge = document.getElementById("notificationCount");
    const panel = document.getElementById("notificationPanel");
    const list = document.getElementById("notificationList");
    const toggle = document.getElementById("notificationToggle");

    if (!badge || !panel || !list || !toggle) return;

    const alertas = getAlertasProductos();
    const count = alertas.length;

    badge.textContent = count;
    badge.classList.toggle("is-hidden", count === 0);

    if (count === 0) {
        list.innerHTML = '<div class="notification-empty">No hay alertas por el momento.</div>';
        return;
    }

    list.innerHTML = alertas.map((producto) => `
        <button type="button" class="notification-item notification-link" data-product-id="${producto.id}">
            <div class="notification-title">${producto.producto}</div>
            <div class="notification-meta">Stock bajo: ${producto.stock} unidades</div>
            <span class="notification-link-text">Ver producto</span>
        </button>
    `).join("");

    list.querySelectorAll("[data-product-id]").forEach((button) => {
        button.addEventListener("click", () => {
            productosFocusId = Number(button.getAttribute("data-product-id"));
            panel.classList.add("hidden");
            toggle.setAttribute("aria-expanded", "false");
            renderProductosModule();
        });
    });
}

// Mostrar errores en el DOM para facilitar debugging cuando el script falle
window.addEventListener('error', (ev) => {
    const main = document.getElementById('main-content');
    if (main) {
        main.innerHTML = `<div class="module"><p style="color:darkred">Error JS: ${ev.message}</p></div>`;
    }
});

// Control para mostrar/ocultar panel de notificaciones
document.addEventListener('click', (ev) => {
    const panel = document.getElementById('notificationPanel');
    const toggle = document.getElementById('notificationToggle');
    if (!panel || !toggle) return;
    if (toggle.contains(ev.target)) {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        panel.classList.toggle('hidden');
        toggle.setAttribute('aria-expanded', String(!expanded));
    } else if (!panel.contains(ev.target)) {
        panel.classList.add('hidden');
        toggle.setAttribute('aria-expanded', 'false');
    }
});

// (loadModule está definido más abajo con más funcionalidades)

function renderProductosModule() {
    const content = document.getElementById("main-content");
    const title = document.getElementById("title");
    if (!content || !title) return;

    title.innerHTML = "Productos";

    const productosParaMostrar = getProductosParaMostrar();

    const rows = productosParaMostrar.map((producto) => {
        const nombre = producto.producto || "Sin nombre";
        const categoriaNombre = typeof producto.categoria === 'number'
            ? (categoriasState.find(c => Number(c.id) === Number(producto.categoria)) || {}).nombre || "Sin categoría"
            : producto.categoria || "Sin categoría";
        const highlighted = (productosFocusId !== null && Number(producto.id) === Number(productosFocusId)) ? "highlighted-row" : "";
        return `
        <tr class="${highlighted}">
            <td>${producto.id}</td>
            <td>${nombre}</td>
            <td>${categoriaNombre}</td>
            <td>${producto.stock}</td>
            <td>${formatearPrecio(producto.precio)}</td>
        </tr>
    `;
    }).join("");

    const categoryOptions = categoriasState.map((cat) => `
        <option value="${cat.id}">${cat.nombre}</option>
    `).join("");

    content.innerHTML = `
        <div class="module">
            <div class="module-header">
                <div>
                    <h2>📦 Gestión de Productos</h2>
                    <p>Lista de productos disponible para controlar el inventario.</p>
                </div>
                <div class="module-actions">
                    <div class="filter-wrapper">
                        <button type="button" class="btn-secondary" id="toggle-product-filters"><i class="fa-solid fa-sliders"></i> Filtrar</button>
                        <div id="product-filters" class="filter-menu hidden">
                            <button type="button" class="filter-option ${productosSortMode === "default" ? "active" : ""}" data-sort-option="default">Sin filtros</button>
                            <button type="button" class="filter-option ${productosSortMode === "stock-desc" ? "active" : ""}" data-sort-option="stock-desc">Stock: mayor a menor</button>
                            <button type="button" class="filter-option ${productosSortMode === "stock-asc" ? "active" : ""}" data-sort-option="stock-asc">Stock: menor a mayor</button>
                            <button type="button" class="filter-option ${productosSortMode === "precio-desc" ? "active" : ""}" data-sort-option="precio-desc">Precio: mayor a menor</button>
                            <button type="button" class="filter-option ${productosSortMode === "precio-asc" ? "active" : ""}" data-sort-option="precio-asc">Precio: menor a mayor</button>
                            <button type="button" class="filter-option ${productosSortMode === "nombre-asc" ? "active" : ""}" data-sort-option="nombre-asc">Nombre: A-Z</button>
                            <button type="button" class="filter-option ${productosSortMode === "categoria-asc" ? "active" : ""}" data-sort-option="categoria-asc">Categoría: A-Z</button>
                        </div>
                    </div>
                    <button type="button" class="btn-primary" id="show-product-form"><i class="fa-solid fa-plus"></i> Nuevo producto</button>
                </div>
            </div>

            ${productosFocusId !== null ? `
                <div class="product-focus-banner">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <span>Mostrando el producto seleccionado desde la alerta de stock bajo.</span>
                    <button type="button" class="btn-secondary small" id="clear-product-focus">Ver todos</button>
                </div>
            ` : ""}

            <form id="product-form" class="product-form hidden">
                <div class="form-grid">
                    <label>
                        Producto
                        <input type="text" name="nombre" placeholder="Nombre del producto" required>
                    </label>
                    <label>
                        Categoría
                        <select name="categoria_id" required>
                            <option value="">Selecciona una categoría</option>
                            ${categoryOptions}
                        </select>
                    </label>
                    <label>
                        Stock
                        <input type="number" name="stock" min="0" placeholder="0" required>
                    </label>
                    <label>
                        Precio
                        <input type="number" name="precio" min="0" step="0.01" placeholder="0" required>
                    </label>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Guardar</button>
                    <button type="button" class="btn-secondary" id="cancel-product-form">Cancelar</button>
                </div>
            </form>

            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Producto</th>
                            <th>Categoría</th>
                            <th>Stock</th>
                            <th>Precio</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>
    `;

    const form = document.getElementById("product-form");
    document.getElementById("show-product-form")?.addEventListener("click", () => {
        form?.classList.remove("hidden");
        form?.querySelector("input[name='nombre']")?.focus();
    });

    document.getElementById("cancel-product-form")?.addEventListener("click", () => {
        form?.reset();
        form?.classList.add("hidden");
    });

    document.getElementById("clear-product-focus")?.addEventListener("click", () => {
        productosFocusId = null;
        renderProductosModule();
    });

    document.getElementById("toggle-product-filters")?.addEventListener("click", (event) => {
        event.stopPropagation();
        const panel = document.getElementById("product-filters");
        panel?.classList.toggle("hidden");
    });

    document.querySelectorAll("[data-sort-option]").forEach((button) => {
        button.addEventListener("click", () => {
            productosSortMode = button.getAttribute("data-sort-option") || "default";
            renderProductosModule();
        });
    });

    form?.addEventListener("submit", (event) => {
        event.preventDefault();
        const data = new FormData(form);
        const categoriaId = Number(data.get("categoria_id"));
        const categoriaObj = categoriasState.find(c => Number(c.id) === categoriaId);
        const nuevoProducto = {
            id: Math.max(0, ...productosState.map(p => Number(p.id))) + 1,
            producto: data.get("nombre").toString().trim(),
            precio: Number(data.get("precio")),
            stock: Number(data.get("stock")),
            categoria: categoriaObj ? categoriaObj.nombre : (data.get("categoria_id")?.toString() || ""),
        };

        if (!nuevoProducto.producto || Number.isNaN(nuevoProducto.precio) || Number.isNaN(nuevoProducto.stock)) {
            return;
        }

        productosState = [nuevoProducto, ...productosState];
        form?.reset();
        form?.classList.add("hidden");
        renderNotificationsPanel();
        renderProductosModule();
    });
}

setInterval(actualizarHora, 1000);
actualizarHora();

// Inicial render de módulos (se hace también en DOMContentLoaded)
renderNotificationsPanel();
renderProductosModule();

async function obtenerCategoriasApi() {
    const response = await fetch("/categorias");
    if (!response.ok) {
        throw new Error("No se pudieron cargar las categorías desde el servidor.");
    }
    return response.json();
}

async function crearCategoriaApi(categoria) {
    const response = await fetch("/categorias", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(categoria)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "No se pudo guardar la categoría.");
    }

    return response.json();
}

async function renderCategoriasModule() {
    const content = document.getElementById("main-content");
    const title = document.getElementById("title");

    title.innerHTML = "Categorías";

    let categorias = categoriasState;
    let errorMessage = null;

    try {
        categorias = await obtenerCategoriasApi();
        categoriasState = categorias;
    } catch (error) {
        errorMessage = error.message;
    }

    const rows = (categorias || categoriasState).map((cat) => `
        <tr>
            <td>${cat.id}</td>
            <td>${cat.nombre}</td>
            <td>${cat.descripcion || ""}</td>
        </tr>
    `).join("");

    content.innerHTML = `
        <div class="module">
            <div class="module-header">
                <div>
                    <h2>🗂️ Gestión de Categorías</h2>
                    <p>Lista de categorías del inventario.</p>
                    ${errorMessage ? `<p class="error-message">${errorMessage}</p>` : ""}
                </div>
                <button type="button" class="btn-primary" id="show-category-form"><i class="fa-solid fa-plus"></i> Nueva categoría</button>
            </div>

            <form id="category-form" class="product-form hidden">
                <div class="form-grid">
                    <label>
                        Categoría
                        <input type="text" name="nombre" placeholder="Nombre de la categoría" required>
                    </label>
                    <label>
                        Descripción
                        <input type="text" name="descripcion" placeholder="Breve descripción">
                    </label>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Guardar</button>
                    <button type="button" class="btn-secondary" id="cancel-category-form">Cancelar</button>
                </div>
            </form>

            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Categoría</th>
                            <th>Descripción</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>
    `;

    const form = document.getElementById("category-form");
    document.getElementById("show-category-form")?.addEventListener("click", () => {
        form?.classList.remove("hidden");
        form?.querySelector("input[name='nombre']")?.focus();
    });

    document.getElementById("cancel-category-form")?.addEventListener("click", () => {
        form?.reset();
        form?.classList.add("hidden");
    });

    form?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const data = new FormData(form);
        const nuevaCat = {
            nombre: data.get("nombre").toString().trim(),
            descripcion: data.get("descripcion").toString().trim() || null
        };

        if (!nuevaCat.nombre) return;

        try {
            const categoriaGuardada = await crearCategoriaApi(nuevaCat);
            categoriasState = [categoriaGuardada, ...categoriasState.filter((c) => c.id !== categoriaGuardada.id)];
            renderCategoriasModule();
        } catch (error) {
            alert(error.message);
        }
    });
}

async function loadModule(module) {
    const content = document.getElementById("main-content");
    const title = document.getElementById("title");

    if (module === "inicio") {
        title.innerHTML = "Dashboard";
        try {
            const response = await fetch("/api/dashboard");
            const data = await response.json();
            const productosCount = productosState.length || Number(data?.productos || 0);
            const categoriasCount = categoriasState.length || Number(data?.categorias || 0);
            const alertasCount = getAlertasProductos().length;

            content.innerHTML = `
                <div class="cards">
                    <div class="card"><i class="fa-solid fa-box"></i><h2>${productosCount}</h2><p>Productos</p></div>
                    <div class="card"><i class="fa-solid fa-layer-group"></i><h2>${categoriasCount}</h2><p>Categorías</p></div>
                    <div class="card"><i class="fa-solid fa-triangle-exclamation"></i><h2>${alertasCount}</h2><p>Alertas</p></div>
                    <div class="card"><i class="fa-solid fa-dollar-sign"></i><h2>$0</h2><p>Inventario</p></div>
                </div>
                <div class="module">
                    <h2>📦 Estado general</h2>
                    <p>La conexión con la API está activa y los datos se están leyendo desde la base de datos.</p>
                </div>
            `;
        } catch (error) {
            const productosCount = productosState.length;
            const categoriasCount = categoriasState.length;
            content.innerHTML = `
                <div class="cards">
                    <div class="card"><i class="fa-solid fa-box"></i><h2>${productosCount}</h2><p>Productos</p></div>
                    <div class="card"><i class="fa-solid fa-layer-group"></i><h2>${categoriasCount}</h2><p>Categorías</p></div>
                    <div class="card"><i class="fa-solid fa-triangle-exclamation"></i><h2>${getAlertasProductos().length}</h2><p>Alertas</p></div>
                    <div class="card"><i class="fa-solid fa-dollar-sign"></i><h2>$0</h2><p>Inventario</p></div>
                </div>
                <div class="module">
                    <h2>📦 Estado general</h2>
                    <p>No se pudo cargar el dashboard, pero se muestran los datos locales.</p>
                </div>
            `;
        }
        return;
    }

    if (module === "productos") {
        await renderProductosModule();
        return;
    }

    if (module === "categorias") {
        await renderCategoriasModule();
        return;
    }

    title.innerHTML = module;
    content.innerHTML = `<p>Módulo en construcción.</p>`;
}

window.loadModule = loadModule;
document.addEventListener("DOMContentLoaded", () => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");

    if (isAuthenticated !== "true") {
        window.location.href = "/login";
        return;
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", cerrarSesion);
    }

    const notificationToggle = document.getElementById("notificationToggle");
    notificationToggle?.addEventListener("click", (event) => {
        event.stopPropagation();
        const panel = document.getElementById("notificationPanel");
        if (!panel) {
            return;
        }

        const isHidden = panel.classList.contains("hidden");
        panel.classList.toggle("hidden", !isHidden);
        notificationToggle.setAttribute("aria-expanded", String(isHidden));
    });

    document.addEventListener("click", (event) => {
        const panel = document.getElementById("notificationPanel");
        const toggle = document.getElementById("notificationToggle");

        if (!panel || !toggle) {
            return;
        }

        if (!panel.contains(event.target) && !toggle.contains(event.target)) {
            panel.classList.add("hidden");
            toggle.setAttribute("aria-expanded", "false");
        }
    });

    document.addEventListener("click", (event) => {
        const filterWrapper = event.target.closest(".filter-wrapper");
        const panel = document.getElementById("product-filters");

        if (!panel) {
            return;
        }

        if (!filterWrapper) {
            panel.classList.add("hidden");
        }
    });

    renderNotificationsPanel();
    loadModule("inicio");
});
