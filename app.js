import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAcdf_NNIcUodsXhV6szld6BQOykJ2_Lh4",
    authDomain: "euroweekend.firebaseapp.com",
    projectId: "euroweekend",
    storageBucket: "euroweekend.firebasestorage.app",
    messagingSenderId: "906100848353",
    appId: "1:906100848353:web:1f074305f85e13ff6a69a0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const docRef = doc(db, 'app', 'datos');

let estado = {
    jugadores: [],
    sugerencias: [],
    partidas: {}
};

onSnapshot(docRef, async (snapshot) => {
    if (snapshot.exists()) {
        const data = snapshot.data();
        if (Object.keys(data).length > 0) {
            estado = data;
        }
    } else {
        estado = { jugadores: [], sugerencias: [], partidas: {} };
        await setDoc(docRef, estado);
    }
    renderJugadores();
    renderSugerencias();
    renderPartidas();
    renderLudoteca();
    renderVotaciones();
    renderComida();
    renderCompras()
});

async function guardarEstado() {
    await setDoc(docRef, estado);
}

// --- JUGADORES ---

function renderJugadores() {
    const lista = document.getElementById('lista-jugadores');
    lista.innerHTML = '';

    estado.jugadores.forEach(nombre => {
        const li = document.createElement('li');
        li.textContent = nombre;

        const btn = document.createElement('button');
        btn.textContent = '✕';
        btn.classList.add('btn-eliminar');
        btn.addEventListener('click', () => eliminarJugador(nombre));

        li.appendChild(btn);
        lista.appendChild(li);
    });

    renderSelectJugadores();
}

async function añadirJugador() {
    const input = document.getElementById('input-jugador');
    const nombre = input.value.trim();
    if (!nombre) return;

    if (estado.jugadores.includes(nombre)) {
        alert('Ese nombre ya está en la lista');
        return;
    }

    estado.jugadores.push(nombre);
    await guardarEstado();
    input.value = '';
}

async function eliminarJugador(nombre) {
    estado.jugadores = estado.jugadores.filter(j => j !== nombre);
    estado.sugerencias = estado.sugerencias.filter(s => s.jugador !== nombre);

    for (const id in estado.partidas) {
        if (estado.partidas[id].jugadores) {
            estado.partidas[id].jugadores = estado.partidas[id].jugadores.map(j => j === nombre ? '' : j);
        }
    }

    await guardarEstado();
}

// --- SUGERENCIAS ---

function renderSugerencias() {
    const lista = document.getElementById('lista-sugerencias');
    lista.innerHTML = '';

    estado.sugerencias.forEach(s => {
        const li = document.createElement('li');
        li.textContent = `${s.jugador}: ${s.juego}`;

        const btn = document.createElement('button');
        btn.textContent = '✕';
        btn.classList.add('btn-eliminar');
        btn.addEventListener('click', () => eliminarSugerencia(s.jugador));

        li.appendChild(btn);
        lista.appendChild(li);
    });
}

function renderSelectJugadores() {
    const select = document.getElementById('select-jugador');
    select.innerHTML = '<option value="">-- Elige tu nombre --</option>';

    estado.jugadores.forEach(nombre => {
        const option = document.createElement('option');
        option.value = nombre;
        option.textContent = nombre;
        select.appendChild(option);
    });
}

async function añadirSugerencia() {
    const jugador = document.getElementById('select-jugador').value;
    const juego = document.getElementById('input-juego').value.trim();

    if (!jugador) { alert('Elige tu nombre primero'); return; }
    if (!juego) return;

    if (estado.sugerencias.find(s => s.jugador === jugador)) {
        alert(`${jugador} ya ha hecho una sugerencia`);
        return;
    }

    estado.sugerencias.push({ jugador, juego });
    await guardarEstado();
    document.getElementById('input-juego').value = '';
}

async function eliminarSugerencia(jugador) {
    estado.sugerencias = estado.sugerencias.filter(s => s.jugador !== jugador);
    await guardarEstado();
}

// --- PARTIDAS ---

