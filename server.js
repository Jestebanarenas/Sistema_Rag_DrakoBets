const { MongoClient, ObjectId } = require("mongodb");
require('dotenv').config();

// Configuración de conexión
const uri = process.env.MONGO_URI || 'mongodb+srv://juan1702011916:Lupe@drakobets.sm7rm2c.mongodb.net/?appName=DrakoBets';
const dbName = process.env.DB_NAME || 'drakobets';
const resetFlag = process.argv.includes('--reset');

const client = new MongoClient(uri);

// Lista completa de tus colecciones
const collections = [
  'usuario', 'competencia', 'equipo', 'jugador', 'juego', 
  'premio', 'tipoApuesta', 'evento', 'transaccion', 
  'silla', 'apuesta', 'detalleApuesta', 'apuestCasino', 'apuestasCompetencias'
];

async function initialize() {
  try {
    await client.connect();
    const db = client.db(dbName);
    console.log(`✅ Conectado a la BD: ${dbName}`);

    // --- PASO 0: LIMPIEZA TOTAL (Si se usa --reset) ---
    if (resetFlag) {
        console.log('🧹 Limpiando todas las colecciones...');
        for (const col of collections) {
            await db.collection(col).deleteMany({});
        }
    }

    // --- VARIABLES DE REFERENCIA (Para enlazar datos entre sí) ---
    // Guardaremos los IDs generados aquí para usarlos en las colecciones hijas
    const refs = {
        usuarios: [],
        competencias: [],
        equipos: [],
        juegos: [],
        premios: [],
        tiposApuesta: [],
        eventos: [],
        apuestas: []
    };

    // =================================================================
    // NIVEL 1: CATÁLOGOS Y MAESTROS (No dependen de nadie)
    // =================================================================

    // 1. USUARIOS
    const colUsuario = db.collection('usuario');
    if (await colUsuario.countDocuments() === 0) {
        const usuarios = [
            { 
                cedulausuario: "101010", // Tu ID de negocio
                nombres: "Juan", apellidos: "Perez", correo: "juan@mail.com", 
                celular: "3001234567", fechanacimiento: new Date("1990-01-01"),
                bonos: [{ idbono: 1, montobono: 50, cedulausuario: "101010" }],
                estadobono: { idestadobono: 1, estadobono: "activo", fechavencimiento: new Date("2024-12-31") },
                _id: new ObjectId() 
            },
            { 
                cedulausuario: "202020", 
                nombres: "Maria", apellidos: "Gomez", correo: "maria@mail.com", 
                celular: "3109876543", fechanacimiento: new Date("1995-05-15"),
                bonos: [], 
                estadobono: { idestadobono: 2, estadobono: "inactivo", fechavencimiento: new Date("2023-01-01") },
                _id: new ObjectId()
            }
        ];
        await colUsuario.insertMany(usuarios);
        refs.usuarios = usuarios; // Guardamos para usar sus IDs y Cédulas luego
        console.log(`👤 Usuarios creados: ${usuarios.length}`);
    } else {
        refs.usuarios = await colUsuario.find().toArray();
    }

    // 2. COMPETENCIAS
    const colCompetencia = db.collection('competencia');
    if (await colCompetencia.countDocuments() === 0) {
        const competencias = [
            {
                nombrecompetencia: "Champions League",
                fechainicio: new Date("2023-09-01"), fechafin: new Date("2024-06-01"),
                descripcion: "Torneo de clubes europeos",
                deporte: { iddeporte: 1, nombredeporte: "Futbol", reglas: "FIFA", descripciondeporte: "11 vs 11" },
                logo: "champions.png",
                _id: new ObjectId()
            },
            {
                nombrecompetencia: "NBA",
                fechainicio: new Date("2023-10-01"), fechafin: new Date("2024-06-20"),
                descripcion: "Baloncesto profesional USA",
                deporte: { iddeporte: 2, nombredeporte: "Baloncesto", reglas: "FIBA/NBA", descripciondeporte: "5 vs 5" },
                logo: "nba.png",
                _id: new ObjectId()
            }
        ];
        await colCompetencia.insertMany(competencias);
        refs.competencias = competencias;
        console.log(`🏆 Competencias creadas: ${competencias.length}`);
    } else {
        refs.competencias = await colCompetencia.find().toArray();
    }

    // 3. EQUIPOS
    const colEquipo = db.collection('equipo');
    if (await colEquipo.countDocuments() === 0) {
        const equipos = [
            { nombre: "Real Madrid", paisEquipo: "España", ciudadEquipo: "Madrid", plantilla: "A", escudo: "rm.png", _id: new ObjectId() },
            { nombre: "Manchester City", paisEquipo: "Inglaterra", ciudadEquipo: "Manchester", plantilla: "A", escudo: "mc.png", _id: new ObjectId() },
            { nombre: "Lakers", paisEquipo: "USA", ciudadEquipo: "Los Angeles", plantilla: "A", escudo: "lal.png", _id: new ObjectId() }
        ];
        await colEquipo.insertMany(equipos);
        refs.equipos = equipos;
        console.log(`🛡️ Equipos creados: ${equipos.length}`);
    } else {
        refs.equipos = await colEquipo.find().toArray();
    }

    // 4. JUEGOS (Casino)
    const colJuego = db.collection('juego');
    if (await colJuego.countDocuments() === 0) {
        const juegos = [
            { tipojuego: "Slots", descripcionjuego: "Tragamonedas clásica", porcentajeganancia: 95.5, reglasjuego: "Alinear 3 símbolos", _id: new ObjectId() },
            { tipojuego: "Ruleta", descripcionjuego: "Ruleta Europea", porcentajeganancia: 97.3, reglasjuego: "Apostar a número o color", _id: new ObjectId() }
        ];
        await colJuego.insertMany(juegos);
        refs.juegos = juegos;
        console.log(`🎰 Juegos de casino creados: ${juegos.length}`);
    } else {
        refs.juegos = await colJuego.find().toArray();
    }

    // 5. TIPOS DE APUESTA
    const colTipoApuesta = db.collection('tipoApuesta');
    if (await colTipoApuesta.countDocuments() === 0) {
        const tipos = [
            { tipo: "Ganador del Partido", cuota: 1.5, _id: new ObjectId() },
            { tipo: "Más de 2.5 Goles", cuota: 2.1, _id: new ObjectId() }
        ];
        await colTipoApuesta.insertMany(tipos);
        refs.tiposApuesta = tipos;
        console.log(`📈 Tipos de apuesta creados: ${tipos.length}`);
    } else {
        refs.tiposApuesta = await colTipoApuesta.find().toArray();
    }

    // 6. PREMIOS
    const colPremio = db.collection('premio');
    if (await colPremio.countDocuments() === 0) {
        const premios = [
            { tipopremio: "Bono Bienvenida", descripcionpremio: "Crédito extra", fechavencimiento: new Date("2025-01-01"), _id: new ObjectId() }
        ];
        await colPremio.insertMany(premios);
        refs.premios = premios;
        console.log(`🎁 Premios creados: ${premios.length}`);
    } else {
        refs.premios = await colPremio.find().toArray();
    }

    // =================================================================
    // NIVEL 2: DEPENDIENTES (Usan datos del Nivel 1)
    // =================================================================

    // 7. JUGADORES (Dependen de Equipos)
    const colJugador = db.collection('jugador');
    if (await colJugador.countDocuments() === 0 && refs.equipos.length > 0) {
        const jugadores = [
            { 
                nombreJugador: "Vinicius", apellidoJugador: "Jr", edad: 23, nacionalidad: "Brasil", 
                idequipo: refs.equipos[0]._id, // Link al Real Madrid
                foto: "vini.jpg"
            },
            { 
                nombreJugador: "LeBron", apellidoJugador: "James", edad: 39, nacionalidad: "USA", 
                idequipo: refs.equipos[2]._id, // Link a Lakers
                foto: "lebron.jpg"
            }
        ];
        await colJugador.insertMany(jugadores);
        console.log(`⚽ Jugadores creados: ${jugadores.length}`);
    }

    // 8. EVENTOS (Dependen de Competencias y Equipos - simplificado)
    const colEvento = db.collection('evento');
    if (await colEvento.countDocuments() === 0 && refs.competencias.length > 0) {
        const eventos = [
            {
                idcompetencia: refs.competencias[0]._id, // Champions
                fecha: new Date(), ciudadpartido: "Madrid", paispartido: "España",
                ganador: null, estadisticas: { posesion: 50 }, // Corregido typo "stadSticas"
                descripcion: "Real Madrid vs Man City",
                _id: new ObjectId()
            }
        ];
        await colEvento.insertMany(eventos);
        refs.eventos = eventos;
        console.log(`📅 Eventos creados: ${eventos.length}`);
    } else {
        refs.eventos = await colEvento.find().toArray();
    }

    // 9. TRANSACCIONES (Dependen de Usuario)
    const colTransaccion = db.collection('transaccion');
    if (await colTransaccion.countDocuments() === 0 && refs.usuarios.length > 0) {
        const transacciones = [
            {
                cedulausuario: refs.usuarios[0].cedulausuario, // Usamos la cédula como pediste
                usuario_oid: refs.usuarios[0]._id, // BUENA PRÁCTICA: Guardar también el ObjectId para búsquedas rápidas
                monto: 50000, tipotransaccion: "deposito", fechahoratransaccion: new Date(),
                informacionbancaria: "Visa **** 1234"
            }
        ];
        await colTransaccion.insertMany(transacciones);
        console.log(`💸 Transacciones creadas: ${transacciones.length}`);
    }

    // 10. SILLA (Depende de Usuario y Juego - Casino en vivo?)
    const colSilla = db.collection('silla');
    if (await colSilla.countDocuments() === 0 && refs.usuarios.length > 0 && refs.juegos.length > 0) {
        const sillas = [
            {
                cedulausuario: refs.usuarios[0].cedulausuario,
                idjuego: refs.juegos[1]._id, // Ruleta
                fechahoraentrada: new Date(), fechahorasalida: null
            }
        ];
        await colSilla.insertMany(sillas);
        console.log(`🪑 Sillas ocupadas: ${sillas.length}`);
    }

    // 11. APUESTAS CASINO
    const colApuestCasino = db.collection('apuestCasino');
    if (await colApuestCasino.countDocuments() === 0) {
        const apCasino = [
            {
                cedulausuario: refs.usuarios[0].cedulausuario,
                idjuego: refs.juegos[0]._id, // Slots
                montoapostado: 100, resultado: "win", fechahora: new Date()
            }
        ];
        await colApuestCasino.insertMany(apCasino);
        console.log(`🎰 Apuestas Casino creadas: ${apCasino.length}`);
    }

    // =================================================================
    // NIVEL 3: COMPLEJOS (Apuestas deportivas)
    // =================================================================

    // 12. APUESTA (Cabecera de la apuesta)
    const colApuesta = db.collection('apuesta');
    if (await colApuesta.countDocuments() === 0 && refs.usuarios.length > 0) {
        const apuestas = [
            {
                cedulausuario: refs.usuarios[0].cedulausuario,
                idpremio: refs.premios.length > 0 ? refs.premios[0]._id : null,
                montoapostado: 20000, fechahora: new Date(),
                _id: new ObjectId()
            }
        ];
        await colApuesta.insertMany(apuestas);
        refs.apuestas = apuestas;
        console.log(`ticket Apuestas creadas: ${apuestas.length}`);
    } else {
        refs.apuestas = await colApuesta.find().toArray();
    }

    // 13. DETALLE APUESTA (Depende de Apuesta, TipoApuesta y Evento)
    const colDetalle = db.collection('detalleApuesta');
    if (await colDetalle.countDocuments() === 0 && refs.apuestas.length > 0 && refs.eventos.length > 0) {
        const detalles = [
            {
                idapuesta: refs.apuestas[0]._id, // Link al ticket padre
                idevento: refs.eventos[0]._id,   // Link al partido
                idtipoapuesta: refs.tiposApuesta[0]._id, // Link a "Ganador del partido"
                montogana: 30000, resultadoapuesta: "pendiente", fechahoraapuesta: new Date()
            }
        ];
        await colDetalle.insertMany(detalles);
        console.log(`📝 Detalles de apuesta creados: ${detalles.length}`);
    }

    // 14. APUESTAS COMPETENCIAS (Link tabla intermedia?)
    const colApComp = db.collection('apuestasCompetencias');
    if (await colApComp.countDocuments() === 0 && refs.apuestas.length > 0 && refs.competencias.length > 0) {
        const apComp = [
            {
                idapuesta: refs.apuestas[0]._id,
                idCompetencias: refs.competencias[0]._id // Link a la competencia
            }
        ];
        await colApComp.insertMany(apComp);
        console.log(`🔗 Relación Apuesta-Competencia creada: ${apComp.length}`);
    }

    // =================================================================
    // ÍNDICES RECOMENDADOS (Plan de Índices del Proyecto DrakoBets)
    // =================================================================
    console.log('⚙️ Creando índices optimizados (Plan de Índices)...');

    // =============================================================
    // 1. ÍNDICES COMPUESTOS (consultas más frecuentes)
    // =============================================================

    // TRANSACCIÓN → Consultar movimientos de un usuario por fecha
    await colTransaccion.createIndex(
        { cedulausuario: 1, fechahoratransaccion: -1 }
    );

    // APUESTA → Historial de apuestas de un usuario, ordenadas
    await colApuesta.createIndex(
        { cedulausuario: 1, fechahora: -1 }
    );

    // APUESTA (por estado) → Buscar apuestas activas, ganadas o perdidas
    await colApuesta.createIndex(
        { cedulausuario: 1, estado: 1 }
    );

    // APUESTA CASINO → Historial del usuario en juegos de casino
    await colApuestCasino.createIndex(
        { cedulausuario: 1, fechahora: -1 }
    );

    // EVENTO → Búsqueda por fecha y estado (partidos activos)
    await colEvento.createIndex(
        { fecha: 1, estado: 1 }
    );

    // COMPETENCIA → Consultar por deporte y fecha de inicio
    await colCompetencia.createIndex(
        { "deporte.nombredeporte": 1, fechainicio: -1 }
    );


    // =============================================================
    // 2. ÍNDICES DE TEXTO (Atlas Search / búsquedas de descripción)
    // =============================================================

    // EVENTO – búsqueda por nombres, equipos o descripciones
    await colEvento.createIndex(
        { descripcion: "text" }
    );

    // DETALLE APUESTA – búsquedas por texto del tipo de apuesta o descripción
    await colDetalle.createIndex(
        { resultadoapuesta: "text" }
    );

    // COMPETENCIA – búsquedas por nombre o descripción del torneo
    await colCompetencia.createIndex(
        { nombrecompetencia: "text", descripcion: "text" }
    );


    // =============================================================
    // 3. ÍNDICES DE METADATOS (para búsquedas híbridas del RAG)
    // =============================================================

    // EVENTO → filtrar por deporte en consultas vectoriales híbridas
    await colEvento.createIndex(
        { "deporte.nombredeporte": 1 }
    );

    // APUESTA → filtrar por estado dentro de búsquedas semánticas
    await colApuesta.createIndex(
        { estado: 1 }
    );

    // APUESTA CASINO → filtrar por juego
    await colApuestCasino.createIndex(
        { idjuego: 1 }
    );


    // =============================================================
    // 4. ÍNDICES ÚNICOS Y REFERENCIALES (ya correctos)
    // =============================================================

    // Usuarios únicos por cédula y correo
    await colUsuario.createIndex({ cedulausuario: 1 }, { unique: true });
    await colUsuario.createIndex({ correo: 1 }, { unique: true });

    // Relaciones FK para APIs
    await colJugador.createIndex({ idequipo: 1 });
    await colEvento.createIndex({ idcompetencia: 1 });
    await colDetalle.createIndex({ idapuesta: 1 });
    await colDetalle.createIndex({ idevento: 1 });

    console.log('✅ Índices optimizados creados correctamente.');


    console.log('✅ Inicialización COMPLETADA exitosamente.');

  } catch (err) {
    console.error('❌ Error en inicialización:', err);
  } finally {
    await client.close();
  }
}

initialize();