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

const PRODUCTS_STORAGE_KEY = "smart_inventory_products_state";
const CATEGORIES_STORAGE_KEY = "smart_inventory_categories_state";
const PRODUCT_NEXT_ID_KEY = "smart_inventory_next_product_id";
const CATEGORY_NEXT_ID_KEY = "smart_inventory_next_category_id";

function loadStoredState(storageKey, fallback) {
    try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return fallback;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : fallback;
    } catch (error) {
        return fallback;
    }
}

function persistState(storageKey, value) {
    localStorage.setItem(storageKey, JSON.stringify(value));
}

function getNextId(items, storageKey) {
    const currentStored = Number(localStorage.getItem(storageKey));
    const maxExisting = items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0);
    const nextId = Math.max(maxExisting, Number.isFinite(currentStored) && currentStored > 0 ? currentStored : 0) + 1;
    localStorage.setItem(storageKey, String(nextId));
    return nextId;
}

// Estado local
let productosState = loadStoredState(PRODUCTS_STORAGE_KEY, [...productosIniciales]);
let productosSortMode = "default";
let productosFocusId = null;
let productosEditId = null;
let productosSearchMessage = "";

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

let categoriasState = loadStoredState(CATEGORIES_STORAGE_KEY, [...categoriasIniciales]);
let categoriasFocusId = null;
let categoriasEditId = null;
let categoriasSearchMessage = "";

const ACTIVITY_STORAGE_KEY = "smart_inventory_activity_log";
const ACTIVITY_LIMIT = 80;

function loadActivityLog() {
    try {
        const raw = localStorage.getItem(ACTIVITY_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (error) {
        return [];
    }
}

function saveActivityLog() {
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activityLogState.slice(0, ACTIVITY_LIMIT)));
}

function addActivity({ type, title, detail, entity = "Sistema", severity = "info" }) {
    const activity = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type,
        title,
        detail,
        entity,
        severity,
        timestamp: new Date().toISOString()
    };

    activityLogState = [activity, ...activityLogState].slice(0, ACTIVITY_LIMIT);
    saveActivityLog();
    return activity;
}

function formatActivityTime(timestamp) {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("es-MX", {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(date);
}

function getActivitySeverityClass(severity) {
    switch (severity) {
        case "success": return "activity-badge success";
        case "warning": return "activity-badge warning";
        case "danger": return "activity-badge danger";
        default: return "activity-badge info";
    }
}

function getActivitySummary(items = activityLogState) {
    const counts = items.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
    }, {});

    return {
        total: items.length,
        login: counts.login || 0,
        create: counts.create || 0,
        update: counts.update || 0,
        delete: counts.delete || 0
    };
}

let activityLogState = loadActivityLog();

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

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
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
            return lista.sort((a, b) => Number(a.id) - Number(b.id));
    }
}

function getAlertasProductos(productos = productosState) {
    return productos.filter((producto) => Number(producto.stock) <= 5);
}