const PARTIDAS = [
    { bloque: 'Viernes tarde', partidas: [{ id: 'v1', huecos: 4 }, { id: 'v2', huecos: 4 }] },
    {
        bloque: 'Viernes noche',
        partidas: [
            { id: 'vn1', huecos: 4 },
            { id: 'vn2', huecos: 4 },
        ]
    },
    { bloque: 'Sábado mañana', partidas: [{ id: 'sm1', huecos: 3 }, { id: 'sm2', huecos: 3 }, { id: 'sm3', huecos: 4 }] },
    { bloque: 'Sábado tarde', partidas: [{ id: 'st1', huecos: 3 }, { id: 'st2', huecos: 3 }, { id: 'st3', huecos: 4 }] },
    { bloque: 'Sábado noche', partidas: [{ id: 'sn1', huecos: 3 }, { id: 'sn2', huecos: 3 }, { id: 'sn3', huecos: 4 }] },
    { bloque: 'Domingo mañana', partidas: [{ id: 'dm1', huecos: 3 }, { id: 'dm2', huecos: 3 }, { id: 'dm3', huecos: 3 }] },
];

function renderPartidas() {
    const datos = estado.partidas;
    const contenedor = document.getElementById('bloques-partidas');
    contenedor.innerHTML = '';

    PARTIDAS.forEach(bloque => {
        const divBloque = document.createElement('div');
        divBloque.classList.add('bloque');

        const titulo = document.createElement('h3');
        titulo.textContent = bloque.bloque;
        divBloque.appendChild(titulo);

        const filaPartidas = document.createElement('div');
        filaPartidas.classList.add('partidas-fila');

        bloque.partidas.forEach((partida, index) => {
            const datos_partida = datos[partida.id] || { juego: '', jugadores: Array(partida.huecos).fill('') };

            const divPartida = document.createElement('div');
            divPartida.classList.add('partida');

            const jugadoresReales = (datos_partida.jugadores || []).filter(j => j && j !== '');
            if (jugadoresReales.length === partida.huecos) {
                divPartida.classList.add('completa');
            }

            const cabecera = document.createElement('div');
            cabecera.classList.add('partida-cabecera');

            const label = document.createElement('span');
            label.textContent = `Partida ${index + 1}`;

            const filaJuego = document.createElement('div');
            filaJuego.classList.add('partida-fila-juego');

            const inputJuego = document.createElement('select');
            inputJuego.classList.add('partida-juego-select');

            const optDefault = document.createElement('option');
            optDefault.value = '';
            optDefault.textContent = 'Elige un juego...';
            inputJuego.appendChild(optDefault);

            (estado.ludoteca || []).forEach(j => {
                const opt = document.createElement('option');
                opt.value = j.juego;
                opt.textContent = j.juego;
                inputJuego.appendChild(opt);
            });

            inputJuego.value = datos_partida.juego;
            inputJuego.addEventListener('change', async () => {
                if (!estado.partidas[partida.id]) estado.partidas[partida.id] = { juego: '', jugadores: Array(partida.huecos).fill('') };
                estado.partidas[partida.id].juego = inputJuego.value;
                await guardarEstado();
            });

            const btnAleatorio = document.createElement('button');
            btnAleatorio.textContent = '🎲';
            btnAleatorio.classList.add('btn-dado');
            btnAleatorio.title = 'Rellenar con jugadores aleatorios';
            btnAleatorio.addEventListener('click', async (e) => {
                e.stopPropagation();

                const apuntadosEnBloque = bloque.partidas.flatMap(p =>
                    (estado.partidas[p.id]?.jugadores || []).filter(j => j && j !== '')
                );

                const yaEnPartida = (estado.partidas[partida.id]?.jugadores || []).filter(j => j && j !== '');
                const disponibles = estado.jugadores.filter(j =>
                    !apuntadosEnBloque.includes(j) && !yaEnPartida.includes(j)
                );

                const mezclados = disponibles.sort(() => Math.random() - 0.5);
                const huecosSobrantes = partida.huecos - yaEnPartida.length;
                const nuevos = mezclados.slice(0, huecosSobrantes);

                if (nuevos.length === 0) {
                    alert('No hay jugadores disponibles para esta partida');
                    return;
                }

                if (!estado.partidas[partida.id]) estado.partidas[partida.id] = { juego: '', jugadores: Array(partida.huecos).fill('') };

                const jugadoresActuales = [...(estado.partidas[partida.id].jugadores || Array(partida.huecos).fill(''))];
                let nuevoIdx = 0;
                for (let i = 0; i < jugadoresActuales.length && nuevoIdx < nuevos.length; i++) {
                    if (!jugadoresActuales[i] || jugadoresActuales[i] === '') {
                        jugadoresActuales[i] = nuevos[nuevoIdx++];
                    }
                }
                estado.partidas[partida.id].jugadores = jugadoresActuales;
                await guardarEstado();
            });

            cabecera.appendChild(label);
            divPartida.appendChild(cabecera);

            filaJuego.appendChild(inputJuego);
            filaJuego.appendChild(btnAleatorio);
            divPartida.appendChild(filaJuego);

            const divGrid = document.createElement('div');
            divGrid.classList.add('huecos-grid');
            divGrid.dataset.huecos = partida.huecos;

            for (let i = 0; i < partida.huecos; i++) {
                const jugador = datos_partida.jugadores[i] && datos_partida.jugadores[i] !== '' ? datos_partida.jugadores[i] : null;
                const divHueco = document.createElement('div');
                divHueco.classList.add('hueco');

                if (jugador) {
                    divHueco.classList.add('ocupado');
                    divHueco.innerHTML = `<span class="hueco-nombre">${jugador}</span>`;

                    const btnEliminar = document.createElement('button');
                    btnEliminar.textContent = '✕';
                    btnEliminar.classList.add('btn-eliminar');
                    btnEliminar.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        estado.partidas[partida.id].jugadores[i] = '';
                        await guardarEstado();
                    });
                    divHueco.appendChild(btnEliminar);

                } else {
                    divHueco.classList.add('vacio');
                    divHueco.innerHTML = `<span class="hueco-icono">+</span>`;

                    const select = document.createElement('select');
                    select.classList.add('hueco-select');

                    const optDefault = document.createElement('option');
                    optDefault.value = '';
                    optDefault.textContent = '— elegir —';
                    select.appendChild(optDefault);

                    const apuntadosEnBloque = bloque.partidas.flatMap(p =>
                        (estado.partidas[p.id]?.jugadores || []).filter(j => j && j !== '')
                    );

                    estado.jugadores.forEach(nombre => {
                        const yaApuntado = (estado.partidas[partida.id]?.jugadores || []).includes(nombre);
                        const yaEnBloque = apuntadosEnBloque.includes(nombre);
                        if (!yaApuntado && !yaEnBloque) {
                            const opt = document.createElement('option');
                            opt.value = nombre;
                            opt.textContent = nombre;
                            select.appendChild(opt);
                        }
                    });

                    select.addEventListener('change', async () => {
                        if (!select.value) return;
                        if (!estado.partidas[partida.id]) estado.partidas[partida.id] = { juego: '', jugadores: Array(partida.huecos).fill('') };
                        estado.partidas[partida.id].jugadores[i] = select.value;
                        await guardarEstado();
                    });

                    divHueco.addEventListener('click', () => select.focus());
                    divHueco.appendChild(select);
                }

                divGrid.appendChild(divHueco);
            }

            divPartida.appendChild(divGrid);
            filaPartidas.appendChild(divPartida);
        });

        divBloque.appendChild(filaPartidas);
        contenedor.appendChild(divBloque);
    });
}

