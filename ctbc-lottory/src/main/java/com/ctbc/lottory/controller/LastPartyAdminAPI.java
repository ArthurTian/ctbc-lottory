package com.ctbc.lottory.controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.multipart.MultipartFile;

import com.ctbc.lottory.controller.response.ApiResponse;
import com.ctbc.lottory.controller.response.ErrorCode;
import com.ctbc.lottory.model.dao.LastPartyAdminDAOImpl;
import com.ctbc.lottory.model.dao.SystemUtilDAOImpl;
import com.ctbc.lottory.model.dto.UsrPool;
import com.ctbc.lottory.service.LastPartyAdminService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import ch.qos.logback.classic.Logger;
import lombok.extern.log4j.Log4j2;

@RestController
@RequestMapping("/admin.api")
@Log4j2
public class LastPartyAdminAPI {

	@Autowired
	private LastPartyAdminDAOImpl adsDAO;

	@Autowired
	private SystemUtilDAOImpl sysdao;

	@Autowired
	private LastPartyAdminService ads;

	@RequestMapping("systemkey")
	public ApiResponse getSystemInfo(@RequestParam String keytype) {
		List list = sysdao.getSystemKeyInfo(keytype);
		if (list != null && list.size() > 0) {
			return ApiResponse.getBuilder().status(ErrorCode.SUCCESS).data(list).build();
		} else {
			return ApiResponse.getBuilder().status(ErrorCode.FAIL).build();
		}
	}

	@RequestMapping("upload")
	public ApiResponse uploadFile(@RequestParam("file") MultipartFile uploadfile) {
		log.info("Single file upload!");
		if (uploadfile.isEmpty()) {
			return ApiResponse.getBuilder().status(ErrorCode.FILE_EMPTY).build();
		}
		int seqno = ads.addPartyUser(uploadfile);
		ApiResponse result = ApiResponse.getBuilder().status(ErrorCode.SUCCESS).build();
		result.setSeqno(seqno);
		return result;
	}

	@RequestMapping("queryLastBatchStatus")
	public ApiResponse queryBatchStatus(@RequestParam("batchtype") String batchType) {
		Map map = adsDAO.queryLastBatchInfo(batchType);
		return ApiResponse.getBuilder().status(ErrorCode.SUCCESS).data(map).build();
	}

	@RequestMapping("queryBatchStatus")
	public ApiResponse queryBatchStatus(@RequestParam("seq") int seq, @RequestParam("batchtype") String batchType) {
		ApiResponse result = ApiResponse.getBuilder().status(ErrorCode.SUCCESS).build();
		String data = adsDAO.queryBatchInfo(batchType, seq);
		result.setSeqno(seq);
		result.setErrormsg(data);
		return result;
	}

	@RequestMapping("updWinnerStatus")
	public ApiResponse updateWinnerStatus(@RequestParam("userid") String userid) {
		if (adsDAO.updateWinnerStatus(userid) != 1) {
			return ApiResponse.getBuilder().status(ErrorCode.WINNER_UPDATE_FAIL).build();
		} else {
			return ApiResponse.getBuilder().status(ErrorCode.SUCCESS).build();
		}
	}

	@RequestMapping("updprize")
	public ApiResponse updatePrize(@RequestParam("status") int status, @RequestParam("prize_id") String prizeid,
			@RequestParam("prize_name") String prizeName, @RequestParam("level") String level,
			@RequestParam("total") int total, @RequestParam("memo") String memo) {

		int r = 0;
		switch (status) {
		case 0: // update
			r = adsDAO.updatePrize(prizeid, prizeName, level, total, memo);
			break;
		case 1:// add
			r = adsDAO.addPrize(prizeid, prizeName, level, total, memo);
			break;
		case 2: // delete
			r = adsDAO.deletePrize(prizeid);
			break;
		default:
			break;
		}
		if (r != 1) {
			return ApiResponse.getBuilder().status(ErrorCode.RECORD_UPDATE_FAIL).build();
		} else {
			return ApiResponse.getBuilder().status(ErrorCode.SUCCESS).build();
		}
	}

	@RequestMapping("getAllUsr")
	public List<UsrPool> getAllUsrForEndParty(@RequestBody(required = false) String body,
			@RequestParam(required = false) String aoData,
			@RequestParam(required = false, defaultValue = "0") int dStart,
			@RequestParam(required = false, defaultValue = "0") int dLength) {
		String sEcho = null;
		// int iDisplayStart = 0; // 起始索引
		// int iDisplayLength = 0; // 每頁顯示的行數
		ObjectMapper mapper = new ObjectMapper();
		JsonNode jsAry;
		try {
			if (aoData != null) {
				jsAry = mapper.readTree(aoData);
				for (int i = 0; i < jsAry.size(); i++) {
					JsonNode obj = jsAry.get(i);
					if (obj.get("name").asText().equals("sEcho"))
						sEcho = obj.get("value").toString();
					if (obj.get("name").asText().equals("iDisplayStart"))
						dStart = obj.get("value").asInt(1);
					if (obj.get("name").asText().equals("iDisplayLength"))
						dLength = obj.get("value").asInt(1);
				}
			}
		} catch (IOException e) {
			e.printStackTrace();
		}
//		log.info(dStart + ":" + dLength);
		// Map<String,List<UsrPool>> map = new HashMap<String,List<UsrPool>>();
		// map.put("data", ads.getUserList(dStart, dLength));
		return adsDAO.getUserList(dStart, dLength);
	}

	@PostMapping("updateUserType")
	public ApiResponse updateUserType(@RequestParam String type, @RequestParam String user) {
		int i = adsDAO.updateUserStatus(type, user);
		
		return ApiResponse.getBuilder().status(ErrorCode.SUCCESS).data(i).build();
		
	}

	@PostMapping("deleteWinnerLog")
	public ApiResponse deleteWinnerLog() {
		adsDAO.deleteWinnerLog();
		return ApiResponse.getBuilder().status(ErrorCode.SUCCESS).build();
	}

}