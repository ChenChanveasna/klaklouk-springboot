package com.example.klaklouk.repository;

import com.example.klaklouk.model.Player;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Repository;

import java.io.File;
import java.io.IOException;
import java.util.*;

@Repository
public class PlayerRepository {
    private static final String FILE_PATH = "src/main/resources/data/players.json";
    private Map<String, Player> players = new HashMap<>();
    private final ObjectMapper mapper = new ObjectMapper();

    @PostConstruct
    public void init() {
        loadPlayers();
    }

    public void loadPlayers() {
        System.out.println("LoadPlayer triggered");
        try {
            File file = new File(FILE_PATH);
            System.out.println(file);
            System.out.println("Is file exist?"+ file.exists());
            if (file.exists()) {
                players = mapper.readValue(file, new TypeReference<Map<String, Player>>() {});
            } else {
                players = new HashMap<>();
                saveAll();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

//    public List<Player> findAll() {
//        try {
//            File file = new File(FILE_PATH);
//            if (!file.exists()) return new ArrayList<>();
//            return mapper.readValue(file, new TypeReference<List<Player>>() {});
//        } catch (IOException e) {
//            e.printStackTrace();
//            return new ArrayList<>();
//        }
//    }

    //    public void saveAll(List<Player> players) {
//        try {
//            File file = new File(FILE_PATH);
//            file.getParentFile().mkdirs();
//            mapper.writerWithDefaultPrettyPrinter().writeValue(file, players);
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
//    }
    public void saveAll() {
        try {
            mapper.writerWithDefaultPrettyPrinter().writeValue(new File(FILE_PATH), players);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void save(Player player) {
        players.put(player.getName(), player);
        saveAll();
    }

    public Player getPlayer(String username) {
        return players.get(username);
    }

}