// --- NAVEGACIÓN ---

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.seccion').forEach(s => s.classList.remove('activa'));

        btn.classList.add('active');
        document.getElementById(`seccion-${btn.dataset.seccion}`).classList.add('activa');
    });
});

// --- LUDOTECA ---

function renderLudoteca() {
    const lista = document.getElementById('lista-ludoteca');
    lista.innerHTML = '';

    (estado.ludoteca || []).forEach(item => {
        const li = document.createElement('li');
        li.classList.add('ludoteca-item');

        const nombre = document.createElement('span');
        nombre.classList.add('ludoteca-nombre');
        nombre.innerHTML = `<strong>${item.juego}</strong><span class="ludoteca-autor">· ${item.jugador}</span>`;

        const btn = document.createElement('button');
        btn.textContent = '✕';
        btn.classList.add('btn-eliminar');
        btn.addEventListener('click', () => eliminarJuegoLudoteca(item.juego));

        li.appendChild(nombre);
        li.appendChild(btn);
        lista.appendChild(li);
    });

    const select = document.getElementById('select-jugador-ludoteca');
    select.innerHTML = '<option value="">-- Tu nombre --</option>';
    estado.jugadores.forEach(nombre => {
        const opt = document.createElement('option');
        opt.value = nombre;
        opt.textContent = nombre;
        select.appendChild(opt);
    });

    renderSelectsVotacion();
}

