'use strict';

exports.main = async (event, context) => {
  const db = uniCloud.database();
  const { taskId } = event;

  if (!taskId) {
    return {
      code: 400,
      msg: '缺少任务ID',
      data: null
    };
  }

  try {
    // 查询任务详情
    const collection = db.collection('taskList');
    const result = await collection.doc(taskId).get();

    if (result.data && result.data.length > 0) {
      const task = result.data[0];
      
      // 映射字段为前端需要的格式
      const taskDetail = {
        _id: task._id,
        type: task.type,
        title: task.title,
        description: task.description,
        reward: task.reward,
        status: task.status,
        publisher_id: task.publisher_id,
        publisher_name: task.publisher_name,
        publisher_avatar: task.publisher_avatar,
        publish_time: task.publish_time,
        pickup_address: task.pickup_address,
        delivery_address: task.delivery_address,
        expected_time: task.expected_time,
        contact_name: task.contact_name,
        contact_phone: task.contact_phone,
        tags: task.tags || [],
        images: task.images || [],
        is_urgent: task.is_urgent || false,
        views: task.views || 0,
        duration: task.duration || 0,
        selected_category: task.selected_category,
        selected_condition: task.selected_condition,
        item_name: task.item_name,
        // 如果有领取者信息，也返回
        acceptor_id: task.acceptor_id,
        acceptor_name: task.acceptor_name,
        acceptor_avatar: task.acceptor_avatar
      };

      return {
        code: 200,
        msg: 'success',
        data: taskDetail
      };
    } else {
      return {
        code: 404,
        msg: '任务不存在',
        data: null
      };
    }
  } catch (error) {
    console.error('获取任务详情失败:', error);
    return {
      code: 500,
      msg: '获取任务详情失败',
      data: null
    };
  }
}; 