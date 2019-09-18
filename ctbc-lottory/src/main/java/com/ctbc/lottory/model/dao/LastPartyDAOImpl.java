package com.ctbc.lottory.model.dao;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import com.ctbc.lottory.model.dto.Winner;

import lombok.extern.slf4j.Slf4j;

@Repository
@Slf4j
public class LastPartyDAOImpl  {

	@Autowired
	JdbcTemplate jdbc;
	
	@Value("${lottory.boss-on}")
	boolean bossOn;
	
	@Value("${lottory.temp-work-on}")
	boolean tempWorkOn;

	public List<Winner> getWinner(int getCnt) {
		if (getCnt <= 0) {
			getCnt = 1;
		}
		String sql = "SELECT a.userid, a.username, a.department, a.isoff, a.DEPGROUP, ABS(RANDOM()) as rower"
				+ " FROM USER a where a.userid "
				+ " not in (select c.userid from prize_log c) and employee <> 0 ";
				if(!bossOn) {
					sql += " and employee <> 2";
				}
				if(!tempWorkOn) {
					sql += " and a.employee <> 3";
				}
				
				sql += " order by a.employee DESC, rower DESC limit ?";
		
		log.info("getWinner(cnt:{})={}",getCnt,  sql);
		List<Winner> result =  jdbc.query(sql, new Object[] { getCnt }, new GetWinnerRowMapper());
		Collections.shuffle(result);
		return result;
	}
	
	
	public List<String> getDepartmentList(){
		String sql = "select distinct department from USER";

		List<String> data = jdbc.query(sql,new RowMapper<String>() {
			@Override
			public String mapRow(ResultSet rs, int arg1) throws SQLException {
				return rs.getString(1);
			}
		});
		
		return data;
	}
	
	/**
	 * 取得該獎
	 * @param prizeid
	 * @param status
	 * @return
	 */
	public List<Winner> getWinnerLog(String prizeid,String status){
		String sql = "select a.*, (select PRIZE_NAME from prize where prizeid = a.prizeid ) as PRIZE_NAME"
				+ ", b.* from prize_log a left join user b on a.USERID = b.USERID where a.prizeid = ? order by runcnt";
		if (status != null) {
			sql += " and a.status = '" + status + "'";
		}
		log.info("getWinnerLog({}),SQL={}" ,prizeid, sql);
		return  jdbc.query (sql, new Object[] { prizeid }, new GetWinnerLogRowMapper());
	}
	
	
	public List<Map<String, Object>> getPrizeList(String level,String prizeid) {
		log.info("prizelist:{},{}", new Object[] { level, prizeid });
		String sql = "select a.* ,(select keyval from systeminfo where keytype='LEVEL' and keyid = a.prize_level) as LEVEL_DESC"
				+ ", ifnull(b.cnt,0) as cnt , (a.total - ifnull(b.cnt,0)) as lastcnt  FROM prize a "
				+ " left join (SELECT prizeid,ifnull(count(1),0) AS cnt FROM prize_log  where status = '0' GROUP BY prizeid ) as b"
				+ " on a.prizeid = b.prizeid where 1=1 ";

		if (level != null && !"".equals(level)) {
			level = level.replaceAll("=", "").replaceAll("\\\\", "");
			sql += " and  a.PRIZE_LEVEL = " + level;

		}
		if (prizeid != null && !"".equals(prizeid)) {
			prizeid = prizeid.replaceAll("=", "").replaceAll("\\\\", "");
			sql += " and a.PRIZEID = '" + prizeid + "'";
		}
		log.info(sql);
		List<Map<String, Object>> list = jdbc.queryForList(sql);
		return list;
	}
	
	

}

class GetWinnerRowMapper implements RowMapper<Winner> {

	@Override
	public Winner mapRow(ResultSet rs, int rowNum) throws SQLException {
		Winner winner = new Winner();
		winner.setUserId(rs.getString("USERID"));
		winner.setUserName(rs.getString("USERNAME"));
		winner.setIsOff(rs.getString("ISOFF"));
		winner.setDepartment(rs.getString("DEPARTMENT"));
		winner.setDepGroup(rs.getString("DEPGROUP"));

		return winner;
	}
}

class GetWinnerLogRowMapper implements RowMapper<Winner>{

	@Override
	public Winner mapRow(ResultSet rs, int rowNum) throws SQLException {
		Winner winner = new Winner();
		winner.setUserId(rs.getString("USERID"));
		winner.setUserName(rs.getString("USERNAME"));
		winner.setIsOff(rs.getString("ISOFF"));
		winner.setDepartment(rs.getString("DEPARTMENT"));
		winner.setDepGroup(rs.getString("DEPGROUP"));
		winner.setStatus(rs.getString("STATUS"));
		winner.setRuncnt(rs.getInt("RUNCNT"));
		return winner;
	}
	
}