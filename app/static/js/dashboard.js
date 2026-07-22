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

let productosState = [...productosIniciales];

function actualizarHora() {
    const fecha = new Date();
    const hora = fecha.getHours().toString().padStart(2, "0");
    const minutos = fecha.getMinutes().toString().padStart(2, "0");
    const segundos = fecha.getSeconds().toString().padStart(2, "0");
    document.getElementById("hora").innerHTML = `${hora}:${minutos}:${segundos}`;
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

async function obtenerProductosApi() {
    const response = await fetch("/productos");
    if (!response.ok) {
        throw new Error("No se pudieron cargar los productos desde el servidor.");
    }
    return response.json();
}

async function crearProductoApi(producto) {
    const response = await fetch("/productos", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(producto)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "No se pudo guardar el producto.");
    }

    return response.json();
}

async function renderProductosModule() {
    const content = document.getElementById("main-content");
    const title = document.getElementById("title");

    title.innerHTML = "Productos";

    let productos = productosState;
    let categorias = categoriasState;
    let errorMessage = null;

    try {
        const [productosApi, categoriasApi] = await Promise.all([
            obtenerProductosApi(),
            obtenerCategoriasApi()
        ]);
        productos = productosApi;
        categorias = categoriasApi;
        productosState = productos;
        categoriasState = categorias;
    } catch (error) {
        errorMessage = error.message;
    }

    const rows = (productos || productosState).map((producto) => `
        <tr>
            <td>${producto.id}</td>
            <td>${producto.nombre}</td>
            <td>${producto.categoria?.nombre || producto.categoria || "Sin categoría"}</td>
            <td>${producto.stock}</td>
            <td>${formatearPrecio(producto.precio)}</td>
        </tr>
    `).join("");

    const categoryOptions = (categorias || categoriasState).map((cat) => `
        <option value="${cat.id}">${cat.nombre}</option>
    `).join("");

    content.innerHTML = `
        <div class="module">
            <div class="module-header">
                <div>
                    <h2>📦 Gestión de Productos</h2>
                    <p>Lista de productos disponible para controlar el inventario.</p>
                    ${errorMessage ? `<p class="error-message">${errorMessage}</p>` : ""}
                </div>
                <button type="button" class="btn-primary" id="show-product-form"><i class="fa-solid fa-plus"></i> Nuevo producto</button>
            </div>

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

    form?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const data = new FormData(form);
        const nuevoProducto = {
            nombre: data.get("nombre").toString().trim(),
            precio: Number(data.get("precio")),
            stock: Number(data.get("stock")),
            stock_minimo: 1,
            categoria_id: Number(data.get("categoria_id"))
        };

        if (!nuevoProducto.nombre || Number.isNaN(nuevoProducto.precio) || Number.isNaN(nuevoProducto.stock) || Number.isNaN(nuevoProducto.categoria_id)) {
            return;
        }

        try {
            const productoGuardado = await crearProductoApi(nuevoProducto);
            productosState = [productoGuardado, ...productosState.filter((p) => p.id !== productoGuardado.id)];
            renderProductosModule();
        } catch (error) {
            alert(error.message);
        }
    });
}

setInterval(actualizarHora, 1000);
actualizarHora();

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
            const alertasCount = productosState.filter((producto) => Number(producto.stock) <= 5).length;

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
                    <div class="card"><i class="fa-solid fa-triangle-exclamation"></i><h2>${productosState.filter((producto) => Number(producto.stock) <= 5).length}</h2><p>Alertas</p></div>
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

    loadModule("inicio");
});
