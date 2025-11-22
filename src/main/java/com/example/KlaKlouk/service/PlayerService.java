package com.example.klaklouk.service;

import com.example.klaklouk.model.Player;
import com.example.klaklouk.repository.PlayerRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class PlayerService {

    private final int DEFAULT_BALANCE = 10000;
    private final PlayerRepository repository;
    private final Random random = new Random();

    public PlayerService(PlayerRepository repository) {
        this.repository = repository;
    }

    // --- Get or Create Player ---
    public synchronized Player getOrCreatePlayer(String name) {
        if (name == null || name.trim().isEmpty()) return null;
        String key = name.trim().toLowerCase();
        Player p = repository.getPlayer(key);
        if (p != null) return p;

        Player newP = new Player(name.trim(), DEFAULT_BALANCE, 0, 0);
        repository.save(newP);
        return new Player(newP);
    }
    // --- Reset Game when player balance is 0 ---
    public synchronized void resetPlayer(Player player) {
        player.setBalance(DEFAULT_BALANCE);
        player.setTotalWins(0);
        player.setTotalLosses(0);
        player.updateHighestBalance();
        repository.save(player);
    }
    // --- Roll Dice & Process All Bets ---
    public Map<String, Object> rollDice(Player player, Map<String, Integer> bets) {
        String[] symbols = {"TIGER", "GOURD", "ROOSTER", "SHRIMP", "CRAB", "FISH"};
        List<String> diceResult = new ArrayList<>();

        if (bets == null || bets.isEmpty()) {
            throw new IllegalArgumentException("No bets were submitted.");
        }

        for (int i = 0; i < 3; i++) {
            diceResult.add(symbols[random.nextInt(symbols.length)]);
        }

        Map<String, Object> result = new HashMap<>();
        // Calculate winnings
        int totalWin = 0;
        for (Map.Entry<String, Integer> entry : bets.entrySet()) {
            String betSymbol = entry.getKey().toUpperCase();
            int betAmount = entry.getValue();
            int matches = 0;
            for (String d : diceResult) {
                if (d.equals(betSymbol)) {
                    matches++;
                }
            }
            int win = matches * betAmount;
            totalWin += win + (matches > 0 ? betAmount : 0); // include initial bet if match
        }
        
        // Deduct total bet from balance
        int totalBet = bets.values().stream().mapToInt(Integer::intValue).sum();
        if (totalBet > player.getBalance()) {
            throw new IllegalArgumentException("Total bet exceeds your current balance.");
        }

        // Update player stats
        player.setBalance(player.getBalance() - totalBet + totalWin);
        player.updateHighestBalance();
        if (totalWin > 0) player.setTotalWins(player.getTotalWins() + 1);
        else player.setTotalLosses(player.getTotalLosses() + 1);

        // Save player through repository
        repository.save(player);

        // Build response
        result.put("diceResult", diceResult);
        result.put("highest balance", player.getHighestBalance());
        result.put("balance", player.getBalance());
        result.put("totalWins", player.getTotalWins());
        result.put("totalLosses", player.getTotalLosses());
        result.put("winRate", player.getWinRate());

        return result;
    }
}