'use strict';
const db = uniCloud.database();
let uniID;
let _uniIdCommon;
try {
  _uniIdCommon = require('uni-id-common');
} catch (e) {
  _uniIdCommon = null;
}
if (_uniIdCommon && _uniIdCommon.uniID) {
  uniID = _uniIdCommon.uniID;
} else {
  // 本地调试环境 mock
  uniID = {
    async checkToken(token) {
      // 你可以根据需要自定义返回内容
      if (!token || token === 'mock_invalid') {
        return { code: 1, message: 'token无效' };
      }
      // 模拟一个用户
      return {
        code: 0,
        userInfo: {
          _id: '684639929755e3437a29d1e8',
          nickname: 'mock_user',
          avatar: ''
        }
      };
    }
  }
}
const activityCollection = db.collection('add-content');

exports.main = async (event, context) => {
  console.log('云函数接收到的参数:', event)
  
  // 1. 验证用户身份
  const { activityId, token } = event;
  let userInfo;
  
  try {
    // 从 event 中获取 token（阿里云环境）
    if (!token) {
      return { 
        success: false, 
        message: '请先登录',
        code: 'NEED_LOGIN'
      }
    }
    
    // 验证 token
    const auth = await uniID.checkToken(token);
    if (auth.code !== 0) {
      return {
        success: false,
        message: '登录状态已失效，请重新登录',
        code: 'TOKEN_INVALID'
      }
    }
    userInfo = auth.userInfo;
    
  } catch (err) {
    console.error('验证用户身份失败:', err);
    return {
      success: false,
      message: '验证用户身份失败',
      code: 'AUTH_FAILED'
    }
  }

  // 2. 检查活动 ID 是否存在
  if (!activityId) {
    console.log('错误：activityId 为空');
    return { success: false, message: '活动ID不能为空' };
  }

  try {
    // 3. 获取活动详情
    const activityRes = await activityCollection.doc(activityId).get();
    if (!activityRes.data || activityRes.data.length === 0) {
      console.log('错误：活动不存在，activityId:', activityId);
      return { success: false, message: '活动不存在' };
    }
    const activityData = activityRes.data[0];

    // 4. 检查活动是否已结束
    const now = Date.now();
    if (activityData.activity_time < now) {
      console.log('错误：活动已结束，activityId:', activityId);
      return { success: false, message: '活动已结束' };
    }

    // 5. 检查是否满员
    const currentParticipants = activityData.attendee_count || 0;
    if (activityData.max_attendees && currentParticipants >= activityData.max_attendees) {
      console.log('错误：活动已满员，activityId:', activityId);
      return { success: false, message: '活动参与人数已满' };
    }

    // 6. 检查用户是否已参与
    const userActivityRes = await db.collection('activity_participants')
      .where({ activity_id: activityId, user_id: userInfo._id })
      .get();
    if (userActivityRes.data.length > 0) {
      console.log('错误：用户已参与，userId:', userInfo._id, 'activityId:', activityId);
      return { success: false, message: '您已经参与过该活动' };
    }

    // 7. 事务操作（更新参与人数 + 记录参与信息）
    const transaction = await db.startTransaction();
    try {
      // 更新活动参与人数
      await transaction.collection('add-content')
        .doc(activityId)
        .update({ attendee_count: db.command.inc(1) });

      // 记录用户参与信息
      await transaction.collection('activity_participants')
        .add({ 
          activity_id: activityId, 
          user_id: userInfo._id,
          user_info: {
            nickname: userInfo.nickname,
            avatar: userInfo.avatar
          },
          join_time: now, 
          status: 'joined' 
        });

      await transaction.commit();
      console.log('成功：用户参与活动，userId:', userInfo._id, 'activityId:', activityId);
      return { success: true, message: '参与成功' };
    } catch (transactionErr) {
      await transaction.rollback();
      console.error('错误：事务执行失败', transactionErr);
      return { success: false, message: '系统繁忙，请稍后重试' };
    }
  } catch (err) {
    console.error('错误：云函数执行异常', err);
    return { success: false, message: '参与失败，请稍后重试' };
  }
};
