# Poké Trunfo

<details>
  <summary><b>Click to read in English</b></summary>
  
## The Project

PokéTrumps is a browser-based Pokémon card game inspired by the classic Brazilian *Super Trunfo* format, combined with Pokédex-style mechanics and real-time Pokémon data integration. The project focuses on delivering a polished gameplay experience through responsive design, animated interfaces, and dynamic content consumption from the PokéAPI.

Live Demo: https://felipewkx.github.io/poke-trunfo/

---

# Overview

The application simulates a competitive card battle system where players compare Pokémon attributes against an AI-controlled opponent across multiple rounds. All Pokémon data, including images, stats, and types, are retrieved dynamically from the PokéAPI, eliminating the need for static datasets.

The interface was designed with a modern visual approach based on Glassmorphism concepts, layered gradients, animated effects, and adaptive layouts optimized for both desktop and mobile devices.

---

# Features

## Real-Time Pokémon Data

* Dynamic consumption of Pokémon data through the PokéAPI
* Automatic retrieval of:

  * Base stats
  * Pokémon types
  * Official artwork assets
* Asynchronous deck generation using concurrent API requests

## Gameplay System

* 10-round match system against a computer-controlled opponent
* Attribute-based battle mechanics
* Turn-based comparison logic using:

  * HP
  * Attack
  * Defense
  * Speed
* Automatic score tracking and battle progression

## Rare Card Mechanics

Special handling was implemented for rare Pokémon cards

## User Interface

### Glassmorphism Design

* Blur-based layered panels
* Transparent surfaces with gradient overlays
* Custom shadows and neon-inspired borders
* Animated holographic card effects for rare Pokémon

### Responsive Layout

The interface adapts to different screen sizes through responsive breakpoints:

* Desktop:

  * Horizontal battle arena
  * Side-by-side card presentation

* Mobile:

  * Vertical stacked layout
  * Touch-friendly interaction flow

## ## Pokédex Module

The Pokédex section was developed as part of the learning process inspired by content from Manual do Dev, serving as an additional exploration feature inside the project.

To integrate both experiences into a single application flow, the project uses an `iframe` structure to embed and unify the Pokédex interface directly within the Super Trunfo game environment, allowing seamless navigation between gameplay and Pokémon browsing without requiring separate pages or applications.

---

# Technical Implementation

## Frontend Stack

* HTML5
* CSS3
* JavaScript (ES6+)

## Core Concepts Used

### Asynchronous Data Handling

The application uses `fetch` and `Promise.all()` to load multiple Pokémon cards simultaneously, significantly improving deck generation performance.

### State Management Logic

Custom game state control was implemented to manage:

* Round progression
* Player interactions
* Score calculation
* Card locking during animations

### Responsive Engineering

Media Queries and flexible layout systems were used to ensure consistent behavior across desktop and mobile environments.

---

# Performance Considerations

## Optimized Deck Loading

Deck generation uses concurrent API requests instead of sequential loading.

Result:

* Simultaneous loading of 20 Pokémon cards
* Reduced loading time from approximately 10 seconds to under 2 seconds under normal conditions

## Interaction Lock System

A click-lock mechanism prevents duplicated actions during animations and state transitions, helping maintain interface consistency and gameplay stability.

---

# How to Play

1. Start a new match by clicking **Start Game**
2. Two random 10-card decks are generated
3. Analyze your current Pokémon card
4. Select one attribute:

   * HP
   * Attack
   * Defense
   * Agility
5. The opponent card is revealed automatically
6. The highest attribute value wins the round
7. Continue until all 10 rounds are completed
8. The player with the highest score wins the match

---

# API Reference

Pokémon data is provided by:

PokéAPI

---

# Development Notes

This project was developed with emphasis on:

* Frontend architecture practice
* API consumption
* Responsive interface design
* Animation systems in CSS
* DOM manipulation and state handling with vanilla JavaScript
* `iframe` structure
---

# Author

Developed by Felipe Walker

</details>

<details>
  <summary><b>Clique para ler em Português</b></summary>

## O Projeto

Poké-Trunfo é um jogo de cartas Pokémon para navegador inspirado no clássico formato brasileiro *Super Trunfo*, combinado com mecânicas no estilo Pokédex e integração de dados Pokémon em tempo real. O projeto foca em oferecer uma experiência de jogo refinada através de design responsivo, interfaces animadas e consumo dinâmico de conteúdo da PokéAPI.

Demonstração ao vivo: https://felipewkx.github.io/poke-trunfo/

---

# Visão geral

