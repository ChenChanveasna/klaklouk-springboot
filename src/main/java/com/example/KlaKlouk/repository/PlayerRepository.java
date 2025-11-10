package com.example.KlaKlouk.repository;

import com.example.KlaKlouk.model.Player;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Repository;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Repository
public class PlayerRepository {

    private static final String FILE_PATH = "src/main/resources/players.json";
    private Map<String, Player> players = new HashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void init() {
        loadPlayers();
    }

    public void loadPlayers() {
        try {
            File file = new File(FILE_PATH);
            if (file.exists()) {
                players = objectMapper.readValue(file, new TypeReference<Map<String, Player>>() {});
            } else {
                players = new HashMap<>();
                savePlayers();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void savePlayers() {
        try {
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(new File(FILE_PATH), players);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public Player getPlayer(String username) {
        return players.get(username);
    }

    public void savePlayer(Player player) {
        players.put(player.getUsername(), player);
        savePlayers();
    }

    public boolean exists(String username) {
        return players.containsKey(username);
    }
}
