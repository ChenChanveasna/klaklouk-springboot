package com.example.klaklouk.service;

import com.example.klaklouk.model.Player;
import com.example.klaklouk.repository.PlayerRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class PlayerService {

    private final int DEFAULT_BALANCE = 999999999;
    private final PlayerRepository repository;
    private final Random random = new Random();

    public PlayerService(PlayerRepository repository) {
        this.repository = repository;
    }

    // --- Get or Create Player ---
    public Player getOrCreatePlayer(String name) {
        if (name == null || name.trim().isEmpty()) return null;
        String key = name.trim().toLowerCase();
        Player p = repository.getPlayer(name);
        if (p != null) return p;

        Player newP = new Player(name.trim(), DEFAULT_BALANCE, 0, 0);
        repository.save(newP);
        return newP;
    }

    // --- Leaderboard Top 5 ---
//    public List<Player> getLeaderboardTop5() {
//        List<Player> players = repository.findAll();
//        players.sort((a, b) -> b.getBalance() - a.getBalance());
//        return players.size() > 5 ? players.subList(0, 5) : players;
//    }

    // --- Roll Dice & Process All Bets ---
    // bets = Map<symbol, betAmount>
    public Map<String, Object> rollDice(Player player, Map<String, Integer> bets, int debug) {
        String[] symbols = {"TIGER", "GOURD", "ROOSTER", "SHRIMP", "CRAB", "FISH"};
        List<String> diceResult = new ArrayList<>();

        // Roll 3 dice
//        for (int i = 0; i < 3; i++) {
//            diceResult.add(symbols[random.nextInt(symbols.length)]);
//        }
        diceResult.add("TIGER");
        diceResult.add("GOURD");
        diceResult.add("ROOSTER");
        Map<String, Object> result = new HashMap<>();
//        result.put("debug from controller player obj hashcode ", debug);
//        result.put("debug from service player obj hashcode", player.hashCode());
        result.put("debug player object", player);
        result.put("debug player initial balance", player.getBalance());
        // Calculate winnings
        int totalWin = 0;
        for (Map.Entry<String, Integer> entry : bets.entrySet()) {
            String betSymbol = entry.getKey().toUpperCase();
            int betAmount = entry.getValue();
//            int matches = diceResult.stream().filter(d -> d.equals(betSymbol)).count();
            int matches = 0;
            for (String d : diceResult) {
                if (d.equals(betSymbol)) {
                    matches++;
                }
            }
            int win = matches * betAmount;
            result.put("debug win value", win);// x1, x2, x3
            totalWin += win + (matches > 0 ? betAmount : 0); // include initial bet if match
            result.put("debug total win value", totalWin);
        }

        // Deduct total bet from balance
        int totalBet = bets.values().stream().mapToInt(Integer::intValue).sum();
        result.put("debug total bet value", totalBet);
        player.setBalance(player.getBalance() - totalBet + totalWin);
        player.updateHighestBalance(); // update highest balance if needed
        result.put("debug player balance after calculated", player.getBalance());
        // Update total wins/losses
        if (totalWin > 0) player.setTotalWins(player.getTotalWins() + 1);
        else player.setTotalLosses(player.getTotalLosses() + 1);

        // Save player through repository
        repository.save(player);

        // Build response

        result.put("diceResult", diceResult);
        result.put("highest balance", player.getHighestBalance());
        result.put("balance", player.getBalance());
//        result.put("leaderboard", getLeaderboardTop5());

        return result;
    }
}
