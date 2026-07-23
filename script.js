/**
 * ChessAcademy - Script Principal (SPA y Mock API)
 */

// ========================================
// 1. NAVEGACIÓN SPA (Single Page Application)
// ========================================
function cambiarVista(vista) {
    const vistaLanding = document.getElementById('vista-landing');
    const vistaAdmin = document.getElementById('vista-admin');
    
    if (vista === 'landing') {
        vistaLanding.style.display = 'block';
        vistaAdmin.style.display = 'none';
        cargarCursos(); // Refrescar los cursos al volver
    } else if (vista === 'admin') {
        vistaLanding.style.display = 'none';
        vistaAdmin.style.display = 'block';
        cargarCursos(); // Refrescar la tabla al entrar
    }
}

// ========================================
// 2. BASE DE DATOS SIMULADA (Para que funcione sin backend por ahora)
// ========================================
let cursosDB = [
    {
        id: 1,
        nombre: "Jóvenes del Nuevo Ajedrez 2026",
        descripcion: "Programa intensivo para jóvenes promesas. Domina las aperturas clásicas y modernas con instructores de élite.",
        nivel: "Principiante",
        fecha: "2026-08-15",
        estado: "Inscripciones Abiertas",
        imagen: "theme-blue"
    },
    {
        id: 2,
        nombre: "Tácticas en Inglés - Fase II",
        descripcion: "Aprende terminología internacional mientras resuelves los puzzles tácticos más desafiantes del ámbito competitivo.",
        nivel: "Intermedio",
        fecha: "2026-09-01",
        estado: "En Curso",
        imagen: "theme-green"
    },
    {
        id: 3,
        nombre: "Programa de Maestros 2026-2028",
        descripcion: "Impulsa nuevos caminos en el ámbito profesional. Análisis profundo de partidas de campeones mundiales.",
        nivel: "Avanzado",
        fecha: "2026-10-10",
        estado: "Finalizado",
        imagen: "theme-dark"
    }
];

// ========================================
// 3. MÉTODOS DE LA API (CONEXIÓN REAL A FASTAPI)
// ========================================
const API_URL = "http://100.53.57.10:8000/api/cursos";

// GET: Obtener todos los cursos
async function apiGetCursos() {
    try {
        const respuesta = await fetch(API_URL);
        return await respuesta.json();
    } catch (error) {
        console.error("Error al obtener cursos:", error);
        return [];
    }
}

// POST: Crear un nuevo curso
async function apiPostCurso(nuevoCurso) {
    const respuesta = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoCurso)
    });
    return await respuesta.json();
}

// PUT: Actualizar un curso existente
async function apiPutCurso(id, datosActualizados) {
    const respuesta = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosActualizados)
    });
    return await respuesta.json();
}

// DELETE: Borrar un curso
async function apiDeleteCurso(id) {
    const respuesta = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
    });
    return await respuesta.json();
}

// ========================================
// 4. LÓGICA DE LA INTERFAZ (UI)
// ========================================

// Carga Inicial
document.addEventListener('DOMContentLoaded', () => {
    inicializarTablero();
    cargarCursos();
});

