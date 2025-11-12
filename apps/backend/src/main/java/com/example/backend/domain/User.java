package com.example.backend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.envers.Audited;

import java.util.UUID;

@Entity
@Table(name = "app_user")
@Audited
@Getter
@Setter
@NoArgsConstructor
public class User extends Auditable {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false, unique = true)
    private String username;
    
    @Column(nullable = false)
    private String name;
    
    private String email;
    
    @Column(unique = true)
    private String cpf;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;
    
    @PrePersist
    @PreUpdate
    protected void normalizeCpf() {
        if (cpf != null) {
            cpf = cpf.replaceAll("[^\\d]", "");
        }
    }
    
    public enum Role {
        USER, ADMIN
    }
}
