'use strict';
const db = uniCloud.database();
exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)
	
	if (!event._id) {
		return {
			code: 400,
			msg: '缺少活动ID',
			data: null
		}
	}

	const updateData = { ...event };
	delete updateData._id; // _id不能被更新

	try {
		const res = await db.collection('add-content').doc(event._id).update(updateData);
		if (res.updated === 1) {
			return {
				code: 200,
				msg: '更新成功',
				data: res
			}
		} else {
			return {
				code: 404,
				msg: '未找到对应活动',
				data: res
			}
		}
	} catch (err) {
		return {
			code: 500,
			msg: '更新失败',
			data: err
		}
	}
};