function getInventarioResumen(productos = productosState) {
    const totalUnidades = productos.reduce((sum, producto) => sum + Number(producto.stock || 0), 0);
    const valorTotal = productos.reduce((sum, producto) => sum + (Number(producto.stock || 0) * Number(producto.precio || 0)), 0);

    return {
        totalUnidades,
        valorTotal
    };
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

function refreshDashboardSummary() {
    renderNotificationsPanel();

    const title = document.getElementById("title");
    if (title && title.textContent.trim() === "Dashboard") {
        loadModule("inicio");
    }
}

function renderProductosModule() {
    const content = document.getElementById("main-content");
    const title = document.getElementById("title");
    if (!content || !title) return;

    title.innerHTML = "Productos";

    const productosParaMostrar = getProductosParaMostrar();
    const productoEnEdicion = productosState.find((producto) => Number(producto.id) === Number(productosEditId));

    const categoriaSeleccionadaProducto = productoEnEdicion
        ? (typeof productoEnEdicion.categoria === 'number'
            ? Number(productoEnEdicion.categoria)
            : (categoriasState.find((cat) => cat.nombre === productoEnEdicion.categoria)?.id ?? ""))
        : "";

    const rows = productosParaMostrar.map((producto) => {
        const nombre = producto.producto || "Sin nombre";
        const categoriaNombre = typeof producto.categoria === 'number'
            ? (categoriasState.find(c => Number(c.id) === Number(producto.categoria)) || {}).nombre || "Sin categoría"
            : producto.categoria || "Sin categoría";
        const highlighted = (productosFocusId !== null && Number(producto.id) === Number(productosFocusId)) ? "highlighted-row" : "";
        return `
        <tr class="${highlighted}">
            <td>${producto.id}</td>
            <td>${escapeHtml(nombre)}</td>
            <td>${escapeHtml(categoriaNombre)}</td>
            <td>${producto.stock}</td>
            <td>${formatearPrecio(producto.precio)}</td>
            <td>
                <div class="table-actions">
                    <button type="button" class="btn-secondary small table-action-btn" data-edit-product-id="${producto.id}">
                        <i class="fa-solid fa-pen"></i> Editar
                    </button>
                    <button type="button" class="btn-secondary small table-action-btn danger-action" data-delete-product-id="${producto.id}">
                        <i class="fa-solid fa-trash"></i> Eliminar
                    </button>
                </div>
            </td>
        </tr>
    `;
    }).join("");

    const categoryOptions = categoriasState.map((cat) => `
        <option value="${cat.id}" ${categoriaSeleccionadaProducto === Number(cat.id) ? "selected" : ""}>${cat.nombre}</option>
    `).join("");

    content.innerHTML = `
        <div class="module">
            <div class="module-header">
                <div>
                    <h2>📦 Gestión de Productos</h2>
                    <p>Lista de productos disponible para controlar el inventario.</p>
                </div>
                <div class="module-actions">
                    <div class="search-box">
                        <input type="number" id="product-search-id" placeholder="Buscar por ID" min="1">
                        <button type="button" class="btn-secondary" id="search-product-id"><i class="fa-solid fa-magnifying-glass"></i> Buscar</button>
                    </div>
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

            ${productosSearchMessage ? `<div class="info-banner">${escapeHtml(productosSearchMessage)}</div>` : ""}

            ${productosFocusId !== null ? `
                <div class="product-focus-banner">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <span>Mostrando el producto seleccionado desde la alerta de stock bajo.</span>
                    <button type="button" class="btn-secondary small" id="clear-product-focus">Ver todos</button>
                </div>
            ` : ""}

            <form id="product-edit-form" class="product-form ${productosEditId !== null ? "" : "hidden"}">
                <input type="hidden" name="id" value="${productoEnEdicion ? productoEnEdicion.id : ""}">
                <div class="form-grid">
                    <label>
                        Producto
                        <input type="text" name="nombre" value="${productoEnEdicion ? escapeHtml(productoEnEdicion.producto || "") : ""}" placeholder="Nombre del producto" required>
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
                        <input type="number" name="stock" min="0" value="${productoEnEdicion ? productoEnEdicion.stock : ""}" placeholder="0" required>
                    </label>
                    <label>
                        Precio
                        <input type="number" name="precio" min="0" step="0.01" value="${productoEnEdicion ? productoEnEdicion.precio : ""}" placeholder="0" required>
                    </label>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Actualizar producto</button>
                    <button type="button" class="btn-secondary" id="cancel-product-edit">Cancelar</button>
                </div>
            </form>

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
                            <th>Acciones</th>
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

    document.getElementById("cancel-product-edit")?.addEventListener("click", () => {
        productosEditId = null;
        renderProductosModule();
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

    document.querySelectorAll("[data-edit-product-id]").forEach((button) => {
        button.addEventListener("click", () => {
            productosEditId = Number(button.getAttribute("data-edit-product-id"));
            productosSearchMessage = "";
            renderProductosModule();
        });
    });

    document.querySelectorAll("[data-delete-product-id]").forEach((button) => {
        button.addEventListener("click", () => {
            const id = Number(button.getAttribute("data-delete-product-id"));
            if (!Number.isInteger(id) || !window.confirm(`¿Deseas eliminar el producto #${id}?`)) {
                return;
            }

            productosState = productosState.filter((producto) => Number(producto.id) !== id);
            persistState(PRODUCTS_STORAGE_KEY, productosState);
            productosFocusId = null;
            addActivity({
                type: "delete",
                title: "Producto eliminado",
                detail: `Se eliminó el producto #${id} del inventario.`,
                entity: "Productos",
                severity: "warning"
            });
            productosEditId = null;
            productosSearchMessage = `Producto ${id} eliminado correctamente.`;
            refreshDashboardSummary();
            renderProductosModule();
        });
    });

    document.getElementById("search-product-id")?.addEventListener("click", () => {
        const input = document.getElementById("product-search-id");
        const valor = Number(input?.value);

        if (!Number.isInteger(valor) || valor <= 0) {
            productosFocusId = null;
            productosSearchMessage = "Ingresa un ID válido para buscar.";
            renderProductosModule();
            return;
        }

        const encontrado = productosState.find((producto) => Number(producto.id) === valor);
        if (encontrado) {
            productosFocusId = valor;
            productosSearchMessage = `Mostrando el producto con ID ${valor}.`;
        } else {
            productosFocusId = null;
            productosSearchMessage = `No se encontró un producto con el ID ${valor}.`;
        }

        renderProductosModule();
    });

    document.getElementById("product-search-id")?.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            document.getElementById("search-product-id")?.click();
        }
    });

    document.querySelectorAll("[data-sort-option]").forEach((button) => {
        button.addEventListener("click", () => {
            productosSortMode = button.getAttribute("data-sort-option") || "default";
            renderProductosModule();
        });
    });

    document.getElementById("product-edit-form")?.addEventListener("submit", (event) => {
        event.preventDefault();
        const editForm = document.getElementById("product-edit-form");
        const data = new FormData(editForm);
        const id = Number(data.get("id"));
        const productoActual = productosState.find((producto) => Number(producto.id) === id);

        if (!productoActual) return;

        const categoriaId = Number(data.get("categoria_id"));
        const categoriaObj = categoriasState.find(c => Number(c.id) === categoriaId);
        const productoActualizado = {
            ...productoActual,
            producto: data.get("nombre").toString().trim(),
            precio: Number(data.get("precio")),
            stock: Number(data.get("stock")),
            categoria: categoriaObj ? categoriaObj.nombre : (data.get("categoria_id")?.toString() || ""),
        };

        if (!productoActualizado.producto || Number.isNaN(productoActualizado.precio) || Number.isNaN(productoActualizado.stock)) {
            return;
        }

        productosState = productosState.map((producto) => Number(producto.id) === id ? productoActualizado : producto);
        persistState(PRODUCTS_STORAGE_KEY, productosState);
        addActivity({
            type: "update",
            title: "Producto editado",
            detail: `Se actualizó el producto #${id} (${productoActualizado.producto}).`,
            entity: "Productos",
            severity: "success"
        });
        productosEditId = null;
        productosSearchMessage = `Producto ${id} actualizado correctamente.`;
        refreshDashboardSummary();
        renderProductosModule();
    });

    form?.addEventListener("submit", (event) => {
        event.preventDefault();
        const data = new FormData(form);
        const categoriaId = Number(data.get("categoria_id"));
        const categoriaObj = categoriasState.find(c => Number(c.id) === categoriaId);
        const nuevoProducto = {
            id: getNextId(productosState, PRODUCT_NEXT_ID_KEY),
            producto: data.get("nombre").toString().trim(),
            precio: Number(data.get("precio")),
            stock: Number(data.get("stock")),
            categoria: categoriaObj ? categoriaObj.nombre : (data.get("categoria_id")?.toString() || ""),
        };

        if (!nuevoProducto.producto || Number.isNaN(nuevoProducto.precio) || Number.isNaN(nuevoProducto.stock)) {
            return;
        }

        productosState = [...productosState, nuevoProducto];
        persistState(PRODUCTS_STORAGE_KEY, productosState);
        addActivity({
            type: "create",
            title: "Producto creado",
            detail: `Se agregó el producto ${nuevoProducto.producto} al inventario.`,
            entity: "Productos",
            severity: "success"
        });
        form?.reset();
        form?.classList.add("hidden");
        productosSearchMessage = "";
        refreshDashboardSummary();
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

async function actualizarCategoriaApi(categoriaId, categoria) {
    const response = await fetch(`/categorias/${categoriaId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(categoria)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "No se pudo actualizar la categoría.");
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
        if (!categoriasState.length) {
            categorias = await obtenerCategoriasApi();
            categoriasState = categorias;
            persistState(CATEGORIES_STORAGE_KEY, categoriasState);
        }
    } catch (error) {
        errorMessage = error.message;
    }

    const categoriasParaMostrar = categoriasFocusId !== null
        ? (categorias || categoriasState).filter((cat) => Number(cat.id) === Number(categoriasFocusId))
        : (categorias || categoriasState);
    const categoriaEnEdicion = (categorias || categoriasState).find((cat) => Number(cat.id) === Number(categoriasEditId));

    const rows = [...categoriasParaMostrar].sort((a, b) => Number(a.id) - Number(b.id)).map((cat) => `
        <tr>
            <td>${cat.id}</td>
            <td>${escapeHtml(cat.nombre)}</td>
            <td>${escapeHtml(cat.descripcion || "")}</td>
            <td>
                <div class="table-actions">
                    <button type="button" class="btn-secondary small table-action-btn" data-edit-category-id="${cat.id}">
                        <i class="fa-solid fa-pen"></i> Editar
                    </button>
                    <button type="button" class="btn-secondary small table-action-btn danger-action" data-delete-category-id="${cat.id}">
                        <i class="fa-solid fa-trash"></i> Eliminar
                    </button>
                </div>
            </td>
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
                <div class="module-actions">
                    <div class="search-box">
                        <input type="number" id="category-search-id" placeholder="Buscar por ID" min="1">
                        <button type="button" class="btn-secondary" id="search-category-id"><i class="fa-solid fa-magnifying-glass"></i> Buscar</button>
                    </div>
                    <button type="button" class="btn-primary" id="show-category-form"><i class="fa-solid fa-plus"></i> Nueva categoría</button>
                </div>
            </div>

            ${categoriasSearchMessage ? `<div class="info-banner">${escapeHtml(categoriasSearchMessage)}</div>` : ""}

            <form id="category-edit-form" class="product-form ${categoriasEditId !== null ? "" : "hidden"}">
                <input type="hidden" name="id" value="${categoriaEnEdicion ? categoriaEnEdicion.id : ""}">
                <div class="form-grid">
                    <label>
                        Categoría
                        <input type="text" name="nombre" value="${categoriaEnEdicion ? escapeHtml(categoriaEnEdicion.nombre || "") : ""}" placeholder="Nombre de la categoría" required>
                    </label>
                    <label>
                        Descripción
                        <input type="text" name="descripcion" value="${categoriaEnEdicion ? escapeHtml(categoriaEnEdicion.descripcion || "") : ""}" placeholder="Breve descripción">
                    </label>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Actualizar categoría</button>
                    <button type="button" class="btn-secondary" id="cancel-category-edit">Cancelar</button>
                </div>
            </form>

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
                            <th>Acciones</th>
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

    document.getElementById("cancel-category-edit")?.addEventListener("click", () => {
        categoriasEditId = null;
        renderCategoriasModule();
    });

    document.querySelectorAll("[data-edit-category-id]").forEach((button) => {
        button.addEventListener("click", () => {
            categoriasEditId = Number(button.getAttribute("data-edit-category-id"));
            categoriasSearchMessage = "";
            renderCategoriasModule();
        });
    });

    document.querySelectorAll("[data-delete-category-id]").forEach((button) => {
        button.addEventListener("click", () => {
            const id = Number(button.getAttribute("data-delete-category-id"));
            if (!Number.isInteger(id) || !window.confirm(`¿Deseas eliminar la categoría #${id}?`)) {
                return;
            }

            categoriasState = categoriasState.filter((cat) => Number(cat.id) !== id);
            persistState(CATEGORIES_STORAGE_KEY, categoriasState);
            categoriasFocusId = null;
            addActivity({
                type: "delete",
                title: "Categoría eliminada",
                detail: `Se eliminó la categoría #${id} del catálogo.`,
                entity: "Categorías",
                severity: "warning"
            });
            categoriasEditId = null;
            categoriasSearchMessage = `Categoría ${id} eliminada correctamente.`;
            renderCategoriasModule();
        });
    });

    document.getElementById("search-category-id")?.addEventListener("click", () => {
        const input = document.getElementById("category-search-id");
        const valor = Number(input?.value);

        if (!Number.isInteger(valor) || valor <= 0) {
            categoriasFocusId = null;
            categoriasSearchMessage = "Ingresa un ID válido para buscar.";
            renderCategoriasModule();
            return;
        }

        const encontrada = (categoriasState || []).find((cat) => Number(cat.id) === valor);
        if (encontrada) {
            categoriasFocusId = valor;
            categoriasSearchMessage = `Mostrando la categoría con ID ${valor}.`;
        } else {
            categoriasFocusId = null;
            categoriasSearchMessage = `No se encontró una categoría con el ID ${valor}.`;
        }

        renderCategoriasModule();
    });

    document.getElementById("category-search-id")?.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            document.getElementById("search-category-id")?.click();
        }
    });

    document.getElementById("category-edit-form")?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const editForm = document.getElementById("category-edit-form");
        const data = new FormData(editForm);
        const id = Number(data.get("id"));

        const categoriaActualizada = {
            nombre: data.get("nombre").toString().trim(),
            descripcion: data.get("descripcion").toString().trim() || null
        };

        if (!categoriaActualizada.nombre) return;

        try {
            const categoriaGuardada = await actualizarCategoriaApi(id, categoriaActualizada);
            categoriasState = categoriasState.map((cat) => Number(cat.id) === id ? categoriaGuardada : cat);
            persistState(CATEGORIES_STORAGE_KEY, categoriasState);
            addActivity({
                type: "update",
                title: "Categoría editada",
                detail: `Se actualizó la categoría #${id} (${categoriaActualizada.nombre}).`,
                entity: "Categorías",
                severity: "success"
            });
            categoriasEditId = null;
            categoriasSearchMessage = `Categoría ${id} actualizada correctamente.`;
            renderCategoriasModule();
        } catch (error) {
            alert(error.message);
        }
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
            const nuevaCategoria = {
                ...categoriaGuardada,
                id: getNextId(categoriasState, CATEGORY_NEXT_ID_KEY),
                nombre: nuevaCat.nombre,
                descripcion: nuevaCat.descripcion || null
            };
            categoriasState = [...categoriasState.filter((c) => Number(c.id) !== Number(nuevaCategoria.id)), nuevaCategoria];
            persistState(CATEGORIES_STORAGE_KEY, categoriasState);
            categoriasFocusId = null;
            addActivity({
                type: "create",
                title: "Categoría creada",
                detail: `Se agregó la categoría ${categoriaGuardada.nombre} al catálogo.`,
                entity: "Categorías",
                severity: "success"
            });
            categoriasSearchMessage = "";
            renderCategoriasModule();
        } catch (error) {
            alert(error.message);
        }
    });
}

