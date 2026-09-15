const supabaseCliente = supabase.createClient(
    window.SUPABASE_URL,
    window.SUPABASE_ANON_KEY
);

const formulario = document.querySelector("#feedback-form");
const estadoFormulario = document.querySelector("#form-status");
const botonEnviar = document.querySelector("#submit-button");

formulario.addEventListener("submit", async function (event) {
    event.preventDefault();

    const datos = new FormData(formulario);

    botonEnviar.disabled = true;
    estadoFormulario.textContent = "Enviando...";

    const respuesta = await supabaseCliente.from("feedback").insert({
        restaurant_id: window.RESTAURANT_ID,
        message: datos.get("message").trim(),
        rating: datos.get("rating") ? Number(datos.get("rating")) : null,
        customer_name: datos.get("name").trim() || null,
        contact: datos.get("contact").trim() || null
    });

    if (respuesta.error) {
        estadoFormulario.textContent = "No se pudo enviar. Probá nuevamente.";
        botonEnviar.disabled = false;
        return;
    }

    formulario.reset();
    estadoFormulario.textContent = "¡Gracias! Tu sugerencia fue enviada de forma privada.";
    botonEnviar.disabled = false;
});
