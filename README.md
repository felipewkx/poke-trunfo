# Poké Trunfo
  
## The Project

PokéTrumps is a browser-based Pokémon card game inspired by the classic Brazilian *Super Trunfo* format, combined with Pokédex-style mechanics and real-time Pokémon data integration. The project focuses on delivering a polished gameplay experience through responsive design, animated interfaces, and dynamic content consumption from the PokéAPI.

Live Demo: https://felipewkx.github.io/poke-trunfo/

# Overview

The application simulates a competitive card battle system where players compare Pokémon attributes against an AI-controlled opponent across multiple rounds. All Pokémon data, including images, stats, and types, are retrieved dynamically from the PokéAPI, eliminating the need for static datasets.

The interface was designed with a modern visual approach based on Glassmorphism concepts, layered gradients, animated effects, and adaptive layouts optimized for both desktop and mobile devices.

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

# Performance Considerations

## Optimized Deck Loading

Deck generation uses concurrent API requests instead of sequential loading.

Result:

* Simultaneous loading of 20 Pokémon cards
* Reduced loading time from approximately 10 seconds to under 2 seconds under normal conditions

## Interaction Lock System

A click-lock mechanism prevents duplicated actions during animations and state transitions, helping maintain interface consistency and gameplay stability.

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

# API Reference

Pokémon data is provided by:

PokéAPI

# Development

This project was developed with emphasis on:

* Frontend architecture practice
* API consumption
* Responsive interface design
* Animation systems in CSS
* DOM manipulation and state handling with vanilla JavaScript
* `iframe` structure

# Author

Developed by Felipe Walker

----

# Note

This project is part of my portfolio and demonstrates the development of interactive web applications using external API integration, frontend state management, local data persistence, and the construction of responsive themed games.