async function añadirJuegoLudoteca() {
    const jugador = document.getElementById('select-jugador-ludoteca').value;
    const juego = document.getElementById('input-juego-ludoteca').value.trim();

    if (!jugador) { alert('Elige tu nombre primero'); return; }
    if (!juego) return;

    if ((estado.ludoteca || []).find(j => j.juego.toLowerCase() === juego.toLowerCase())) {
        alert('Ese juego ya está en la ludoteca');
        return;
    }

    if (!estado.ludoteca) estado.ludoteca = [];
    estado.ludoteca.push({ juego, jugador });
    await guardarEstado();
    document.getElementById('input-juego-ludoteca').value = '';
}

async function eliminarJuegoLudoteca(juego) {
    estado.ludoteca = (estado.ludoteca || []).filter(j => j.juego !== juego);
    await guardarEstado();
}

function renderSelectsVotacion() {
    document.querySelectorAll('.input-votacion').forEach(select => {
        const categoria = select.dataset.categoria;
        const yaAñadidos = (estado.votaciones?.[categoria] || []).map(j => j.juego);
        const valorActual = select.value;

        select.innerHTML = '<option value="">-- Elige un juego --</option>';

        (estado.ludoteca || []).forEach(item => {
            if (!yaAñadidos.includes(item.juego)) {
                const opt = document.createElement('option');
                opt.value = item.juego;
                opt.textContent = item.juego;
                select.appendChild(opt);
            }
        });

        select.value = valorActual;
    });
}

// --- VOTACIONES ---

const CATEGORIAS_VOTOS = ['3p', '3pl', '4p', '4pl', '5p'];

function renderVotaciones() {
    CATEGORIAS_VOTOS.forEach(cat => {
        const lista = document.getElementById(`votos-${cat}`);
        if (!lista) return;
        lista.innerHTML = '';

        const juegos = [...(estado.votaciones?.[cat] || [])].sort((a, b) => (b.votos?.length || 0) - (a.votos?.length || 0));

        juegos.forEach(item => {
            const li = document.createElement('li');
            li.classList.add('voto-item');

            const votantes = item.votos || [];

            const cabecera = document.createElement('div');
            cabecera.classList.add('voto-cabecera');

            const nombre = document.createElement('span');
            nombre.classList.add('voto-nombre');
            nombre.textContent = item.juego;

            const contador = document.createElement('span');
            contador.classList.add('voto-contador');
            contador.textContent = `· ${votantes.length} voto${votantes.length !== 1 ? 's' : ''}`;

            const btnEliminar = document.createElement('button');
            btnEliminar.textContent = '✕';
            btnEliminar.classList.add('btn-eliminar');
            btnEliminar.addEventListener('click', async () => {
                estado.votaciones[cat] = estado.votaciones[cat].filter(j => j.juego !== item.juego);
                await guardarEstado();
            });

            cabecera.appendChild(nombre);
            cabecera.appendChild(contador);
            cabecera.appendChild(btnEliminar);

            const divVotos = document.createElement('div');
            divVotos.classList.add('voto-jugadores');

            estado.jugadores.forEach(jugador => {
                const btnVoto = document.createElement('button');
                btnVoto.textContent = jugador;
                btnVoto.classList.add('btn-voto');
                if (votantes.includes(jugador)) btnVoto.classList.add('votado');

                btnVoto.addEventListener('click', async () => {
                    const juegoEnEstado = estado.votaciones[cat].find(j => j.juego === item.juego);
                    if (!juegoEnEstado) return;

                    const yaVotado = (juegoEnEstado.votos || []).includes(jugador);
                    if (yaVotado) {
                        juegoEnEstado.votos = juegoEnEstado.votos.filter(v => v !== jugador);
                    } else {
                        juegoEnEstado.votos = [...(juegoEnEstado.votos || []), jugador];
                    }
                    await guardarEstado();
                });

                divVotos.appendChild(btnVoto);
            });

            li.appendChild(cabecera);
            li.appendChild(divVotos);
            lista.appendChild(li);
        });
    });

    renderSelectsVotacion();
}