function renderAlertasModule() {
    const content = document.getElementById("main-content");
    const title = document.getElementById("title");
    if (!content || !title) return;

    title.innerHTML = "Alertas";
    activityLogState = loadActivityLog();
    const summary = getActivitySummary();

    const rows = activityLogState.length === 0
        ? `<div class="empty-state">Aún no hay movimientos registrados. Las acciones de creación, edición, eliminación e inicio de sesión aparecerán aquí.</div>`
        : activityLogState.map((item) => `
            <article class="activity-card">
                <div class="activity-card-head">
                    <span class="${getActivitySeverityClass(item.severity)}">${item.severity === "success" ? "Éxito" : item.severity === "warning" ? "Atención" : item.severity === "danger" ? "Crítico" : "Info"}</span>
                    <span class="activity-time">${formatActivityTime(item.timestamp)}</span>
                </div>
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.detail)}</p>
                <div class="activity-meta">
                    <span><i class="fa-solid fa-tag"></i> ${escapeHtml(item.entity)}</span>
                    <span><i class="fa-solid fa-clock"></i> ${escapeHtml(item.type)}</span>
                </div>
            </article>
        `).join("");

    content.innerHTML = `
        <div class="module">
            <div class="module-header">
                <div>
                    <h2>🚨 Centro de actividad</h2>
                    <p>Historial profesional de operaciones, cambios e accesos al sistema.</p>
                </div>
                <button type="button" class="btn-secondary" id="clear-activity-log"><i class="fa-solid fa-broom"></i> Limpiar historial</button>
            </div>

            <div class="activity-summary-grid">
                <div class="summary-card">
                    <span class="summary-label">Total de eventos</span>
                    <strong>${summary.total}</strong>
                </div>
                <div class="summary-card">
                    <span class="summary-label">Inicios de sesión</span>
                    <strong>${summary.login}</strong>
                </div>
                <div class="summary-card">
                    <span class="summary-label">Creaciones</span>
                    <strong>${summary.create}</strong>
                </div>
                <div class="summary-card">
                    <span class="summary-label">Ediciones</span>
                    <strong>${summary.update}</strong>
                </div>
                <div class="summary-card">
                    <span class="summary-label">Eliminaciones</span>
                    <strong>${summary.delete}</strong>
                </div>
            </div>

            <div class="activity-list">${rows}</div>
        </div>
    `;

    document.getElementById("clear-activity-log")?.addEventListener("click", () => {
        activityLogState = [];
        saveActivityLog();
        renderAlertasModule();
    });
}

