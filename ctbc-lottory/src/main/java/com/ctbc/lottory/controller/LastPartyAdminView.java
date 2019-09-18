package com.ctbc.lottory.controller;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.ctbc.lottory.model.dao.LastPartyAdminDAOImpl;
import com.ctbc.lottory.service.LastPartyExportExcel;

@Controller
@RequestMapping("/admin")
public class LastPartyAdminView {

	@Autowired
	private LastPartyAdminDAOImpl srv;

	@Autowired
	private LastPartyExportExcel exls;

	@RequestMapping("people")
	public String peopleIndex(Model modal) {
		modal.addAttribute("system", "people");
		return "admin/people";
	}

	@RequestMapping({ "", "prize" })
	public String prizeIndex(Model modal) {
		modal.addAttribute("system", "prize");
		modal.addAttribute("list", srv.getPrize());
		return "admin/prize";
	}

	@RequestMapping("prizelog")
	public String prizeLogIndex(Model modal) {
		modal.addAttribute("system", "prizelog");
		modal.addAttribute("list", srv.getPrizelog());
		return "admin/prizelog";
	}

	@RequestMapping({ "prizetablelog" })
	public String prizeTableLogIndex(Model modal) {
		modal.addAttribute("system", "prizetablelog");
		modal.addAttribute("list", srv.getPrizeTablelog());
		return "admin/prizetablelog";
	}

	@RequestMapping("exportwin")
	public void exportExcel(@RequestParam(name = "prizeid", required = false) String prizeid,
			HttpServletRequest request, HttpServletResponse response) {
		try {
			response.setContentType("application/vnd.ms-excel");
			response.setHeader("Content-Disposition",
					"attachment; filename=winnerlog" + (prizeid != null ? "-" + prizeid : "") + ".xls");

			Workbook wb = exls.export(prizeid);
			wb.write(response.getOutputStream());
			wb.close();

		} catch (Exception e) {
			e.printStackTrace();
		}

	}

	@RequestMapping("system")
	public String systemSettingView(Model modal) {
		modal.addAttribute("system", "system");
		return "admin/system";
	}

}
