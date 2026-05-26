document.addEventListener("DOMContentLoaded", function () {
  const botonesPerfil = document.querySelectorAll(".btnPerfil");
  const detallePerfil = document.getElementById("detallePerfil");

  if (!detallePerfil) return;

  botonesPerfil.forEach(function (boton) {
    boton.addEventListener("click", function () {
      const nombre = boton.getAttribute("data-perfil");
      const rol = boton.getAttribute("data-rol");
      const propuesta = boton.getAttribute("data-propuesta");
      const foto = boton.getAttribute("data-foto");

      detallePerfil.innerHTML = `
        <div class="detalle-contenido">
          <img class="detalle-foto" src="${foto}" alt="Retrato ficticio de ${nombre}">
          <div class="detalle-texto">
            <h3>Información del candidato</h3>
            <p><strong>Candidato/a:</strong> ${nombre}</p>
            <p><strong>Rol:</strong> ${rol}</p>
            <p><strong>Propuesta:</strong> ${propuesta}</p>
            <p><strong>Estado:</strong> Perfil de práctica académica</p>
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
    });
  });
});
