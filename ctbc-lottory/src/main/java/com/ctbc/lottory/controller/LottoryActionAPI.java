package com.ctbc.lottory.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ctbc.lottory.model.dao.LastPartyDAOImpl;
import com.ctbc.lottory.model.dto.Winner;

import lombok.extern.log4j.Log4j2;

@RestController
@RequestMapping("/ap")
@Log4j2
public class LottoryActionAPI {
	
	@Autowired
	private JdbcTemplate jdbc;
	@Autowired
	private LastPartyDAOImpl pdDAO;

	/**
	 * 取得USER Department 清單
	 * 
	 * @return
	 */
	@RequestMapping("deplist")
	public List<String> getDepList() {
		return pdDAO.getDepartmentList();

	}

	/**
	 * lottory get winner pool
	 * 
	 * @param limitCnt
	 * @param prizeid
	 * @return
	 */
	@RequestMapping("winner")
	public List<Winner> getWinner(
			@RequestParam(name = "getcnt", defaultValue = "1", required = false) Integer limitCnt) {

		return pdDAO.getWinner(limitCnt);
	}

	/**
	 * get Prize list
	 * 
	 * @return
	 */
	@RequestMapping("prizelist")
	public List<Map<String, Object>> getPrizeList(@RequestParam(name = "level", required = false) String level,
			@RequestParam(name = "prizeid", required = false) String prizeid) {
		List list = pdDAO.getPrizeList(level, prizeid);
//		Map<String,Object> map = new HashMap<>();
//		map.put("data", list);
		return list;
	}

	/**
	 * 取得中獎清單
	 * 
	 * @param prizeid 禮品編號
	 * @return
	 */
	@RequestMapping("prizelog")
	public List<Winner> getWinnerlog(@RequestParam(name = "prizeid") String prizeid,
			@RequestParam(name = "status", required = false) String status) {

		return pdDAO.getWinnerLog(prizeid, status);
	}

	/**
	 * insert winner log
	 * 
	 * @param userid
	 * @param prizeid
	 * @param runcnt
	 * @return
	 */
	@RequestMapping("updateWinner")
	public int logWinner(@RequestParam(name = "userid") String userid, @RequestParam(name = "prizeid") String prizeid,
			@RequestParam(name = "runcnt") String runcnt) {
		log.info("logWinner:{},{}", new Object[] { userid, prizeid });
		String sql = "insert into PRIZE_LOG (userid,prizeid,timest,runcnt) values (?,?,datetime('now', 'localtime'),?)";
		int result = -1;
		try {
			result = jdbc.update(sql, new Object[] { userid, prizeid, runcnt });
		} catch (Exception e) {
			// e.printStackTrace();
			log.error(e.getMessage());

		}
		return result;
	}

	/**
	 * get Prize list
	 * 
	 * @return
	 */
	@RequestMapping("table.prizelist")
	public List<Map<String, Object>> getTablePrizeList(@RequestParam(name = "level", required = false) String level,
			@RequestParam(name = "prizeid", required = false) String prizeid) {
		log.info("prizelist:{},{}", new Object[] { level, prizeid });
		String sql = "select a.* , ifnull(b.cnt,0) as cnt , (a.total - ifnull(b.cnt,0)) as lastcnt  FROM prize a "
				+ " left join (SELECT prizeid,ifnull(count(1),0) AS cnt FROM ptable_log GROUP BY prizeid ) as b"
				+ " on a.prizeid = b.prizeid where 1=1 ";

		if (level != null && !"".equals(level)) {
			level = level.replaceAll("=", "").replaceAll("\\\\", "");
			sql += " and  a.PRIZE_LEVEL = " + level;

		}
		if (prizeid != null && !"".equals(prizeid)) {
			prizeid = prizeid.replaceAll("=", "").replaceAll("\\\\", "");
			sql += " and a.PRIZEID = '" + prizeid + "'";
		}

		sql += " order by a.PRIZEID ";
		log.info(sql);
		List<Map<String, Object>> list = jdbc.queryForList(sql);
		return list;
	}

}
