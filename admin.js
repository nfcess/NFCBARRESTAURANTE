const supabaseAdmin = supabase.createClient(
    window.SUPABASE_URL,
    window.SUPABASE_ANON_KEY
);

const loginForm = document.querySelector("#login-form");
const loginSection = document.querySelector("#login-section");
const dashboardSection = document.querySelector("#dashboard-section");
const loginStatus = document.querySelector("#login-status");
const feedbackList = document.querySelector("#feedback-list");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    const respuesta = await supabaseAdmin.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (respuesta.error) {
        loginStatus.textContent = "Correo o contraseña incorrectos.";
        return;
    }

    mostrarSugerencias();
});

async function mostrarSugerencias() {
    const respuesta = await supabaseAdmin
        .from("feedback")
        .select("id, message, rating, customer_name, contact, created_at")
        .eq("restaurant_id", window.RESTAURANT_ID)
        .order("created_at", { ascending: false });

    if (respuesta.error) {
        feedbackList.textContent = "No se pudieron cargar los mensajes.";
        return;
    }

    loginSection.hidden = true;
    dashboardSection.hidden = false;
    feedbackList.innerHTML = "";

    if (respuesta.data.length === 0) {
        feedbackList.innerHTML = "<p class='empty-state'>Todavía no llegaron sugerencias.</p>";
        return;
    }

    respuesta.data.forEach(function (sugerencia) {
        const fecha = new Date(sugerencia.created_at).toLocaleString("es-AR");
        const mensaje = document.createElement("article");
        mensaje.className = "feedback-item";

        const estrellas = sugerencia.rating ? "★".repeat(sugerencia.rating) : "Sin calificación";
        mensaje.innerHTML = `
            <small>${fecha} · ${estrellas}</small>
            <p></p>
            <small></small>
            <button class="delete-button" type="button">Borrar</button>
        `;

        mensaje.querySelector("p").textContent = sugerencia.message;
        mensaje.querySelectorAll("small")[1].textContent = [sugerencia.customer_name, sugerencia.contact]
            .filter(Boolean)
            .join(" · ");

        mensaje.querySelector(".delete-button").addEventListener("click", function () {
            borrarSugerencia(sugerencia.id);
        });

        feedbackList.appendChild(mensaje);
    });
}

async function borrarSugerencia(id) {
    const confirmar = confirm("¿Querés borrar esta sugerencia de forma permanente?");

    if (!confirmar) return;

    const respuesta = await supabaseAdmin
        .from("feedback")
        .delete()
        .eq("id", id)
        .eq("restaurant_id", window.RESTAURANT_ID);

    if (respuesta.error) {
        alert("No se pudo borrar la sugerencia: " + respuesta.error.message);
        return;
    }

    mostrarSugerencias();
}

document.querySelector("#logout-button").addEventListener("click", async function () {
    await supabaseAdmin.auth.signOut();
    dashboardSection.hidden = true;
    loginSection.hidden = false;
    loginForm.reset();
});

supabaseAdmin.auth.getSession().then(function (respuesta) {
    if (respuesta.data.session) {
        mostrarSugerencias();
    }
});
