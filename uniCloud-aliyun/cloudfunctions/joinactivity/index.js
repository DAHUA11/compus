'use strict';
const db = uniCloud.database();
const activityCollection = db.collection('add-content');

exports.main = async (event, context) => {
  const uniIdCommon = require('uni-id-common');
  const uniID = uniIdCommon.createInstance({ context });
  console.log('云函数接收到的参数:', event)
  
  // 1. 验证用户身份
  const { activityId, token } = event;
  let userId;
  
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
    userId = auth.uid;
    console.log('checkToken 返回:', auth)
    console.log('用户ID:', userId)
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
      .where({ activity_id: activityId, user_id: userId })
      .get();
    if (userActivityRes.data.length > 0) {
      console.log('错误：用户已参与，userId:', userId, 'activityId:', activityId);
      return { success: false, message: '您已经参与过该活动' };
    }

    // 7. 获取用户详细信息
    const userDetailRes = await db.collection('uni-id-users').doc(userId).get();
    const userDetail = userDetailRes.data && userDetailRes.data[0] ? userDetailRes.data[0] : {};
    const nickname = userDetail.nickname || '';
    const avatar = (userDetail.avatar_file && userDetail.avatar_file.url) || '';

    // 8. 事务操作（更新参与人数 + 记录参与信息）
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
          user_id: userId,
          user_info: {
            nickname,
            avatar
          },
          join_time: now, 
          status: 'joined' 
        });

      await transaction.commit();
      console.log('成功：用户参与活动，userId:', userId, 'activityId:', activityId);
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
