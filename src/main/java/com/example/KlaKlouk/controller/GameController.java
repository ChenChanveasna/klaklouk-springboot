package com.example.klaklouk.controller;

import com.example.klaklouk.model.Player;
import com.example.klaklouk.service.PlayerService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

import java.util.Map;

@Controller
@Validated
public class GameController {

    private final PlayerService service;

    public GameController(PlayerService service) {
        this.service = service;
    }

    // --- LOGIN ---
    @GetMapping("/login")
    public String loginPage() {
        return "login";
    }

    @PostMapping("/login")
    public String loginSubmit(@RequestParam String username, HttpSession session) {
        Player player = service.getOrCreatePlayer(username);
        session.setAttribute("player", player);
        return "redirect:/game";
    }

    // --- GAME PAGE ---
    @GetMapping("/game")
    public String showGamePage(HttpSession session, Model model) {
        Player player = (Player) session.getAttribute("player");
        if (player == null) return "redirect:/login";
        model.addAttribute("player", player);
//        model.addAttribute("leaderboard", service.getLeaderboardTop5());
        return "game";
    }

    // --- ROLL DICE (process all bets) ---
    @PostMapping("/game/result")
    @ResponseBody
    public Map<String, Object> rollDice(@Valid @RequestBody BetRequest betRequest, HttpSession session) {
        Player player = (Player) session.getAttribute("player");
        if (player == null) return Map.of("error", "Session expired.");

        int debug = player.hashCode(); //test

        Map<String, Object> result = service.rollDice(player, betRequest.getBets(), debug);
        session.setAttribute("player", player);
        return result;
    }
}