O aplicativo simula um sistema competitivo de batalhas de cartas onde os jogadores comparam os atributos de seus Pokémon contra um oponente controlado por IA em várias rodadas. Todos os dados dos Pokémon, incluindo imagens, estatísticas e tipos, são obtidos dinamicamente da PokéAPI, eliminando a necessidade de conjuntos de dados estáticos.

A interface foi projetada com uma abordagem visual moderna baseada em conceitos de Glassmorphism, gradientes em camadas, efeitos animados e layouts adaptáveis ​​otimizados para dispositivos desktop e móveis.

---

#Recursos

## Dados de Pokémon em Tempo Real

* Consumo dinâmico de dados de Pokémon através da PokéAPI
* Recuperação automática de:

* Estatísticas básicas
* Tipos de Pokémon
* Ilustrações oficiais
* Geração assíncrona de decks usando requisições simultâneas à API

## Sistema de Jogo

* Sistema de partidas de 10 rodadas contra um oponente controlado pelo computador
* Mecânicas de batalha baseadas em atributos
* Lógica de comparação por turnos usando:

* HP
* Ataque
* Defesa
* Velocidade
* Rastreamento automático de pontuação e progressão da batalha

## Mecânicas de Cartas Raras

Tratamento especial foi implementado para cartas de Pokémon raras

## Interface do Usuário

### Design Glassmorphism

* Painéis em camadas com base em desfoque
* Superfícies transparentes com sobreposições de gradiente
* Sombras personalizadas e bordas inspiradas em neon
* Efeitos holográficos animados para cartas de Pokémon raras

### Layout Responsivo

A interface se adapta a diferentes tamanhos de tela através de um design responsivo Breakpoints:

*Desktop:

* Arena de batalha horizontal
* Apresentação de cartas lado a lado

*Mobile:

* Layout vertical empilhado
* Fluxo de interação otimizado para toque

## ## Módulo Pokédex

A seção Pokédex foi desenvolvida como parte do processo de aprendizado, inspirada no conteúdo do Manual do Desenvolvedor, servindo como um recurso adicional de exploração dentro do projeto.

Para integrar ambas as experiências em um único fluxo de aplicativo, o projeto utiliza uma estrutura `iframe` para incorporar e unificar a interface da Pokédex diretamente no ambiente de jogo do Super Trunfo, permitindo uma navegação fluida entre a jogabilidade e a busca por Pokémon sem a necessidade de páginas ou aplicativos separados.

---

#Implementação Técnica

## Tecnologias de Frontend

* HTML5
* CSS3
* JavaScript (ES6+)

## Conceitos Principais Utilizados

### Manipulação Assíncrona de Dados

O aplicativo utiliza `fetch` e `Promise.all()` para carregar várias cartas de Pokémon simultaneamente, melhorando significativamente o desempenho da geração de decks.

### Lógica de Gerenciamento de Estado

O controle personalizado do estado do jogo foi implementado para gerenciar:

* Progressão da rodada
* Interações do jogador
* Cálculo da pontuação
* Bloqueio de cartas durante animações

### Engenharia Responsiva

Media Queries e sistemas de layout flexíveis foram usados ​​para garantir um comportamento consistente em ambientes desktop e mobile.

---

# Considerações de Desempenho

## Carregamento Otimizado de Baralho

A geração de baralho utiliza requisições de API simultâneas em vez de carregamento sequencial.

Resultado:

* Carregamento simultâneo de 20 cartas Pokémon
* Tempo de carregamento reduzido de aproximadamente 10 segundos para menos de 2 segundos em condições normais

## Sistema de Bloqueio de Interação

Um mecanismo de bloqueio por clique impede ações duplicadas durante animações e transições de estado, ajudando a manter a consistência da interface e a estabilidade da jogabilidade.

---

# Como Jogar

1. Inicie uma nova partida clicando em **Iniciar Jogo**
2. Dois baralhos aleatórios de 10 cartas serão gerados
3. Analise sua carta Pokémon atual
4. Selecione um atributo:

* HP
* Ataque
* Defesa
* Agilidade
5. A carta do oponente será revelada automaticamente
6. O jogador com o maior valor de atributo vence a rodada
7. Continue até completar as 10 rodadas
8. O jogador com a maior pontuação vence a partida

---

# Referência da API

Os dados de Pokémon são fornecidos por:

PokéAPI

---

# Notas de Desenvolvimento

Este projeto foi desenvolvido com ênfase em:

* Práticas de arquitetura de front-end
* Consumo de API
* Design de interface responsiva
* Sistemas de animação em CSS
* Manipulação do DOM e gerenciamento de estado com JavaScript puro
* Estrutura de `iframe`
---

# Autor

Desenvolvido por Felipe Walker

</details>
