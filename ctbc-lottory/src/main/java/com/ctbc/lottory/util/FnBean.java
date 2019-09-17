package com.ctbc.lottory.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

@Component
public class FnBean {
	static Logger log = LoggerFactory.getLogger(FnBean.class);

	public static String showObjectContent(Object object) {
		String result = null;
		try {
			ObjectMapper mapper = new ObjectMapper();
			mapper.setSerializationInclusion(Include.NON_NULL);
			mapper.configure(SerializationFeature.INDENT_OUTPUT, true);
			result =  mapper.writerWithDefaultPrettyPrinter().writeValueAsString(object);
		} catch (JsonProcessingException e) {
			log.error(e.getMessage());
		}
		
		return result;
	}
	
	
	public static int arrayToCnt(int[] intAry) {
		int rs = 0;
		if(intAry!=null && intAry.length>0) {
			for(int i: intAry) {
				rs += i;
			}
		}
		return rs;
	}
}
