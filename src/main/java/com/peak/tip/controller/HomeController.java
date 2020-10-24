package com.peak.tip.controller;

import org.springframework.web.bind.annotation.RequestMapping;
public class HomeController {

	@RequestMapping(value = "/")
	public String index() {
		return "index";
	}
	

}
