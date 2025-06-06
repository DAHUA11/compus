'use strict';
// 移除 uni-id-co 模块引入（因不再使用）

exports.main = async (event, context) => {
  const db = uniCloud.database();
  const { nickname, avatar_file, userId } = event; // 需前端主动传递 userId（风险点：需自行验证 userId 合法性）

  // 2. 校验参数（仅保留必要参数校验）
  if (!nickname && !avatar_file) {
    return { code: 400, msg: '昵称或头像参数缺失' };
  }
  if (!userId) {
    return { code: 400, msg: '用户 ID 缺失' };
  }

  try {
    // 3. 更新用户表（uni-id-users）
    const userRes = await db.collection('uni-id-users').doc(userId).update({
      nickname,
      avatar_file
    });
    console.log('用户信息更新成功：', userRes);

    // 4. 级联更新评论表（user-comment）中该用户的所有评论
    const commentRes = await db.collection('user-comment').where({
      author_id: userId
    }).update({
      author_name: nickname,
      author_avatar: avatar_file?.url || '/static/default-avatar.png'
    });

    return {
      code: 0,
      msg: '用户信息及评论级联更新成功',
      data: {
        userUpdate: userRes,
        commentUpdate: commentRes
      }
    };
  } catch (err) {
    console.error('更新失败：', err);
    return { code: 500, msg: '服务器内部错误', error: err };
  }
};