// Función central para leer (GET) y pintar la pantalla
async function cargarCursos() {
    const contenedorPublico = document.getElementById('contenedor-cursos-publico');
    const tablaAdmin = document.getElementById('tabla-cursos-admin');
    
    // Mostrar estado de carga
    if(contenedorPublico) contenedorPublico.innerHTML = '<div class="loading-text">Cargando cursos desde el servidor...</div>';
    
    // Llamar a la API
    const cursos = await apiGetCursos();
    
    // 1. Pintar Landing Page (Tarjetas visuales)
    if (contenedorPublico) {
        contenedorPublico.innerHTML = '';
        cursos.forEach(curso => {
            // Formatear la clase css del estado
            const claseEstado = curso.estado.toLowerCase().replace(' ', '-');
            
            const tarjetaHTML = `
                <div class="curso-card-visual">
                    <div class="curso-banner-visual ${curso.imagen}">
                        <span class="badge-nivel">${curso.nivel}</span>
                        <h3>${curso.nombre}</h3>
                    </div>
                    <div class="curso-body-visual">
                        <p class="descripcion">${curso.descripcion}</p>
                        <div>
                            <div class="curso-meta-info">
                                <div class="meta-row"><i class="far fa-calendar-alt"></i> Inicio: ${curso.fecha}</div>
                            </div>
                            <span class="status-badge ${claseEstado}">${curso.estado}</span>
                        </div>
                    </div>
                </div>
            `;
            contenedorPublico.innerHTML += tarjetaHTML;
        });
    }

    // 2. Pintar Tabla de Administración
    if (tablaAdmin) {
        tablaAdmin.innerHTML = '';
        cursos.forEach(curso => {
            const filaHTML = `
                <tr>
                    <td>#${curso.id}</td>
                    <td><strong>${curso.nombre}</strong></td>
                    <td>${curso.nivel}</td>
                    <td>${curso.fecha}</td>
                    <td>${curso.estado}</td>
                    <td>
                        <button class="btn-action edit" onclick="editarCurso(${curso.id})"><i class="fas fa-edit"></i> Editar</button>
                        <button class="btn-action delete" onclick="eliminarCurso(${curso.id})"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
            tablaAdmin.innerHTML += filaHTML;
        });
    }
}

// ========================================
// 5. LÓGICA DEL FORMULARIO Y MODAL (ADMIN)
// ========================================

function abrirModalCurso() {
    document.getElementById('form-curso').reset();
    document.getElementById('curso_id').value = '';
    document.getElementById('modal-titulo').innerText = 'Crear Nuevo Curso';
    document.getElementById('mensaje-admin').className = 'mensaje-form'; // Limpiar mensajes
    document.getElementById('modal-curso').classList.add('open');
}

function cerrarModalCurso() {
    document.getElementById('modal-curso').classList.remove('open');
}

// Pre-llenar el formulario para actualizar (GET by ID + PUT)
async function editarCurso(id) {
    const cursos = await apiGetCursos();
    const cursoAEditar = cursos.find(c => c.id === id);
    
    if (cursoAEditar) {
        document.getElementById('curso_id').value = cursoAEditar.id;
        document.getElementById('curso_nombre').value = cursoAEditar.nombre;
        document.getElementById('curso_descripcion').value = cursoAEditar.descripcion;
        document.getElementById('curso_nivel').value = cursoAEditar.nivel;
        document.getElementById('curso_fecha').value = cursoAEditar.fecha;
        document.getElementById('curso_estado').value = cursoAEditar.estado;
        document.getElementById('curso_imagen').value = cursoAEditar.imagen;
        
        document.getElementById('modal-titulo').innerText = 'Editar Curso';
        document.getElementById('mensaje-admin').className = 'mensaje-form';
        document.getElementById('modal-curso').classList.add('open');
    }
}

// Función que decide si Crear (POST) o Actualizar (PUT)
async function guardarCurso(event) {
    event.preventDefault();
    
    const boton = document.getElementById('btn-guardar-curso');
    const msgDiv = document.getElementById('mensaje-admin');
    const id = document.getElementById('curso_id').value;
    
    // Recolectar datos
    const datosCurso = {
        nombre: document.getElementById('curso_nombre').value,
        descripcion: document.getElementById('curso_descripcion').value,
        nivel: document.getElementById('curso_nivel').value,
        fecha: document.getElementById('curso_fecha').value,
        estado: document.getElementById('curso_estado').value,
        imagen: document.getElementById('curso_imagen').value
    };

    try {
        boton.disabled = true;
        boton.innerText = 'Guardando...';

        if (id === '') {
            // No hay ID, entonces CREAMOS (POST)
            await apiPostCurso(datosCurso);
            msgDiv.className = 'mensaje-form success';
            msgDiv.innerText = '¡Curso creado exitosamente!';
        } else {
            // Sí hay ID, entonces ACTUALIZAMOS (PUT)
            await apiPutCurso(parseInt(id), datosCurso);
            msgDiv.className = 'mensaje-form success';
            msgDiv.innerText = '¡Curso actualizado exitosamente!';
        }

        // Refrescar la tabla y cerrar tras un breve tiempo
        cargarCursos();
        setTimeout(cerrarModalCurso, 1500);

    } catch (error) {
        msgDiv.className = 'mensaje-form error';
        msgDiv.innerText = 'Error al guardar. Intente de nuevo.';
    } finally {
        boton.disabled = false;
        boton.innerText = 'Guardar Curso';
    }
}

// Función para Borrar (DELETE)
async function eliminarCurso(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este curso? Esta acción no se puede deshacer.')) {
        await apiDeleteCurso(id);
        cargarCursos(); // Refrescar la tabla tras borrar
    }
}

// ========================================
// 6. ANIMACIONES VISUALES
// ========================================
function inicializarTablero() {
    const tablero = document.getElementById('tablero-hero');
    if (!tablero) return;
    
    tablero.innerHTML = '';
    for (let i = 0; i < 64; i++) {
        const div = document.createElement('div');
        const esNegra = (i % 2 === 0 && Math.floor(i / 8) % 2 === 0) || 
                        (i % 2 !== 0 && Math.floor(i / 8) % 2 !== 0);
        
        div.className = `square ${esNegra ? 'dark' : 'light'}`;
        if (esNegra && Math.random() > 0.7) {
            div.classList.add('active');
        }
        tablero.appendChild(div);
    }
}
