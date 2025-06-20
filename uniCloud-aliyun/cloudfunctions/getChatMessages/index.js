'use strict';

exports.main = async (event, context) => {
  const db = uniCloud.database();
  const {
    taskId,
    page = 1,
    pageSize = 20
  } = event;

  if (!taskId) {
    return {
      code: 400,
      msg: '缺少任务ID',
      data: []
    };
  }

  try {
    // 查询聊天消息
    const collection = db.collection('chatMessages');
    const totalRes = await collection.where({
      taskId: taskId
    }).count();
    
    const total = totalRes.total;

    const res = await collection
      .where({
        taskId: taskId
      })
      .orderBy('createTime', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get();

    // 返回消息列表（按时间正序）
    const messages = res.data.reverse().map(item => ({
      _id: item._id,
      type: item.type,
      senderId: item.senderId,
      senderAvatar: item.senderAvatar,
      content: item.content,
      createTime: item.createTime,
      status: item.status || 'sent',
      title: item.title, // 交易卡片的标题
      taskId: item.taskId
    }));

    return {
      code: 200,
      msg: 'success',
      data: messages,
      total: total
    };
  } catch (error) {
    console.error('获取聊天消息失败:', error);
    return {
      code: 500,
      msg: '获取聊天消息失败',
      data: []
    };
  }
}; 