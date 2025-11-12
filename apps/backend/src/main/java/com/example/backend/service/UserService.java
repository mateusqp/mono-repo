package com.example.backend.service;

import com.example.backend.domain.User;
import com.example.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {
    
    private final UserRepository userRepository;
    
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    @Transactional
    public User createOrUpdateUser(String username, String name, String email, String cpf) {
        String cleanCpf = cpf != null ? cpf.replaceAll("[^\\d]", "") : null;
        
        User user = cleanCpf != null 
            ? userRepository.findByCpf(cleanCpf).orElse(null)
            : userRepository.findByUsername(username).orElse(null);
        
        if (user == null) {
            user = new User();
            user.setRole(User.Role.USER);
        }
        
        user.setUsername(username);
        user.setName(name);
        user.setEmail(email);
        user.setCpf(cleanCpf);
        
        return userRepository.save(user);
    }
    
    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            String cpf = jwt.getClaimAsString("cpf");
            if (cpf != null) {
                return userRepository.findByCpf(cpf.replaceAll("[^\\d]", "")).orElse(null);
            }
        }
        return null;
    }
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
