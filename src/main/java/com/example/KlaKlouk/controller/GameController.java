package com.example.KlaKlouk.controller;

import com.example.KlaKlouk.model.Player;
import com.example.KlaKlouk.service.PlayerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.Map;

@Controller
public class GameController {

    @Autowired
    private PlayerService playerService;

    @GetMapping("/login")
    public String loginPage() {
        return "login";
    }

    @PostMapping("/start")
    public String startGame(@RequestParam String username, HttpSession session) {
        Player player = playerService.loginOrCreate(username);
        session.setAttribute("player", player);
        return "redirect:/game";
    }

    @GetMapping("/game")
    public String gamePage(HttpSession session, Model model) {
        Player player = (Player) session.getAttribute("player");
        if (player == null) return "redirect:/login";
        model.addAttribute("player", player);
        return "game";
    }

    @PostMapping("/play")
    @ResponseBody
    public Map<String, Object> playRound(@RequestBody Map<String, Integer> bets, HttpSession session) {
        Player player = (Player) session.getAttribute("player");
        if (player == null) return Map.of("error", "Session expired.");

        Map<String, Object> result = playerService.playRound(player, bets);
        session.setAttribute("player", player);
        return result;
    }

    @PostMapping("/adjustBalance")
    @ResponseBody
    public Map<String, Object> adjustBalance(@RequestParam int amount, HttpSession session) {
        Player player = (Player) session.getAttribute("player");
        if (player == null) return Map.of("error", "Session expired.");

        int newBalance = player.getBalance() + amount;

        // Validate: prevent negative balance
        if (newBalance < 0) {
            return Map.of("error", "Insufficient balance", "newBalance", player.getBalance());
        }
        playerService.adjustBalance(player, amount);
        session.setAttribute("player", player);
        return Map.of("newBalance", player.getBalance());
    }

    @GetMapping("/leaderboard")
    public String leaderboard(Model model) {
        model.addAttribute("players", playerService.getAllPlayers().values());
        return "leaderboard";
    }
}
