document.addEventListener("DOMContentLoaded", function () {
  const contenedorCandidatos = document.querySelector(".contenedor-candidatos");
  const detallePerfil = document.getElementById("detallePerfil");

  if (!contenedorCandidatos || !detallePerfil) return;

  function mostrarDetalle(candidato) {
    detallePerfil.innerHTML = `
      <div class="detalle-contenido">
        <img class="detalle-foto" src="${candidato.foto}" alt="Retrato ficticio de ${candidato.nombre}">
        <div class="detalle-texto">
          <h3>Información del candidato</h3>
          <p><strong>Candidato/a:</strong> ${candidato.nombre}</p>
          <p><strong>Rol:</strong> ${candidato.rol}</p>
          <p><strong>Propuesta:</strong> ${candidato.propuesta}</p>
          <p><strong>Estado:</strong> ${candidato.estado}</p>
          <p>
            Este perfil es ficticio y se utiliza únicamente como parte de una práctica académica
            para aprender a construir interfaces de participación ciudadana.
          </p>
          <p>
            No corresponde a una candidatura real, no permite votar y no debe usar datos personales reales.
          </p>
        </div>
      </div>
    `;

    detallePerfil.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function crearTarjetaCandidato(candidato) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta-candidato";

    tarjeta.innerHTML = `
      <img class="foto-candidato" src="${candidato.foto}" alt="Retrato ficticio de ${candidato.nombre}">
      <h3>${candidato.nombre}</h3>
      <p><strong>Rol:</strong> ${candidato.rol}</p>
      <p><strong>Propuesta:</strong> ${candidato.propuesta}</p>
      <p><strong>Estado:</strong> ${candidato.estado}</p>
      <button type="button" class="btnPerfil">Ver información</button>
    `;

    const boton = tarjeta.querySelector(".btnPerfil");
    boton.addEventListener("click", function () {
      mostrarDetalle(candidato);
    });

    return tarjeta;
  }

  async function cargarCandidatos() {
    try {
      const respuesta = await fetch("/api/candidatos");

      if (!respuesta.ok) {
        throw new Error("No se pudo cargar la lista de candidatos.");
      }

      const candidatos = await respuesta.json();

      contenedorCandidatos.innerHTML = "";

      candidatos.forEach(function (candidato) {
        contenedorCandidatos.appendChild(crearTarjetaCandidato(candidato));
      });
    } catch (error) {
      contenedorCandidatos.innerHTML = `
        <p class="aviso">
          No se pudieron cargar los candidatos. Inicia el servidor con
          <strong>npm start</strong> y abre <strong>http://localhost:3000</strong>.
        </p>
      `;
      console.error(error);
    }
  }

  cargarCandidatos();
});