function getReporteData() {
    const productosBajos = productosState.filter((producto) => Number(producto.stock) <= 5);
    const resumenActividad = getActivitySummary(activityLogState);
    const productosOrdenados = [...productosState].sort((a, b) => Number(a.id) - Number(b.id));
    const categoriasOrdenadas = [...categoriasState].sort((a, b) => Number(a.id) - Number(b.id));
    const actividadesRecientes = [...activityLogState].slice(0, 8);

    return {
        generatedAt: new Date().toLocaleString("es-MX", {
            dateStyle: "full",
            timeStyle: "short"
        }),
        productosTotal: productosState.length,
        categoriasTotal: categoriasState.length,
        alertasTotal: productosBajos.length,
        actividadTotal: resumenActividad.total,
        productosBajos,
        productosOrdenados,
        categoriasOrdenadas,
        actividadesRecientes
    };
}

function buildReportMarkup(isPrintable = false) {
    const data = getReporteData();
    const productosRows = data.productosOrdenados.map((producto) => `
        <tr>
            <td>${producto.id}</td>
            <td>${escapeHtml(producto.producto || "Sin nombre")}</td>
            <td>${escapeHtml(producto.categoria || "Sin categoría")}</td>
            <td>${producto.stock}</td>
            <td>${formatearPrecio(producto.precio)}</td>
        </tr>
    `).join("");

    const categoriasRows = data.categoriasOrdenadas.map((categoria) => `
        <tr>
            <td>${categoria.id}</td>
            <td>${escapeHtml(categoria.nombre || "Sin nombre")}</td>
            <td>${escapeHtml(categoria.descripcion || "Sin descripción")}</td>
        </tr>
    `).join("");

    const actividadesRows = data.actividadesRecientes.length === 0
        ? '<tr><td colspan="3" class="empty-table-cell">No hay actividad registrada aún.</td></tr>'
        : data.actividadesRecientes.map((item) => `
            <tr>
                <td>${formatActivityTime(item.timestamp)}</td>
                <td>${escapeHtml(item.title)}</td>
                <td>${escapeHtml(item.detail)}</td>
            </tr>
        `).join("");

    const productosBajosRows = data.productosBajos.length === 0
        ? '<tr><td colspan="4" class="empty-table-cell">No hay productos con stock bajo en este momento.</td></tr>'
        : data.productosBajos.map((producto) => `
            <tr>
                <td>${producto.id}</td>
                <td>${escapeHtml(producto.producto || "Sin nombre")}</td>
                <td>${producto.stock}</td>
                <td>${formatearPrecio(producto.precio)}</td>
            </tr>
        `).join("");

    return `
        <div class="report-paper ${isPrintable ? "printable" : ""}">
            <header class="report-header">
                <div>
                    <p class="report-eyebrow">Smart Inventory</p>
                    <h2>Reporte ejecutivo del proyecto</h2>
                    <p class="report-subtitle">Resumen profesional de inventario, categorías, alertas y actividad del sistema.</p>
                </div>
                <div class="report-badge">Generado ${escapeHtml(data.generatedAt)}</div>
            </header>

            <section class="report-summary-grid">
                <article class="report-summary-card">
                    <span>Productos</span>
                    <strong>${data.productosTotal}</strong>
                </article>
                <article class="report-summary-card">
                    <span>Categorías</span>
                    <strong>${data.categoriasTotal}</strong>
                </article>
                <article class="report-summary-card">
                    <span>Alertas de stock</span>
                    <strong>${data.alertasTotal}</strong>
                </article>
                <article class="report-summary-card">
                    <span>Eventos registrados</span>
                    <strong>${data.actividadTotal}</strong>
                </article>
            </section>

            <section class="report-section">
                <h3>Inventario con stock bajo</h3>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Producto</th>
                            <th>Stock</th>
                            <th>Precio</th>
                        </tr>
                    </thead>
                    <tbody>${productosBajosRows}</tbody>
                </table>
            </section>

            <section class="report-section">
                <h3>Productos registrados</h3>
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
                    <tbody>${productosRows}</tbody>
                </table>
            </section>

            <section class="report-section">
                <h3>Categorías del sistema</h3>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Categoría</th>
                            <th>Descripción</th>
                        </tr>
                    </thead>
                    <tbody>${categoriasRows}</tbody>
                </table>
            </section>

            <section class="report-section">
                <h3>Actividad reciente</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Evento</th>
                            <th>Detalle</th>
                        </tr>
                    </thead>
                    <tbody>${actividadesRows}</tbody>
                </table>
            </section>
        </div>
    `;
}

