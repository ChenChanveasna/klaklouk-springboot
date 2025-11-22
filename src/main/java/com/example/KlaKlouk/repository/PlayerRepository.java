package com.example.klaklouk.repository;

import com.example.klaklouk.model.Player;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class PlayerRepository {
    private final Path filePath;
    private final Map<String, Player> players = new ConcurrentHashMap<>();
    private final ObjectMapper mapper = new ObjectMapper();

    // Constructor to determine file path
    public PlayerRepository(@Value("${players.file:}") String configuredPath) {
        if (configuredPath != null && !configuredPath.isBlank()) { // Use configured path if provided
            filePath = Path.of(configuredPath);
        } else {
            String appData = System.getenv("APPDATA");
            if (appData != null && !appData.isBlank()) {
                filePath = Path.of(appData, "klaklouk", "players.json");
            } else { // fallback to user home or current directory
                String userHome = System.getProperty("user.home");
                if (userHome != null && !userHome.isBlank()) {
                    filePath = Path.of(userHome, ".klaklouk", "players.json");
                } else {
                    filePath = Path.of(".", "data", "players.json");
                }
            }
        }

        try {
            Path parent = filePath.getParent();
            if (parent != null) Files.createDirectories(parent);
        } catch (IOException e) {
            throw new RuntimeException("Unable to create data directory for " + filePath, e);
        }
    }

    @PostConstruct
    public void init() {
        loadPlayers();
    }

    private void loadPlayers() {
        try {
        if (Files.exists(filePath)) {
            Map<String, Player> loaded = mapper.readValue(filePath.toFile(), new TypeReference<Map<String, Player>>() {});
            players.clear();
            loaded.forEach((k, v) -> players.put(normalizeKey(k), new Player(v)));
        } else {
            // Ensure directory exists and create an initial empty file
            Path parent = filePath.getParent();
            if (parent != null) Files.createDirectories(parent);
            saveAll();
        }
    } catch (IOException e) {
        throw new RuntimeException("Failed to load players from " + filePath, e);
    }
}

public synchronized void saveAll() {
    try {
        Path parent = filePath.getParent();
        if (parent != null) Files.createDirectories(parent);

        // Snapshot with defensive copies
        Map<String, Player> snapshot = new HashMap<>();
        players.forEach((k, v) -> snapshot.put(k, new Player(v)));

        mapper.writerWithDefaultPrettyPrinter().writeValue(filePath.toFile(), snapshot);
    } catch (IOException e) {
        throw new RuntimeException("Failed to save players to " + filePath, e);
    }
}

public void save(Player player) {
    if (player == null || player.getName() == null) return;
    String key = normalizeKey(player.getName());
    players.put(key, new Player(player)); // store defensive copy
    saveAll();
}

public Player getPlayer(String username) {
    if (username == null) return null;
    Player p = players.get(normalizeKey(username));
    return p == null ? null : new Player(p); // return defensive copy
}

private String normalizeKey(String s) {
    return s == null ? null : s.trim().toLowerCase();
}
}