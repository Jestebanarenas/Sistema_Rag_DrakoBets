const { MongoClient } = require("mongodb");

// URL de conexión (usa la misma que tienes en server.js)
const uri = 'mongodb+srv://juan.1802011916:Lupe@drakobets.sm7rm2c.mongodb.net/?appName=DrakoBets';

// Configuración: puedes pasar DB con env var DB_NAME o primer arg
const dbName = process.env.DB_NAME || process.argv[2] || 'drakobets';
const resetFlag = process.argv.includes('--reset'); // borra colecciones antes de insertar

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Lista de colecciones en tu proyecto
const collections = [
  'apuesta','apuestCasino','apuestasCompetencias','competencia','detalleApuesta',
  'equipo','evento','juego','jugador','premio','silla','tipoApuesta','transaccion','usuario'
];

// Datos iniciales de ejemplo. Rellena o modifica según tu esquema.
const initialData = {
  usuario: [
    { nombre: 'Admin', email: 'admin@drakobets.com', saldo: 1000, rol: 'admin', creadoEn: new Date() },
    { nombre: 'UsuarioPrueba', email: 'user@drakobets.com', saldo: 500, rol: 'user', creadoEn: new Date() }
  ],
  equipo: [
    { nombre: 'Equipo A', pais: 'PaisA' },
    { nombre: 'Equipo B', pais: 'PaisB' }
  ],
  jugador: [
    { nombre: 'Jugador 1', numero: 9, equipo: 'Equipo A' }
  ],
  // Añade documentos de ejemplo para otras colecciones según tu esquema
  apuesta: [],
  apuestCasino: [],
  apuestasCompetencias: [],
  competencia: [],
  detalleApuesta: [],
  evento: [],
  juego: [],
  premio: [],
  silla: [],
  tipoApuesta: [],
  transaccion: []
};

// Índices recomendados (ajusta a tus campos)
const indexes = {
  usuario: [{ key: { email: 1 }, options: { unique: true } }],
  equipo: [{ key: { nombre: 1 }, options: { unique: false } }],
  jugador: [{ key: { nombre: 1 }, options: { unique: false } }]
};

async function initialize() {
  try {
    await client.connect();
    const db = client.db(dbName);
    console.log(`Conectado a la BD: ${dbName}`);

    for (const colName of collections) {
      const coll = db.collection(colName);

      if (resetFlag) {
        console.log(`--reset: limpiando colección '${colName}'`);
        await coll.deleteMany({});
      }

      const count = await coll.countDocuments();
      if (count === 0) {
        const docs = initialData[colName] || [];
        if (docs.length > 0) {
          const res = await coll.insertMany(docs);
          console.log(`Insertados ${res.insertedCount} docs en '${colName}'`);
        } else {
          console.log(`No hay datos de ejemplo para '${colName}'. Añade en 'initialData' si quieres insertar.`);
        }
      } else {
        console.log(`La colección '${colName}' ya tiene ${count} documentos — omitiendo inserción.`);
      }

      // Crear índices si están definidos
      if (indexes[colName]) {
        for (const idx of indexes[colName]) {
          try {
            await coll.createIndex(idx.key, idx.options || {});
            console.log(`Índice creado en '${colName}': ${JSON.stringify(idx.key)}`);
          } catch (err) {
            console.error(`Error creando índice en '${colName}':`, err.message);
          }
        }
      }
    }

    console.log('Inicialización completada.');
  } catch (err) {
    console.error('Error en inicialización:', err);
  } finally {
    await client.close();
    console.log('Conexión cerrada.');
  }
}

initialize().catch(err => {
  console.error(err);
  process.exit(1);
});
