const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PUERTO = 3000;
const CARPETA_CANDIDATOS = path.join(__dirname, "candidatos");
const ARCHIVO_ORDEN = path.join(CARPETA_CANDIDATOS, "orden.json");
const CARPETA_VOTOS = path.join(__dirname, "votos carpeta");
const ARCHIVO_VOTOS = path.join(CARPETA_VOTOS, "votos.json");

app.use(express.json());
app.use(express.static(path.join(__dirname)));

function leerJsonArchivo(archivo) {
  let contenido = fs.readFileSync(archivo, "utf8");

  if (contenido.charCodeAt(0) === 0xfeff) {
    contenido = contenido.slice(1);
  }

  return JSON.parse(contenido);
}

function leerOrden() {
  return leerJsonArchivo(ARCHIVO_ORDEN);
}

function guardarOrden(orden) {
  fs.writeFileSync(ARCHIVO_ORDEN, JSON.stringify(orden, null, 2) + "\n", "utf8");
}

function leerCandidatos() {
  const orden = leerOrden();
  const candidatos = [];

  for (const id of orden) {
    const archivoCandidato = path.join(CARPETA_CANDIDATOS, id, `${id}.json`);

    if (!fs.existsSync(archivoCandidato)) {
      continue;
    }

    const candidato = leerJsonArchivo(archivoCandidato);

    candidatos.push({
      id: id,
      ...candidato
    });
  }

  return candidatos;
}

function guardarCandidato(id, datos) {
  const carpetaCandidato = path.join(CARPETA_CANDIDATOS, id);
  const archivoCandidato = path.join(carpetaCandidato, `${id}.json`);

  const candidato = {
    nombre: datos.nombre,
    foto: datos.foto || `candidatos/${id}/${id}.jpg`,
    rol: datos.rol,
    propuesta: datos.propuesta,
    estado: datos.estado || "Perfil de práctica académica"
  };

  if (!fs.existsSync(carpetaCandidato)) {
    fs.mkdirSync(carpetaCandidato, { recursive: true });
  }

  fs.writeFileSync(
    archivoCandidato,
    JSON.stringify(candidato, null, 2) + "\n",
    "utf8"
  );

  const orden = leerOrden();

  if (!orden.includes(id)) {
    orden.push(id);
    guardarOrden(orden);
  }

  return {
    id: id,
    ...candidato
  };
}

function leerVotos() {
  if (!fs.existsSync(ARCHIVO_VOTOS)) {
    return [];
  }

  return leerJsonArchivo(ARCHIVO_VOTOS);
}

function guardarVotos(votos) {
  if (!fs.existsSync(CARPETA_VOTOS)) {
    fs.mkdirSync(CARPETA_VOTOS, { recursive: true });
  }

  fs.writeFileSync(ARCHIVO_VOTOS, JSON.stringify(votos, null, 2) + "\n", "utf8");
}

app.get("/api/candidatos", function (req, res) {
  try {
    const candidatos = leerCandidatos();
    res.json(candidatos);
  } catch (error) {
    res.status(500).json({ error: "No se pudieron leer los candidatos." });
  }
});

app.post("/api/candidatos", function (req, res) {
  try {
    const { id, nombre, rol, propuesta, foto, estado } = req.body;

    if (!id || !nombre || !rol || !propuesta) {
      return res.status(400).json({
        error: "Faltan datos obligatorios: id, nombre, rol y propuesta."
      });
    }

    const candidatoGuardado = guardarCandidato(id, {
      nombre,
      rol,
      propuesta,
      foto,
      estado
    });

    res.status(201).json(candidatoGuardado);
  } catch (error) {
    res.status(500).json({ error: "No se pudo guardar el candidato." });
  }
});

app.get("/api/votos", function (req, res) {
  try {
    const votos = leerVotos();
    res.json(votos);
  } catch (error) {
    res.status(500).json({ error: "No se pudieron leer los votos." });
  }
});

app.post("/api/votos", function (req, res) {
  try {
    const { identificacion, candidato } = req.body;

    if (!identificacion || !candidato) {
      return res.status(400).json({
        mensaje: "Faltan datos: identificación ficticia y candidato son obligatorios."
      });
    }

    const identificacionLimpia = String(identificacion).trim();
    const candidatoLimpio = String(candidato).trim();

    if (!identificacionLimpia || !candidatoLimpio) {
      return res.status(400).json({
        mensaje: "Completa identificación ficticia y selecciona un candidato."
      });
    }

    const candidatos = leerCandidatos();
    const nombresCandidatos = candidatos.map(function (c) {
      return c.nombre;
    });

    if (!nombresCandidatos.includes(candidatoLimpio)) {
      return res.status(400).json({
        mensaje: "El candidato seleccionado no está registrado en la plataforma."
      });
    }

    const votos = leerVotos();
    const yaVoto = votos.some(function (voto) {
      return voto.identificacion.toLowerCase() === identificacionLimpia.toLowerCase();
    });

    if (yaVoto) {
      return res.status(409).json({
        mensaje: "Esa identificación ficticia ya registró un voto pedagógico."
      });
    }

    const nuevoVoto = {
      identificacion: identificacionLimpia,
      candidato: candidatoLimpio,
      fecha: new Date().toLocaleString("es-CO")
    };

    votos.push(nuevoVoto);
    guardarVotos(votos);

    res.status(201).json({
      mensaje: "Voto pedagógico registrado correctamente.",
      voto: nuevoVoto
    });
  } catch (error) {
    res.status(500).json({ mensaje: "No se pudo registrar el voto." });
  }
});

app.listen(PUERTO, function () {
  console.log(`Servidor activo en http://localhost:${PUERTO}`);
});
