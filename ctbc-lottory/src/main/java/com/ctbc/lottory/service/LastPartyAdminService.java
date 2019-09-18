package com.ctbc.lottory.service;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.apache.poi.EncryptedDocumentException;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.ctbc.lottory.model.dao.LastPartyAdminDAOImpl;
import com.ctbc.lottory.model.dao.SystemUtilDAOImpl;
import com.ctbc.lottory.model.dto.UsrPool;
import com.ctbc.lottory.util.FnBean;

import lombok.extern.slf4j.Slf4j;


@Service
@Slf4j
public class LastPartyAdminService {

	@Autowired
	private LastPartyAdminDAOImpl adsDAO;
	
	@Autowired
	private SystemUtilDAOImpl sysDAO;
	

	public int addPartyUser(MultipartFile file) {
		int seqno = 0;
		if (file != null) {
			log.info(file.getOriginalFilename());
			String perfix = file.getOriginalFilename().substring(file.getOriginalFilename().indexOf(".") + 1);
			log.info(perfix);
			seqno = sysDAO.insertBatchInfo(file.getOriginalFilename(),"LS");
			loadFileAction(file,seqno);
		}
		return seqno;
	}

	private void loadFileAction(MultipartFile f ,int seqno) {
		try {
			List<UsrPool> list = loadExcel(f.getInputStream());
			log.info("檔案共:{}筆", list.size());
			int deleteCnt = adsDAO.deleteUserList();
			log.info("刪除USER資料共：{} 筆", deleteCnt);

			int addCnt = adsDAO.insertUserList(list);
			log.info("新增資料共:{} 筆", addCnt);
			int batUpd = sysDAO.updateBatchInfo(seqno,"OK","LS",addCnt);
			log.info("BATCHINFO 更新狀態:{}",(batUpd==1?true:false));
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	private List<UsrPool> loadExcel(InputStream in) {
		Workbook wb = null;
		List<UsrPool> list = new ArrayList<UsrPool>();
		try {
			wb = WorkbookFactory.create(in);
			Sheet sheet = wb.getSheetAt(0);

			Iterator<Row> rowIter = sheet.rowIterator();

			int rowCnt = 0;
			int employee = 1; //1-一般職員 //2-老闆 //3-人派
			
			while (rowIter.hasNext()) {
				Row row = rowIter.next();
				if (rowCnt > 0 && row.getCell(0) != null) {

					UsrPool usr = new UsrPool();
					row.getCell(0).setCellType(CellType.STRING);
					usr.setUserId(row.getCell(0).getStringCellValue());
					usr.setUserName(row.getCell(1, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK).getStringCellValue());
					usr.setDepartment(row.getCell(2, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK).getStringCellValue());
					usr.setDepGroup(row.getCell(3, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK).getStringCellValue());

					String isOff = row.getCell(4, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK).getStringCellValue();
					usr.setIsOff(isOff == null || isOff.equals("") ? "N" : isOff);
					
					String isBoss = row.getCell(5, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK).getStringCellValue();
					String emType = row.getCell(6, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK).getStringCellValue();
					//1-一般職員 //2-老闆 //3-人派
					if("Y".equals(isBoss)) {
						employee = 2;
					}else if("Y".equals(emType)) {
						employee = 3;
					}else {
						employee = 1;
					}
					usr.setEmployee(employee);
					FnBean.showObjectContent(usr);
					if(usr.getUserId()!=null && !"".equals(usr.getUserId())) {
						list.add(usr);
					}
				}
				rowCnt++;

			}
		} catch (EncryptedDocumentException e) {
			e.printStackTrace();
		} catch (InvalidFormatException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return list;
	}
}
