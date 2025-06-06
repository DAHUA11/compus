'use strict';
exports.main = async (event, context) => {
	const db = uniCloud.database();
	const {
		content,
		author_id,
		author_name,
		author_avatar,
		target_id,
		parent_id = ''
	} = event;

	// 这里用 new Date()，保证类型正确
	const now = new Date();

	// 写入评论
	const res = await db.collection('user-comment').add({
		content,
		author_id,
		author_name,
		author_avatar,
		create_time: now,
		target_id,
		reply_count: 0,
		like_count: 0,
		parent_id
	});

	// 更新帖子评论数
	await db.collection('add-content').doc(target_id).update({
		comment_count: db.command.inc(1)
	});

	return {
		code: 0,
		msg: '评论成功',
		data: res
	};
};
