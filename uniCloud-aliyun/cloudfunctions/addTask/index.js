'use strict';

exports.main = async (event, context) => {
	const db = uniCloud.database();
	const _ = db.command;
	const { taskData } = event; // 前端传入的任务数据
	try {
		// 写入 taskList 集合
		const res = await db.collection('taskList').add(taskData);
		return { code: 200, msg: '任务发布成功', data: res };
	} catch (e) {
		return { code: 500, msg: '任务发布失败', error: e };
	}
};
