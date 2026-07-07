function actualizarHora() {
    const fecha = new Date();
    const hora = fecha.getHours().toString().padStart(2, "0");
    const minutos = fecha.getMinutes().toString().padStart(2, "0");
    const segundos = fecha.getSeconds().toString().padStart(2, "0");
    document.getElementById("hora").innerHTML = `${hora}:${minutos}:${segundos}`;
}

setInterval(actualizarHora, 1000);
actualizarHora();

async function loadModule(module) {
    const content = document.getElementById("main-content");
    const title = document.getElementById("title");

    if (module === "inicio") {
        title.innerHTML = "Dashboard";
        try {
            const response = await fetch("/api/dashboard");
            const data = await response.json();
            content.innerHTML = `
                <div class="cards">
                    <div class="card"><i class="fa-solid fa-box"></i><h2>${data.productos}</h2><p>Productos</p></div>
                    <div class="card"><i class="fa-solid fa-layer-group"></i><h2>${data.categorias}</h2><p>Categorías</p></div>
                    <div class="card"><i class="fa-solid fa-triangle-exclamation"></i><h2>${data.alertas}</h2><p>Alertas</p></div>
                    <div class="card"><i class="fa-solid fa-dollar-sign"></i><h2>$0</h2><p>Inventario</p></div>
                </div>
                <div class="module">
                    <h2>📦 Estado general</h2>
                    <p>La conexión con la API está activa y los datos se están leyendo desde la base de datos.</p>
                </div>
            `;
        } catch (error) {
            content.innerHTML = `<p>No se pudo cargar el dashboard.</p>`;
        }
        return;
    }

    if (module === "productos") {
        title.innerHTML = "Productos";
        try {
            const response = await fetch("/productos/");
            const productos = await response.json();
            const rows = productos.map((producto) => `
                <tr>
                    <td>${producto.nombre}</td>
                    <td>${producto.stock}</td>
                    <td>${producto.categoria?.nombre || "Sin categoría"}</td>
                </tr>
            `).join("");

            content.innerHTML = `
                <div class="module">
                    <div class="module-header">
                        <h2>📦 Gestión de Productos</h2>
                        <button class="btn-primary"><i class="fa-solid fa-plus"></i>Nuevo Producto</button>
                    </div>
                    <table>
                        <tr><th>Producto</th><th>Stock</th><th>Categoría</th></tr>
                        ${rows}
                    </table>
                </div>
            `;
        } catch (error) {
            content.innerHTML = `<p>No se pudo cargar la lista de productos.</p>`;
        }
        return;
    }

    if (module === "categorias") {
        title.innerHTML = "Categorías";
        try {
            const response = await fetch("/categorias/");
            const categorias = await response.json();
            const rows = categorias.map((categoria) => `
                <tr>
                    <td>${categoria.nombre}</td>
                    <td>${categoria.descripcion || "Sin descripción"}</td>
                </tr>
            `).join("");

            content.innerHTML = `
                <div class="module">
                    <div class="module-header">
                        <h2>🗂️ Gestión de Categorías</h2>
                        <button class="btn-primary"><i class="fa-solid fa-plus"></i>Nueva Categoría</button>
                    </div>
                    <table>
                        <tr><th>Nombre</th><th>Descripción</th></tr>
                        ${rows}
                    </table>
                </div>
            `;
        } catch (error) {
            content.innerHTML = `<p>No se pudo cargar la lista de categorías.</p>`;
        }
        return;
    }

    title.innerHTML = module;
    content.innerHTML = `<p>Módulo en construcción.</p>`;
}

window.loadModule = loadModule;
document.addEventListener("DOMContentLoaded", () => loadModule("inicio"));
