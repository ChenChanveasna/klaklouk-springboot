package com.example.klaklouk.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Player implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private String name;
    private int balance;
    private int totalWins;
    private int totalLosses;
    private int highestBalance;

    public Player() {}

    public Player(String name, int balance, int totalWins, int totalLosses) {
        this.name = name;
        this.balance = balance;
        this.totalWins = totalWins;
        this.totalLosses = totalLosses;
        this.highestBalance = balance;
    }

    // Copy constructor
    public Player(Player other) {
        this.name = other.name;
        this.balance = other.balance;
        this.totalWins = other.totalWins;
        this.totalLosses = other.totalLosses;
        this.highestBalance = other.highestBalance;
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

    public int getHighestBalance() { return highestBalance; }

    public void updateHighestBalance() {
        if (balance > highestBalance) {
            this.highestBalance = balance;
        }
    }

//    public double getWinRate() {
//        int totalGames = totalWins + totalLosses;
//        if (totalGames == 0) return 0.0;
//        return ((double) totalWins / totalGames) * 100.0;
//    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Player)) return false;
        Player player = (Player) o;
        return Objects.equals(normalize(name), normalize(player.name));
    }

    @Override
    public int hashCode() {
        return Objects.hash(normalize(name));
    }

    private String normalize(String s) {
        return s == null ? null : s.trim().toLowerCase();
    }
}