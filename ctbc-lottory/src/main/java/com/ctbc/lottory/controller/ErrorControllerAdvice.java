package com.ctbc.lottory.controller;

import javax.servlet.http.HttpServletRequest;

import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;


import lombok.extern.slf4j.Slf4j;

@ControllerAdvice
@Slf4j
public class ErrorControllerAdvice {

	@ExceptionHandler(value = Exception.class)
	@ResponseBody
	public String defaultErrorHandler(HttpServletRequest request, Exception e) {
		log.error(e.getMessage(),e);
		return e.getMessage();
	}

}
