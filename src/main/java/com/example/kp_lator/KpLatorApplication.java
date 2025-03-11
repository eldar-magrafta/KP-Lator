package com.example.kp_lator;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@SpringBootApplication
public class KpLatorApplication {

	public static void main(String[] args) {
		SpringApplication.run(KpLatorApplication.class, args);
	}

}
