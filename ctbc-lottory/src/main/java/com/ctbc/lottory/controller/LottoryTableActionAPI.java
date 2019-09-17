package com.ctbc.lottory.controller;

import java.util.List;
import java.util.Map;

import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ch.qos.logback.classic.Logger;

@RestController
public class LottoryTableActionAPI {
	Logger log = (Logger) LoggerFactory.getLogger(getClass());

	@Autowired
	JdbcTemplate jdbc;
	

	@RequestMapping("/ap/table.list")
	public List<Map<String, Object>> getTableList() {
		String sql = "select distinct tbgroup from ptable";
		List<Map<String, Object>> list = jdbc.queryForList(sql);
		return list;
	}

	
	
	@RequestMapping("/ap/table.win")
	public List<Map<String, Object>> getTableWinner(@RequestParam(name = "gp", required = false) String gp) {
		String sqlstr = "";
		String sql = "select tbgroup,tbid,RANDOM() as prow from ptable "
				+ "where tbid not in (select tbid from ptable_log) ";

		if (gp != null && !"".equals(gp)) {
			sql += " and tbgroup in ('" + gp.replaceAll(",", "','") + "')";
		}
		sql += " order by prow limit 20";
		log.info(sql);
		List<Map<String, Object>> list = jdbc.queryForList(sql);
		return list;
	}

	@RequestMapping("/ap/table.win.update")
	public int logWinnerTable(@RequestParam(name = "tbgroup") String tbgroup, @RequestParam(name = "tbid") String tbid,
			@RequestParam(name = "runcnt") String runcnt,@RequestParam(name = "prizeid") String prizeid) {
		log.info("logWinner:{},{}", new Object[] { tbgroup, tbid });
		String sql = "insert into PTABLE_LOG (tbgroup,tbid,runcnt,timestmp,prizeid) values (?,?,?,datetime('now', 'localtime'),?)";
		int result = -1;
		try {
			result = jdbc.update(sql, new Object[] { tbgroup, tbid, runcnt,prizeid });
		} catch (Exception e) {
			log.error(e.getMessage());

		}
		return result;
	}

	/**
	 * 取得中獎清單
	 * 
	 * @param prizeid
	 *            禮品編號
	 * @return
	 */
	@RequestMapping("/ap/table.win.log")
	public List<Map<String, Object>> getWinnerTablelog(@RequestParam(name = "prizeid") String runcnt) {
		String sql = "select * from ptable_log ";
				if(runcnt != null && !"".equals(runcnt)) {
					sql+= "where prizeid in ('"+runcnt.replaceAll(",","','")+"')";
				}
				sql += " order by substr(TBID,1,1),cast(substr(TBID,2,2) as int)";
		log.info(runcnt+":"+sql);
		List<Map<String, Object>> list = jdbc.queryForList(sql);
		return list;
	}

}
