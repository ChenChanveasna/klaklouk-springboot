package com.example.klaklouk.controller;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.Map;


public class BetRequest {
    @NotEmpty(message = "At least one bet is required.")
    private Map<@NotNull(message = "Symbol is required.")
               String,
               @NotNull(message = "Bet amount is required.")
               @Positive(message = "Bet amount must be positive.")
               Integer> bets;

    public Map<String, Integer> getBets() { return bets; }
    public void setBets(Map<String, Integer> bets) { this.bets = bets; }
}
