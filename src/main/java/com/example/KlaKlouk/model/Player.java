package com.example.klaklouk.model;

import java.util.Objects;

public class Player {

    private String name;
    private int balance;
    private int totalWins;
    private int totalLosses;
    private int highestBalance;
    private double winRate;

    public Player() {}

    public Player(String name, int balance, int totalWins, int totalLosses) {
        this.name = name;
        this.balance = balance; // default starting balance
        this.totalWins = totalWins;
        this.totalLosses = totalLosses;
        this.highestBalance = balance;
        this.winRate = winRate;
    }

    // --- Getters & Setters ---
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getBalance() { return balance; }
    public void setBalance(int balance) { this.balance = balance; }

    public int getTotalWins() { return totalWins; }
    public void setTotalWins(int totalWins) { this.totalWins = totalWins; }

    public int getTotalLosses() { return totalLosses; }
    public void setTotalLosses(int totalLosses) { this.totalLosses = totalLosses; }

    public double getWinRate() {
        int totalGames = totalWins + totalLosses;
        if (totalGames == 0) return 0.0;
        return ((double) totalWins / totalGames) * 100.0;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Player)) return false;
        Player player = (Player) o;
        return Objects.equals(name, player.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name);
    }

    public int getHighestBalance() {
        return highestBalance;
    }
//
//    public void setHighestBalance(int highestBalance) {
//        this.highestBalance = highestBalance;
//    }

    public void updateHighestBalance() {
        if (balance > highestBalance) {
            this.highestBalance = balance;
        }
    }
}