function exportReportToPdf() {
    const reportWindow = window.open("", "_blank", "width=1000,height=900");
    if (!reportWindow) {
        alert("Tu navegador bloqueó la ventana emergente. Permite las ventanas para generar el PDF.");
        return;
    }

    const reportMarkup = buildReportMarkup(true);

    reportWindow.document.write(`<!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Reporte Smart Inventory</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 24px; background: #fff; color: #0f172a; }
                .report-paper { max-width: 1000px; margin: 0 auto; }
                .report-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid #2563eb; }
                .report-eyebrow { margin: 0 0 6px; color: #2563eb; text-transform: uppercase; letter-spacing: 1.5px; font-size: 12px; font-weight: 700; }
                .report-header h2 { margin: 0 0 6px; font-size: 26px; }
                .report-subtitle { margin: 0; color: #64748b; }
                .report-badge { background: #eff6ff; color: #1d4ed8; padding: 10px 14px; border-radius: 999px; font-size: 12px; max-width: 260px; text-align: right; }
                .report-summary-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 20px; }
                .report-summary-card { background: linear-gradient(135deg, #eff6ff, #f8fafc); border: 1px solid #dbeafe; border-radius: 14px; padding: 14px; }
                .report-summary-card span { display: block; color: #64748b; font-size: 13px; margin-bottom: 6px; }
                .report-summary-card strong { font-size: 22px; color: #0f172a; }
                .report-section { margin-bottom: 18px; }
                .report-section h3 { margin: 0 0 10px; font-size: 16px; color: #0f172a; }
                table { width: 100%; border-collapse: collapse; font-size: 12px; }
                th { background: #f1f5f9; padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0; }
                td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
                .empty-table-cell { color: #64748b; font-style: italic; }
                @media print { body { padding: 0; } .report-paper { box-shadow: none; } }
            </style>
        </head>
        <body>
            ${reportMarkup}
        </body>
        </html>
    `);
    reportWindow.document.close();
    setTimeout(() => {
        reportWindow.focus();
        reportWindow.print();
    }, 300);
}

