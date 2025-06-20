'use strict';

exports.main = async (event, context) => {
  // 实际项目中应该从token解析用户信息
  // 这里为了演示，返回模拟的用户信息
  
  try {
    // 模拟用户信息
    const userInfo = {
      _id: 'user_123',
      nickname: '校园用户',
      avatar: '/static/images/avatar1.png',
      phone: '13800138000',
      email: 'user@example.com',
      createTime: new Date().toISOString(),
      lastLoginTime: new Date().toISOString(),
      status: 'active'
    };

    return {
      code: 200,
      msg: 'success',
      data: userInfo
    };
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return {
      code: 500,
      msg: '获取用户信息失败',
      data: null
    };
  }
}; 