async function añadirJuegoVotacion(categoria, juego) {
    if (!juego) return;

    if (!estado.votaciones) estado.votaciones = {};
    if (!estado.votaciones[categoria]) estado.votaciones[categoria] = [];

    if (estado.votaciones[categoria].find(j => j.juego.toLowerCase() === juego.toLowerCase())) {
        alert('Ese juego ya está en esta categoría');
        return;
    }

    estado.votaciones[categoria].push({ juego, votos: [] });
    await guardarEstado();
}

// --- COMIDA ---

const CATEGORIAS_COMIDA = ['desayuno', 'almuerzo', 'cena', 'aperitivos', 'bebida'];
const OPCIONES_BBQ = ['sabado', 'domingo', 'ambas'];

function renderComida() {
    CATEGORIAS_COMIDA.forEach(cat => {
        const lista = document.getElementById(`comida-${cat}`);
        if (!lista) return;
        lista.innerHTML = '';

        (estado.comida?.[cat] || []).forEach(item => {
            const li = document.createElement('li');
            const span = document.createElement('span');
            span.textContent = item;

            span.addEventListener('mouseenter', () => {
                if (span.scrollWidth > span.clientWidth) {
                    span.classList.add('overflow-activo');
                }
            });
            span.addEventListener('mouseleave', () => {
                span.classList.remove('overflow-activo');
            });

            li.appendChild(span);

            const btn = document.createElement('button');
            btn.textContent = '✕';
            btn.classList.add('btn-eliminar');
            btn.addEventListener('click', async () => {
                estado.comida[cat] = estado.comida[cat].filter(i => i !== item);
                await guardarEstado();
            });

            li.appendChild(btn);
            lista.appendChild(li);
        });
    });

    OPCIONES_BBQ.forEach(opcion => {
        const divVotos = document.getElementById(`votos-bbq-${opcion}`);
        if (!divVotos) return;
        divVotos.innerHTML = '';

        const votantes = estado.bbq?.[opcion] || [];

        estado.jugadores.forEach(jugador => {
            const btn = document.createElement('button');
            btn.textContent = jugador;
            btn.classList.add('btn-voto');
            if (votantes.includes(jugador)) btn.classList.add('votado');

            btn.addEventListener('click', async () => {
                if (!estado.bbq) estado.bbq = {};
                if (!estado.bbq[opcion]) estado.bbq[opcion] = [];

                const yaVotado = estado.bbq[opcion].includes(jugador);
                if (yaVotado) {
                    estado.bbq[opcion] = estado.bbq[opcion].filter(v => v !== jugador);
                } else {
                    estado.bbq[opcion] = [...estado.bbq[opcion], jugador];
                }
                await guardarEstado();
            });

            divVotos.appendChild(btn);
        });

        const contador = document.createElement('span');
        contador.classList.add('voto-contador');
        contador.textContent = `${votantes.length} voto${votantes.length !== 1 ? 's' : ''}`;
        divVotos.appendChild(contador);
    });
}

async function añadirComida(categoria) {
    const input = document.querySelector(`.input-comida[data-categoria="${categoria}"]`);
    const item = input.value.trim();
    if (!item) return;

    if (!estado.comida) estado.comida = {};
    if (!estado.comida[categoria]) estado.comida[categoria] = [];

    if (estado.comida[categoria].includes(item)) {
        alert('Esa sugerencia ya está en la lista');
        return;
    }

    estado.comida[categoria].push(item);
    await guardarEstado();
    input.value = '';
}

// --- COMPRAS ---

