async function fetchAbilityNameInSpanish(abilityUrl) {
    const response = await fetch(abilityUrl);
    const abilityData = await response.json();
    const spanishName = abilityData.names.find(name => name.language.name === 'es');
    return spanishName ? spanishName.name : 'Nombre no disponible';
}

async function fetchPokemonData() {
    const pokemonData = [];
    for (let i = 1; i <= 15; i++) {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`);
        const data = await response.json();

        // Obtener los tipos y sus sprites
        const types = await Promise.all(data.types.map(async (type) => {
            const typeResponse = await fetch(type.type.url);
            const typeData = await typeResponse.json();
            return {
                name: type.type.name,
                sprite: typeData.sprites['generation-viii']['sword-shield']['name_icon']
            };
        }));

        const abilities = await Promise.all(data.abilities.map(async (ability) => {
            return await fetchAbilityNameInSpanish(ability.ability.url);
        }));

        pokemonData.push({
            name: data.name,
            dex: i,
            image: data.sprites.other.showdown.front_default,
            abilities: abilities,
            types: types
        });
    }
    return pokemonData;
}

function createCard(pokemon) {
    return `
        <div class="col-md-4">
            <div class="card">
                <img src="${pokemon.image}" class="Pkm_gif" alt="${pokemon.name}">
                <div class="card-body text-center">
                    <h5 class="card-title">${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} # ${pokemon.dex}</h5>
                    <div>
                        ${pokemon.types.map(type => `<img src="${type.sprite}" alt="${type.name}" class="types_images">`).join('')}
                    </div>
                    <p class="card-text">
                        <h6>Habilidades</h6>
                        ${pokemon.abilities.map(ability => `<br>${ability}`).join('')}
                    </p>
            </div>
        </div>
    `;
}

async function displayCards() {
    const container = document.getElementById('card-container');
    const pokemonData = await fetchPokemonData();
    
    // Cargar opciones en el select
    const select = document.getElementById('pokemonSelect');
    pokemonData.forEach(pokemon => {
        const option = document.createElement('option');
        option.value = pokemon.name;
        option.textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
        select.appendChild(option);
    });

    // Mostrar todas las cards
    pokemonData.forEach(pokemon => {
        container.innerHTML += createCard(pokemon);
    });

    // Filtrar cards
    select.addEventListener('change', (event) => {
        const selectedPokemon = event.target.value;
        container.innerHTML = ''; // Limpiar el contenedor
        if (selectedPokemon === 'all') {
            pokemonData.forEach(pokemon => {
                container.innerHTML += createCard(pokemon);
            });
        } else {
            const filteredPokemon = pokemonData.find(p => p.name === selectedPokemon);
            if (filteredPokemon) {
                container.innerHTML += createCard(filteredPokemon);
            }
        }
    });
}

displayCards();