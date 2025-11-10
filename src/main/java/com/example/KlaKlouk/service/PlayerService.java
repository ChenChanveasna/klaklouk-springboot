package com.example.KlaKlouk.service;

import com.example.KlaKlouk.model.Player;
import com.example.KlaKlouk.repository.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class PlayerService {

    private static final List<String> SYMBOLS = List.of("Crab", "Rooster", "Fish", "Shrimp", "Tiger", "Gourd");

    @Autowired
    private PlayerRepository playerRepository;

    public Player loginOrCreate(String username) {
        Player player = playerRepository.getPlayer(username);
        if (player == null) {
            player = new Player(username, 10000); // default balance
            playerRepository.updatePlayer(player);
        }
        return player;
    }

    public Map<String, Object> playRound(Player player, Map<String, Integer> bets) {
        Map<String, Object> result = new HashMap<>();
        Random random = new Random();

        int totalBet = bets.values().stream().mapToInt(Integer::intValue).sum();
        if (player.getBalance() < totalBet) {
            result.put("error", "Insufficient balance.");
            return result;
        }

//        // Deduct immediately
//        player.setBalance(player.getBalance() - totalBet);

        // Roll 3 dice
        List<String> diceResults = new ArrayList<>();
        for (int i = 0; i < 3; i++) {
            diceResults.add(SYMBOLS.get(random.nextInt(SYMBOLS.size())));
        }

        int winnings = 0;
        for (String symbol : bets.keySet()) {
            int matchCount = 0;
            for (String dice : diceResults) {
                if (dice.equalsIgnoreCase(symbol)) matchCount++;
            }

            if (matchCount > 0) {
                winnings += bets.get(symbol) * (1 + matchCount);
            }
//            int occurrences = Collections.frequency(diceResults, symbol);
//            if (occurrences > 0) {
//                winnings += bets.get(symbol) * ( 1 + occurrences);
//            }
        }

        if (winnings > 0) {
            player.setBalance(player.getBalance() + winnings);
            player.setTotalWins(player.getTotalWins() + 1);
        } else {
            player.setTotalLosses(player.getTotalLosses() + 1);
        }

        playerRepository.updatePlayer(player);

        result.put("diceResults", diceResults);
        result.put("winnings", winnings);
        result.put("newBalance", player.getBalance());

        return result;
    }

    public void adjustBalance(Player player, int amountChange) {
        player.setTemp(player.getTempBalance() + amountChange);
        playerRepository.updatePlayer(player);
    }

    public Map<String, Player> getAllPlayers() {
        return playerRepository.getAllPlayers();
    }
}