function renderCompras() {
    const lista = document.getElementById('lista-compras');
    if (!lista) return;
    lista.innerHTML = '';

    (estado.compras || []).forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<span><strong>${item.producto}</strong> · ${item.precio}€ · ${item.jugador}</span>`;

        const btn = document.createElement('button');
        btn.textContent = '✕';
        btn.classList.add('btn-eliminar');
        btn.addEventListener('click', async () => {
            estado.compras = estado.compras.filter(c => c !== item);
            await guardarEstado();
        });

        li.appendChild(btn);
        lista.appendChild(li);
    });

    const select = document.getElementById('select-jugador-compras');
    if (!select) return;
    select.innerHTML = '<option value="">-- Tu nombre --</option>';
    estado.jugadores.forEach(nombre => {
        const opt = document.createElement('option');
        opt.value = nombre;
        opt.textContent = nombre;
        select.appendChild(opt);
    });
}

async function añadirCompra() {
    const jugador = document.getElementById('select-jugador-compras').value;
    const producto = document.getElementById('input-compra').value.trim();
    const precio = parseFloat(document.getElementById('input-precio').value);

    if (!jugador) { alert('Elige tu nombre primero'); return; }
    if (!producto) { alert('Escribe qué has comprado'); return; }
    if (isNaN(precio) || precio < 0) { alert('Introduce un precio válido'); return; }

    if (!estado.compras) estado.compras = [];
    estado.compras.push({ producto, precio, jugador });
    await guardarEstado();

    document.getElementById('input-compra').value = '';
    document.getElementById('input-precio').value = '';
}

// --- MODAL INFO ---

const INFO_TEXTOS = {
    'jugadores': { texto: 'Añade aquí tu nombre de jugador. Cada jugador debe registrarse para poder apuntarse a partidas y votar.' },
    'sugerencias-juego': { texto: 'Cada jugador puede proponer un juego al que le gustaría jugar durante el finde. Lo suyo es que cada uno pueda jugar como mínimo al juego propuesto.' },
    'ludoteca': { texto: 'Catálogo de juegos disponibles para el finde. Añade los juegos que traes para que todos sepan con qué contamos.', imagen: 'img/fran_ludoteca2.png' },
    'votaciones': { texto: 'Vota los juegos que más te apetece jugar según el número de jugadores. Los juegos se ordenan automáticamente por votos.' },
    'partidas': { texto: 'Organización de las partidas, esto ayudará a ir a tiro hecho para los que quieran aprenderse las reglas antes de ir. Solo puedes estar en una partida por franja. Usa el 🎲 para rellenar huecos aleatoriamente.', imagen: 'img/fran_partidas2.png' },
    'sugerencias-comida': { texto: 'Apunta lo que quieras traer o pedir en cada categoría. Cuanto antes lo añadas, mejor para organizarse.' },
    'bbq': { texto: '¿Hacemos barbacoa? Vota en qué días te apetece. Puedes votar más de una opción.' },
    'compras': { texto: 'Apunta aquí lo que hayas comprado para el finde con su precio. Así podemos ajustar cuentas al final.' },
};

document.querySelectorAll('.btn-info').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const info = INFO_TEXTOS[btn.dataset.info] || {};
        const imagen = document.getElementById('modal-imagen');

        document.getElementById('modal-texto').textContent = info.texto || '';

        if (info.imagen) {
            imagen.src = info.imagen;
            imagen.style.display = 'block';
        } else {
            imagen.src = '';
            imagen.style.display = 'none';
        }

        document.getElementById('modal-info').classList.add('visible');
    });
});

document.getElementById('modal-cerrar').addEventListener('click', () => {
    document.getElementById('modal-info').classList.remove('visible');
});

document.getElementById('modal-info').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-info')) {
        document.getElementById('modal-info').classList.remove('visible');
    }
});

// --- EVENTOS ---
document.getElementById('btn-añadir-jugador').addEventListener('click', añadirJugador);
document.getElementById('input-jugador').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') añadirJugador();
});
document.getElementById('btn-añadir-sugerencia').addEventListener('click', añadirSugerencia);
document.getElementById('input-juego').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') añadirSugerencia();
});
document.getElementById('btn-añadir-ludoteca').addEventListener('click', añadirJuegoLudoteca);
document.getElementById('input-juego-ludoteca').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') añadirJuegoLudoteca();
});
document.querySelectorAll('.btn-añadir-votacion').forEach(btn => {
    btn.addEventListener('click', () => {
        const categoria = btn.dataset.categoria;
        const select = document.querySelector(`.input-votacion[data-categoria="${categoria}"]`);
        const juego = select.value;
        if (juego) añadirJuegoVotacion(categoria, juego);
    });
});
document.querySelectorAll('.input-votacion').forEach(input => {
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') añadirJuegoVotacion(input.dataset.categoria);
    });
});
document.querySelectorAll('.btn-añadir-comida').forEach(btn => {
    btn.addEventListener('click', () => añadirComida(btn.dataset.categoria));
});
document.querySelectorAll('.input-comida').forEach(input => {
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') añadirComida(input.dataset.categoria);
    });
});

document.getElementById('btn-añadir-compra').addEventListener('click', añadirCompra);
document.getElementById('input-compra').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') añadirCompra();
});