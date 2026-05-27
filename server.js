const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PUERTO = 3000;
const CARPETA_CANDIDATOS = path.join(__dirname, "candidatos");
const ARCHIVO_ORDEN = path.join(CARPETA_CANDIDATOS, "orden.json");

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

app.listen(PUERTO, function () {
  console.log(`Servidor activo en http://localhost:${PUERTO}`);
});
