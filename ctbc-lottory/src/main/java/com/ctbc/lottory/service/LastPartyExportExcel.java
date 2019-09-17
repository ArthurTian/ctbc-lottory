package com.ctbc.lottory.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.poi.EncryptedDocumentException;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ctbc.lottory.model.dao.LastPartyAdminDAOImpl;

import lombok.extern.log4j.Log4j2;

@Service
@Log4j2
public class LastPartyExportExcel {

	@Autowired
	private LastPartyAdminDAOImpl ads;

	List<Map<String, Object>> list = null;

	public Workbook export(String prizeid) {
//		log.info("{}", ads);
		list = ads.getPrizelog(prizeid);
		Workbook wb = null;
		try {
			wb = new HSSFWorkbook();
			Sheet sheet = wb.createSheet();
			Row row;
			Cell cell;

			CellStyle cs = wb.createCellStyle();
			sheet.setDefaultColumnWidth(15);
			sheet.setDefaultRowHeight((short) (15 * 23));
			
			//title
			List<String> title = genTitle();
			row = sheet.createRow(0);
			for (int i = 0; i < title.size(); i++) {
				row.createCell(i).setCellValue(title.get(i));
			}
			// content
			Map map;
			if (list != null && list.size() > 0) {
				for (int i = 0; i < list.size(); i++) {
					map = list.get(i);
					row = sheet.createRow(i + 1);
					row.createCell(0).setCellValue((Integer) map.get("RUNCNT"));
					row.createCell(1).setCellValue((String) map.get("PRIZEID"));
					row.createCell(2).setCellValue((String) map.get("PRIZE_NAME"));
					row.createCell(3).setCellValue((String) map.get("USERID"));
					row.createCell(4).setCellValue((String) map.get("USERNAME"));
					row.createCell(5).setCellValue((String) map.get("DEPARTMENT") );
					row.createCell(6).setCellValue((String) map.get("DEPGROUP"));
					row.createCell(7).setCellValue((String) map.get("ISOFF"));
				}

			}

		} catch (EncryptedDocumentException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();

		}
		return wb;
	}

	private List<String> genTitle() {
		List<String> list = new ArrayList<>();
		list.add("中獎順序");
		list.add("獎項編號");
		list.add("獎項名稱");
		list.add("員工編號");
		list.add("員工姓名");
		list.add("單位");
		list.add("部門");
		list.add("公假");
		list.add("簽收欄");

		return list;
	}
}