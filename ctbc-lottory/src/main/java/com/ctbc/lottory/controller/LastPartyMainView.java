package com.ctbc.lottory.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class LastPartyMainView {
	
	@RequestMapping({ "/", "index" })
	public String index() {
		return "index";
	}

	@RequestMapping("lottory")
	public String lottory(Model model) {
		return "lottory";
	}

	@RequestMapping("lottorySlot")
	public String lottorySlot() {
		return "lottorySlot";
	}
	
	@RequestMapping("lottoryTable")
	public String lottoryTable() {
		return "lottorySlotTable";
	}
	
	@RequestMapping("result")
	public String resultView() {
		return "result";
	}

	
}
