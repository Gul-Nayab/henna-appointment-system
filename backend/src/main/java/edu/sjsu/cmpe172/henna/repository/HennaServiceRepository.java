package edu.sjsu.cmpe172.henna.repository;

import edu.sjsu.cmpe172.henna.model.HennaService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HennaServiceRepository extends JpaRepository<HennaService, Integer> {
}