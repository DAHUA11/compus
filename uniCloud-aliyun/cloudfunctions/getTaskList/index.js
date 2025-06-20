'use strict';

exports.main = async (event, context) => {
  const db = uniCloud.database();
  const {
    page = 1,
    pageSize = 10,
    type = '',      // 任务类型筛选
    status = '',    // 任务状态筛选
    keyword = ''    // 关键词搜索
  } = event;

  let where = {};
  if (type && type !== 'all') where.type = type;
  if (status) where.status = status;
  if (keyword) {
    // 支持标题/描述模糊搜索
    where = {
      ...where,
      $or: [
        { title: new RegExp(keyword, 'i') },
        { description: new RegExp(keyword, 'i') }
      ]
    };
  }

  // 分页查询
  const collection = db.collection('taskList');
  const totalRes = await collection.where(where).count();
  const total = totalRes.total;

  const res = await collection
    .where(where)
    .orderBy('publish_time', 'desc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get();

  // 字段映射：将数据库字段映射为前端需要的字段名
  const mappedData = res.data.map(item => ({
    id: item._id, // _id 映射为前端的 id
    type: item.type,
    title: item.title,
    description: item.description,
    reward: item.reward,
    status: item.status,
    publisher: { // 嵌套对象，对应前端 task.publisher.nickname/avatar
      nickname: item.publisher_name,
      avatar: item.publisher_avatar
    },
    publishTime: item.publish_time, // publish_time 映射为 publishTime
    isUrgent: item.is_urgent || false, // is_urgent 映射为 isUrgent
    tags: item.tags || [],
    pickupAddress: item.pickup_address || '', // 快递/外卖取件地址
    deliveryAddress: item.delivery_address || '', // 快递/外卖送达地址
    expectedDeliveryTime: item.expected_time || '', // 期望送达时间
    itemName: item.item_name || '', // 出物/求购物品名称
    selectedCategory: item.selected_category || '', // 出物/求购物品类别
    selectedCondition: item.selected_condition || '', // 出物/求购物品成色
    contactName: item.contact_name || '',
    contactPhone: item.contact_phone || '',
    images: item.images || [], // 商品图片
    duration: item.duration || 0, // 有效期
    views: item.views || 0, // 浏览量
    // 其他可能需要的字段可以继续添加
  }));

  // 日志输出，便于调试
  console.log('[getTaskList] where:', where, 'total:', total, 'data.length (mapped):', mappedData.length);

  return {
    code: 200,
    msg: 'success',
    data: mappedData, // 返回映射后的数据
    total: total || 0
  };
};
