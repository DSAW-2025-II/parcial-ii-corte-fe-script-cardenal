
const BACKEND_URL = 'https://parcial-ii-corte-be-script-cardenal.vercel.app';

const loginBtn = document.getElementById('loginBtn');
const searchBtn = document.getElementById('searchBtn');
const authSection = document.getElementById('authSection');
const searchSection = document.getElementById('searchSection');
const pokemonResult = document.getElementById('pokemonResult');
const errorMessage = document.getElementById('errorMessage');
const authStatus = document.getElementById('authStatus');
const pokemonNameInput = document.getElementById('pokemonName');


async function login() {
    loginBtn.disabled = true;
    loginBtn.innerHTML = 'Iniciando sesión <span class="loading"></span>';

    try {
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
            localStorage.setItem('sessionToken', data.token);
            
            authStatus.innerHTML = '<div class="status success"> Autenticación exitosa</div>';
            
            setTimeout(() => {
                authSection.style.display = 'none';
                searchSection.classList.add('active');
                pokemonNameInput.focus(); // Dar foco al input
            }, 1000);
        } else {
            authStatus.innerHTML = '<div class="status error"> Credenciales inválidas</div>';
            loginBtn.disabled = false;
            loginBtn.innerHTML = 'Iniciar Sesión';
        }
    } catch (error) {
        console.error('Error en login:', error);
        authStatus.innerHTML = '<div class="status error"> Error de conexión con el servidor</div>';
        loginBtn.disabled = false;
        loginBtn.innerHTML = 'Iniciar Sesión';
    }
}


async function searchPokemon() {
    const pokemonName = pokemonNameInput.value.trim();

    if (!pokemonName) {
        alert('Por favor ingresa un nombre de Pokémon');
        return;
    }

    
    pokemonResult.classList.remove('active');
    errorMessage.classList.remove('active');

    searchBtn.disabled = true;
    searchBtn.innerHTML = 'Buscando <span class="loading"></span>';

    try {
        const token = localStorage.getItem('sessionToken');
        const response = await fetch(`${BACKEND_URL}/api/v1/pokemonDetails`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
                pokemonName: pokemonName
            })
        });

        const data = await response.json();

        if (response.status === 403) {
            alert('Sesión expirada. Por favor inicia sesión nuevamente.');
            localStorage.removeItem('sessionToken');
            location.reload();
            return;
        }

       
        if (response.ok && data.name) {
           
            document.getElementById('pokemonImg').src = data.img_url;
            document.getElementById('pokemonImg').alt = data.name;
            document.getElementById('pokemonNameResult').textContent = data.name;
            document.getElementById('pokemonSpecies').textContent = data.species;
            document.getElementById('pokemonWeight').textContent = data.weight;
            
            pokemonResult.classList.add('active');
        } else {
            errorMessage.classList.add('active');
        }
    } catch (error) {
        console.error('Error al buscar Pokémon:', error);
        errorMessage.innerHTML = 'Error de conexión con el servidor';
        errorMessage.classList.add('active');
    } finally {
        searchBtn.disabled = false;
        searchBtn.innerHTML = '🔎 Buscar Pokémon';
    }
}


loginBtn.addEventListener('click', login);

searchBtn.addEventListener('click', searchPokemon);

pokemonNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchPokemon();
    }
});


window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('sessionToken');
    
    if (token) {
        authSection.style.display = 'none';
        searchSection.classList.add('active');
    }
});