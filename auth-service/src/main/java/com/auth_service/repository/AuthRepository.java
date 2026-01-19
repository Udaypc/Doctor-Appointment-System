package com.auth_service.repository;


import com.auth_service.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);

}
