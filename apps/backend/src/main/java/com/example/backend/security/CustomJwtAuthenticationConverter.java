package com.example.backend.security;

import com.example.backend.domain.User;
import com.example.backend.service.UserService;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Collections;

@Component
public class CustomJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {
    
    private final UserService userService;
    
    public CustomJwtAuthenticationConverter(UserService userService) {
        this.userService = userService;
    }
    
    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        String username = jwt.getClaimAsString("preferred_username");
        String name = jwt.getClaimAsString("name");
        String email = jwt.getClaimAsString("email");
        String cpf = jwt.getClaimAsString("cpf");
        
        if (username == null || name == null) {
            return new JwtAuthenticationToken(jwt, Collections.emptyList());
        }
        
        User user = userService.createOrUpdateUser(username, name, email, cpf);
        Collection<GrantedAuthority> authorities = Collections.singletonList(
            new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
        );
        
        return new JwtAuthenticationToken(jwt, authorities);
    }
}
