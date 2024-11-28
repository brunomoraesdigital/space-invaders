// Seleção de elementos do DOM
// O DOM (Document Object Model) é a estrutura de objetos que representa a página web no navegador. Usamos o método `getElementById` para pegar os elementos específicos da página através dos seus IDs.
const botaoBuscarPokemon = document.getElementById('buscarPokemon'); // Aqui pegamos o botão onde o usuário clica para buscar o Pokémon.
const entradaNomeIdPokemon = document.getElementById('nomeIdPokemon'); // Pegamos o campo de entrada (input) onde o usuário digita o nome ou ID do Pokémon.
const informacoesPokemon = document.getElementById('informacoesPokemon'); // Pegamos a área onde vamos mostrar as informações do Pokémon.


// Função para buscar dados do Pokémon
// Esta função é responsável por pegar o nome ou ID do Pokémon digitado pelo usuário e fazer a requisição à API para buscar as informações.
async function buscarDadosPokemon() {
  // Pegamos o valor digitado no campo de entrada e fazemos o "trim" para remover espaços extras e transformamos para minúsculas para garantir que não importa a forma como o usuário digitar.
  const nomeOuId = entradaNomeIdPokemon.value.trim().toLowerCase();

  // Se o campo de entrada estiver vazio, mostramos uma mensagem para o usuário e paramos a execução da função.
  if (!nomeOuId) {
    informacoesPokemon.innerHTML = '<p>Por favor, digite um nome ou ID válido.</p>';
    return; // Se o valor estiver vazio, a função é interrompida aqui.
  }

  try {
    // A palavra-chave `await` é usada para esperar a resposta da requisição à API.
    // Estamos fazendo uma requisição GET para a API do Pokémon utilizando o nome ou ID do Pokémon.
    const resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${nomeOuId}`);
    
    // Se a resposta da requisição não for ok (status HTTP 200), jogamos um erro.
    if (!resposta.ok) {
      throw new Error('Pokémon não encontrado');
    }

    // Caso a resposta seja ok, usamos `.json()` para converter os dados recebidos em formato JSON.
    const dados = await resposta.json();

    // Agora que temos os dados do Pokémon, chamamos a função para buscar fraquezas e resistências.
    const fraquezasResistencias = await buscarFraquezasResistencias(dados.types);

    // Finalmente, chamamos a função que vai exibir os dados do Pokémon na página.
    exibirDadosPokemon(dados, fraquezasResistencias);
  } catch (erro) {
    // Se ocorrer qualquer erro (ex: Pokémon não encontrado ou erro na API), mostramos a mensagem de erro.
    informacoesPokemon.innerHTML = `<p style="color: red;">Erro: ${erro.message}</p>`;
  }
}


// Função para buscar fraquezas e resistências baseadas nos tipos do Pokémon
// Essa função recebe os tipos do Pokémon e vai buscar as fraquezas e resistências associadas a cada tipo.
async function buscarFraquezasResistencias(tipos) {
  // Usamos `Set` para garantir que não tenhamos fraquezas ou resistências repetidas.
  const fraquezas = new Set(); // Fraquezas são tipos que causam o dobro de dano ao Pokémon.
  const resistencias = new Set(); // Resistências são tipos que causam metade do dano ao Pokémon.

  // Para cada tipo do Pokémon, fazemos uma requisição à API de tipos para obter as informações sobre as fraquezas e resistências.
  for (const tipo of tipos) {
    const respostaTipo = await fetch(tipo.type.url); // Cada tipo possui uma URL que contém as informações detalhadas sobre ele.
    const dadosTipo = await respostaTipo.json(); // Pegamos os dados do tipo e convertemos para JSON.

    // Agora, verificamos as fraquezas do tipo, ou seja, os tipos que causam o dobro de dano a este Pokémon.
    dadosTipo.damage_relations.double_damage_from.forEach(tipoFraqueza =>
      fraquezas.add(tipoFraqueza.name) // Adicionamos cada fraqueza ao conjunto de fraquezas (set).
    );

    // Verificamos as resistências do tipo, ou seja, os tipos que causam metade do dano.
    dadosTipo.damage_relations.half_damage_from.forEach(tipoResistencia =>
      resistencias.add(tipoResistencia.name) // Adicionamos cada resistência ao conjunto de resistências (set).
    );
  }

  // Retornamos as fraquezas e resistências em arrays, ordenados para facilitar a visualização.
  return {
    fraquezas: Array.from(fraquezas).sort(),
    resistencias: Array.from(resistencias).sort(),
  };
}


// Função para exibir informações do Pokémon no DOM
// Esta função é chamada para exibir todas as informações que encontramos sobre o Pokémon, como nome, imagem, fraquezas, resistências e som.
function exibirDadosPokemon(pokemon, fraquezasResistencias) {
  // Montamos a URL para o som do Pokémon, utilizando o nome do Pokémon. Este arquivo de som está hospedado em um servidor externo.
  const somPokemonUrl = `https://play.pokemonshowdown.com/audio/cries/${pokemon.name.toLowerCase()}.mp3`;

  // Aqui estamos atualizando o conteúdo HTML da área onde vamos exibir as informações sobre o Pokémon.
  informacoesPokemon.innerHTML = `
    <h2>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h2> 
    <!-- Aqui capitalizamos a primeira letra do nome do Pokémon para exibi-la de forma mais bonita. -->
    <img src="${pokemon.sprites.front_default}" alt="Imagem de ${pokemon.name}"> 
    <!-- Exibimos a imagem do Pokémon. -->
    <p><strong>ID:</strong> ${pokemon.id}</p>
    <!-- Mostramos o ID do Pokémon. -->
    <p><strong>Altura:</strong> ${(pokemon.height * 10)} cm</p>
    <!-- Exibimos a altura em centímetros (a API retorna em metros, então multiplicamos por 10). -->
    <p><strong>Peso:</strong> ${(pokemon.weight / 10).toFixed(1)} kg</p>
    <!-- Exibimos o peso em kg (a API retorna em hectogramas, então dividimos por 10). -->
    <p><strong>Tipos:</strong> ${pokemon.types.map(tipo => tipo.type.name).join(', ')}</p>
    <!-- Exibimos os tipos do Pokémon, unindo-os com uma vírgula. -->
    <p><strong>Fraquezas:</strong> ${
      fraquezasResistencias.fraquezas.length
        ? fraquezasResistencias.fraquezas.join(', ') // Se houver fraquezas, mostramos, separando-as por vírgulas.
        : 'Nenhuma'
    }</p>
    <!-- Caso não haja fraquezas, mostramos 'Nenhuma'. -->
    <p><strong>Resistências:</strong> ${
      fraquezasResistencias.resistencias.length
        ? fraquezasResistencias.resistencias.join(', ') // O mesmo para resistências.
        : 'Nenhuma'
    }</p>
    <!-- Caso não haja resistências, mostramos 'Nenhuma'. -->
    <audio autoplay>
      <source src="${somPokemonUrl}" type="audio/mpeg"> 
      <!-- Adicionamos o áudio do Pokémon. A tag 'autoplay' faz o som começar automaticamente quando a página carrega. -->
      Seu navegador não suporta o elemento de áudio.
    </audio>
  `;
}


// Adicionar evento ao botão
// Aqui estamos adicionando um "ouvinte de evento" no botão, ou seja, estamos dizendo que quando o botão for clicado, a função `buscarDadosPokemon` será chamada.
botaoBuscarPokemon.addEventListener('click', buscarDadosPokemon);
