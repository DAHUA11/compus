'use strict';
const db = uniCloud.database()
const addContentCollection = db.collection('add-content')

exports.main = async (event, context) => {
	const { user_id, content_type, title, category, content, files, activity_time, location, max_attendees } = event
	
	if (!user_id) {
		return {
			code: 401,
			msg: '请先登录'
		}
	}
	
	// 参数校验
	if (!content_type || !['post', 'activity'].includes(content_type)) {
		return {
			code: 400,
			msg: '内容类型不正确'
		}
	}
	
	if (!category || !content) {
		return {
			code: 400,
			msg: '分类和内容不能为空'
		}
	}
	
	// 活动帖子特殊字段校验
	if (content_type === 'activity') {
		if (!title) {
			return {
				code: 400,
				msg: '活动标题不能为空'
			}
		}
		if (!activity_time) {
			return {
				code: 400,
				msg: '活动时间不能为空'
			}
		}
		if (!location) {
			return {
				code: 400,
				msg: '活动地点不能为空'
			}
		}
	}
	
	// 构建数据对象
	const data = {
		content_type,
		category,
		content,
		files: files || [],
		user_id,
		create_time: Date.now(),
		status: 'published',
		like_count: 0,
		comment_count: 0
	}
	
	// 根据内容类型添加特定字段
	if (content_type === 'activity') {
		Object.assign(data, {
			title,
			activity_time,
			location,
			max_attendees: max_attendees || 0
		})
	}
	
	try {
		const result = await addContentCollection.add(data)
		return {
			code: 200,
			msg: '发布成功',
			data: result
		}
	} catch (error) {
		return {
			code: 500,
			msg: '发布失败',
			error: error.message
		}
	}
} 