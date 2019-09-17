package com.ctbc.lottory.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class SpringContext {

	private static Environment env;
	private static ApplicationContext applicationContext;

	@Autowired
	public void setEnvironment(Environment env) {
		SpringContext.env = env;
	}
	
	@Autowired
	public void setApplicationContext(ApplicationContext applicationContext) {
		SpringContext.applicationContext = applicationContext;
	}

	public static Object getBean(String key) {
		return applicationContext.getBean(key);
	}
	
	public static String getProperty(String key) {
		return env.getProperty(key);
	}

}
