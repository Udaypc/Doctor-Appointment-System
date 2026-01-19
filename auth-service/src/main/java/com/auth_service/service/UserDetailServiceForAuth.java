package com.auth_service.service;

import com.auth_service.entity.User;
import com.auth_service.repository.AuthRepository;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;


import java.util.Collections;

@Service
public class UserDetailServiceForAuth implements UserDetailsService {

    private AuthRepository authRepository;

    public UserDetailServiceForAuth(AuthRepository authRepository) {
        this.authRepository = authRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = authRepository.findByEmail(email);
        if(user==null){
            throw new UsernameNotFoundException("User Not Found");
        }
        return new org.springframework.security.core.userdetails.User(user.getEmail(), user.getPassword(), Collections.singleton(new SimpleGrantedAuthority(user.getRole())));
    }
}
