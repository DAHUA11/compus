'use strict';

exports.main = async (event, context) => {
  const db = uniCloud.database();
  const {
    taskId,
    status,
    messageId = null // 如果是更新交易卡片状态
  } = event;

  if (!taskId || !status) {
    return {
      code: 400,
      msg: '缺少必要参数',
      data: null
    };
  }

  try {
    const collection = db.collection('taskList');
    
    // 更新任务状态
    const updateData = {
      status: status,
      latest_update: new Date().toISOString()
    };

    // 如果状态变为processing，记录开始时间
    if (status === 'processing') {
      updateData.start_time = new Date().toISOString();
    }

    // 如果状态变为completed，记录完成时间
    if (status === 'completed') {
      updateData.complete_time = new Date().toISOString();
    }

    const result = await collection.doc(taskId).update(updateData);

    // 如果同时需要更新消息状态
    if (messageId) {
      const messageCollection = db.collection('chatMessages');
      await messageCollection.doc(messageId).update({
        status: 'confirmed'
      });
    }

    return {
      code: 200,
      msg: '任务状态更新成功',
      data: {
        taskId: taskId,
        status: status
      }
    };
  } catch (error) {
    console.error('更新任务状态失败:', error);
    return {
      code: 500,
      msg: '更新任务状态失败',
      data: null
    };
  }
}; 