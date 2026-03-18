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
        estado = snapshot.data();
    } else {
        estado = { jugadores: [], sugerencias: [], partidas: {} };
        await setDoc(docRef, estado);
    }
    renderJugadores();
    renderSugerencias();
    renderPartidas();
    renderLudoteca();
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
    {
        bloque: 'Viernes tarde',
        partidas: [
            { id: 'v1', huecos: 4 },
            { id: 'v2', huecos: 4 },
        ]
    },
    {
        bloque: 'Sábado mañana',
        partidas: [
            { id: 'sm1', huecos: 3 },
            { id: 'sm2', huecos: 3 },
            { id: 'sm3', huecos: 4 },
        ]
    },
    {
        bloque: 'Sábado tarde',
        partidas: [
            { id: 'st1', huecos: 3 },
            { id: 'st2', huecos: 3 },
            { id: 'st3', huecos: 4 },
        ]
    },
    {
        bloque: 'Sábado noche',
        partidas: [
            { id: 'sn1', huecos: 3 },
            { id: 'sn2', huecos: 3 },
            { id: 'sn3', huecos: 4 },
        ]
    },
    {
        bloque: 'Domingo mañana',
        partidas: [
            { id: 'dm1', huecos: 3 },
            { id: 'dm2', huecos: 3 },
            { id: 'dm3', huecos: 3 },
        ]
    },
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

            const inputJuego = document.createElement('input');
            inputJuego.type = 'text';
            inputJuego.placeholder = 'Nombre del juego...';
            inputJuego.value = datos_partida.juego;
            inputJuego.addEventListener('change', async () => {
                if (!estado.partidas[partida.id]) estado.partidas[partida.id] = { juego: '', jugadores: Array(partida.huecos).fill('') };
                estado.partidas[partida.id].juego = inputJuego.value.trim();
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
            cabecera.appendChild(inputJuego);
            cabecera.appendChild(btnAleatorio);
            divPartida.appendChild(cabecera);

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
        li.innerHTML = `
  <div class="ludoteca-nombre"><strong>${item.juego}</strong></div>
  <div class="ludoteca-autor">· ${item.jugador}</div>
`;
        const btn = document.createElement('button');
        btn.textContent = '✕';
        btn.classList.add('btn-eliminar');
        btn.addEventListener('click', () => eliminarJuegoLudoteca(item.juego));

        li.querySelector('.ludoteca-nombre').appendChild(btn);
        lista.appendChild(li);
    });

    // Actualizar select
    const select = document.getElementById('select-jugador-ludoteca');
    select.innerHTML = '<option value="">-- Tu nombre --</option>';
    estado.jugadores.forEach(nombre => {
        const opt = document.createElement('option');
        opt.value = nombre;
        opt.textContent = nombre;
        select.appendChild(opt);
    });
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