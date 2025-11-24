# 🎲 Kla-Klok Spring Boot Game

A single-player traditional Khmer dice betting game built with **Java Spring Boot**, featuring simple **HTML/CSS/JS frontend** and **JSON-based data persistence**.

---

## 🧩 Features

- 🎮 **Single-player gameplay** — manage your bets and balance in continuous rounds.
- 💾 **Persistent player data** — saves username and balance in a JSON file.
- 🎲 **Randomized dice results** — uses Java’s `Random` for fair outcomes.
- 💰 **Betting system** — player places bets on six symbols.
- 🧠 **Game logic handled by models and services** (OOP-focused).
- 🌐 **Simple frontend** — clean interface using HTML, Tailwind CSS, and JS
- ⚙️ **Spring Boot backend** — lightweight REST structure for easy scalability.

---

## 🏗️ Tech Stack

| Layer           |      Technology       |
|-----------------|-----------------------|
| Backend         | Java 21, Spring Boot  |
| Frontend        | HTML, Tailwind Css, JS|
| Data Storage    | JSON (no DB required) |
| Build Tool      | Gradle                |
| Version Control | Git + GitHub          |

---

## Requirements
- Java JDK 17 or higher (tested on JDK 21)
- Gradle 8.x (if using Gradle)
- IntelliJ IDEA or any Java IDE

---
## Build & Run

1. Clone the repo and cd into it.
2. Open the project in IntelliJ IDEA or another IDE.
3. Build the project:
-Using Gradle:
```/bin/bash
./gradlew build
```
4. Run the application:
```/bin/bash
./gradlew bootRun    # Gradle  
```

## Data Persistence
The player’s name and balance are stored in `player.json` located in the project directory. 
The backend automatically loads and updates this file after each game round.

## Contributing
- Create a branch for your feature: `git checkout -b feature-name`
- Make changes and commit: `git commit -m "Add feature description"`
- Push your branch: `git push origin feature-name`
- Open a Pull Request for review.