function renderReportesModule() {
    const content = document.getElementById("main-content");
    const title = document.getElementById("title");
    if (!content || !title) return;

    title.innerHTML = "Reportes";
    const data = getReporteData();

    content.innerHTML = `
        <div class="module report-module">
            <div class="module-header">
                <div>
                    <h2>📄 Reportes profesionales</h2>
                    <p>Genera un documento ejecutivo listo para compartir o exportar en PDF.</p>
                </div>
                <button type="button" class="btn-primary" id="export-report-btn"><i class="fa-solid fa-file-pdf"></i> Exportar a PDF</button>
            </div>

            <div class="report-preview-card">
                <div class="report-toolbar">
                    <div>
                        <h3>Vista previa del reporte</h3>
                        <p>Resumen visual del estado actual del inventario y la actividad del sistema.</p>
                    </div>
                    <span class="report-badge">${escapeHtml(data.generatedAt)}</span>
                </div>
                ${buildReportMarkup(false)}
            </div>
        </div>
    `;

    document.getElementById("export-report-btn")?.addEventListener("click", exportReportToPdf);
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
            const inventario = getInventarioResumen();

            content.innerHTML = `
                <div class="cards">
                    <div class="card"><i class="fa-solid fa-box"></i><h2>${productosCount}</h2><p>Productos</p></div>
                    <div class="card"><i class="fa-solid fa-layer-group"></i><h2>${categoriasCount}</h2><p>Categorías</p></div>
                    <div class="card"><i class="fa-solid fa-triangle-exclamation"></i><h2>${alertasCount}</h2><p>Alertas</p></div>
                    <div class="card inventory-card">
                        <i class="fa-solid fa-dollar-sign"></i>
                        <h2>${formatearPrecio(inventario.valorTotal)}</h2>
                        <p>Valor de inventario</p>
                        <div class="card-footer">
                            <span>${inventario.totalUnidades} unidades</span>
                            <span>${alertasCount} alertas</span>
                        </div>
                    </div>
                </div>
                <div class="module">
                    <h2>📦 Estado general</h2>
                    <p>La conexión con la API está activa y los datos se están leyendo desde la base de datos.</p>
                </div>
            `;
        } catch (error) {
            const productosCount = productosState.length;
            const categoriasCount = categoriasState.length;
            const inventario = getInventarioResumen();
            const alertasCount = getAlertasProductos().length;
            content.innerHTML = `
                <div class="cards">
                    <div class="card"><i class="fa-solid fa-box"></i><h2>${productosCount}</h2><p>Productos</p></div>
                    <div class="card"><i class="fa-solid fa-layer-group"></i><h2>${categoriasCount}</h2><p>Categorías</p></div>
                    <div class="card"><i class="fa-solid fa-triangle-exclamation"></i><h2>${alertasCount}</h2><p>Alertas</p></div>
                    <div class="card inventory-card">
                        <i class="fa-solid fa-dollar-sign"></i>
                        <h2>${formatearPrecio(inventario.valorTotal)}</h2>
                        <p>Valor de inventario</p>
                        <div class="card-footer">
                            <span>${inventario.totalUnidades} unidades</span>
                            <span>${alertasCount} alertas</span>
                        </div>
                    </div>
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

    if (module === "alertas") {
        renderAlertasModule();
        return;
    }

    if (module === "reportes") {
        renderReportesModule();
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
