// ========================================
// CONFIGURACIÓN - CAMBIAR ESTA URL
// ========================================
// ⚠️ IMPORTANTE: Reemplaza con la URL de tu backend desplegado en Vercel
const BACKEND_URL = 'http://localhost:3000';
// Ejemplo: const BACKEND_URL = 'https://tu-backend.vercel.app';

// ========================================
// ELEMENTOS DEL DOM
// ========================================
const loginBtn = document.getElementById('loginBtn');
const searchBtn = document.getElementById('searchBtn');
const authSection = document.getElementById('authSection');
const searchSection = document.getElementById('searchSection');
const pokemonResult = document.getElementById('pokemonResult');
const errorMessage = document.getElementById('errorMessage');
const authStatus = document.getElementById('authStatus');
const pokemonNameInput = document.getElementById('pokemonName');

// ========================================
// FUNCIÓN DE LOGIN
// ========================================
async function login() {
    // Deshabilitar botón mientras se procesa
    loginBtn.disabled = true;
    loginBtn.innerHTML = 'Iniciando sesión <span class="loading"></span>';

    try {
        // Hacer petición POST al endpoint de autenticación
        const response = await fetch(`${BACKEND_URL}/api/v1/auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@admin.com',
                password: 'admin'
            })
        });

        const data = await response.json();

        if (response.ok && data.token) {
            // ✅ Autenticación exitosa
            
            // Guardar token en localStorage
            localStorage.setItem('sessionToken', data.token);
            
            // Mostrar mensaje de éxito
            authStatus.innerHTML = '<div class="status success">✅ Autenticación exitosa</div>';
            
            // Después de 1 segundo, ocultar sección de auth y mostrar búsqueda
            setTimeout(() => {
                authSection.style.display = 'none';
                searchSection.classList.add('active');
                pokemonNameInput.focus(); // Dar foco al input
            }, 1000);
        } else {
            // ❌ Credenciales inválidas
            authStatus.innerHTML = '<div class="status error">❌ Credenciales inválidas</div>';
            loginBtn.disabled = false;
            loginBtn.innerHTML = '🔐 Iniciar Sesión';
        }
    } catch (error) {
        // ❌ Error de conexión
        console.error('Error en login:', error);
        authStatus.innerHTML = '<div class="status error">❌ Error de conexión con el servidor</div>';
        loginBtn.disabled = false;
        loginBtn.innerHTML = '🔐 Iniciar Sesión';
    }
}

// ========================================
// FUNCIÓN PARA BUSCAR POKÉMON
// ========================================
async function searchPokemon() {
    const pokemonName = pokemonNameInput.value.trim();

    // Validar que no esté vacío
    if (!pokemonName) {
        alert('⚠️ Por favor ingresa un nombre de Pokémon');
        return;
    }

    // Ocultar resultados anteriores
    pokemonResult.classList.remove('active');
    errorMessage.classList.remove('active');

    // Deshabilitar botón mientras se busca
    searchBtn.disabled = true;
    searchBtn.innerHTML = 'Buscando <span class="loading"></span>';

    try {
        // Obtener token del localStorage
        const token = localStorage.getItem('sessionToken');

        // Hacer petición POST al endpoint protegido
        const response = await fetch(`${BACKEND_URL}/api/v1/pokemonDetails`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Enviar token JWT
            },
            body: JSON.stringify({
                pokemonName: pokemonName
            })
        });

        const data = await response.json();

        // Verificar si el token expiró o no es válido
        if (response.status === 403) {
            alert('🔒 Sesión expirada. Por favor inicia sesión nuevamente.');
            localStorage.removeItem('sessionToken');
            location.reload();
            return;
        }

        // Verificar si se encontró el Pokémon
        if (response.ok && data.name) {
            // ✅ Pokémon encontrado
            
            // Llenar información en el DOM
            document.getElementById('pokemonImg').src = data.img_url;
            document.getElementById('pokemonImg').alt = data.name;
            document.getElementById('pokemonNameResult').textContent = data.name;
            document.getElementById('pokemonSpecies').textContent = data.species;
            document.getElementById('pokemonWeight').textContent = data.weight;
            
            // Mostrar resultado
            pokemonResult.classList.add('active');
        } else {
            // ❌ Pokémon no encontrado
            errorMessage.classList.add('active');
        }
    } catch (error) {
        // ❌ Error de conexión
        console.error('Error al buscar Pokémon:', error);
        errorMessage.innerHTML = '❌ Error de conexión con el servidor';
        errorMessage.classList.add('active');
    } finally {
        // Rehabilitar botón
        searchBtn.disabled = false;
        searchBtn.innerHTML = '🔎 Buscar Pokémon';
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

// Botón de login
loginBtn.addEventListener('click', login);

// Botón de búsqueda
searchBtn.addEventListener('click', searchPokemon);

// Permitir buscar con la tecla Enter
pokemonNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchPokemon();
    }
});

// ========================================
// VERIFICAR TOKEN AL CARGAR LA PÁGINA
// ========================================
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('sessionToken');
    
    // Si ya existe un token, ir directo a la búsqueda
    if (token) {
        authSection.style.display = 'none';
        searchSection.classList.add('active');
    }
});