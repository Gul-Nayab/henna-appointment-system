package edu.sjsu.cmpe.henna.repository;

import edu.sjsu.cmpe.henna.model.HennaService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HennaServiceRepository extends JpaRepository<HennaService, Integer> {
}