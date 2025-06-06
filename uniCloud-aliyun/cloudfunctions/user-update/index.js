'use strict';
const db = uniCloud.database();

exports.main = async (event, context) => {
	const { userId, nickname, avatarUrl } = event;

	if (!userId) {
		return { code: 1, msg: '缺少用户ID' };
	}

	// 1. 更新用户表
	await db.collection('uni-id-users').doc(userId).update({
		nickname,
		'avatar_file.url': avatarUrl
	});

	// 2. 级联更新评论表
	await db.collection('user-comment').where({
		author_id: userId
	}).update({
		author_name: nickname,
		author_avatar: avatarUrl
	});
	console.log("评论表实现了级联更新")
	return { code: 0, msg: '用户资料和评论已更新' };
};
