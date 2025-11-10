package com.example.KlaKlouk.model;

public class Player {
    private String username;
    private int balance;
    private int totalWins;
    private int totalLosses;

    public Player() {}
    public Player(String username, int balance) {
        this.username = username;
        this.balance = balance;
        this.totalWins = 0;
        this.totalLosses = 0;
    }

    // Getters and setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public int getBalance() { return balance; }
    public void setBalance(int balance) { this.balance = balance; }

    public int getTotalWins() { return totalWins; }
    public void setTotalWins(int totalWins) { this.totalWins = totalWins; }

    public int getTotalLosses() { return totalLosses; }
    public void setTotalLosses(int totalLosses) { this.totalLosses = totalLosses; }
}
