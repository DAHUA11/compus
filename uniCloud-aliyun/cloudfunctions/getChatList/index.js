'use strict';
const db = uniCloud.database();
const $ = db.command.aggregate;

exports.main = async (event, context) => {
  const userId = event.userId;
  if (!userId) {
    return {
      code: 400,
      msg: '缺少userId'
    };
  }

  try {
    // 1. 查询所有和当前用户有关的消息
    const result = await db.collection('chatMessages')
      .aggregate()
      .match({
        $or: [
          { senderId: userId },
          { receiverId: userId }
        ]
      })
      // 2. 计算对方ID
      .addFields({
        partnerId: $.cond([
          $.eq(['$senderId', userId]), '$receiverId', '$senderId'
        ])
      })
      // 3. 按对方分组，取最新一条消息
      .sort({ createTime: -1 })
      .group({
        _id: '$partnerId',
        lastMessage: $.first('$content'),
        lastMessageTime: $.first('$createTime'),
        lastMessageType: $.first('$type'),
        lastMessageId: $.first('$_id'),
        lastTaskId: $.first('$taskId'),
        senderId: $.first('$senderId'),
        receiverId: $.first('$receiverId'),
        unread: $.sum($.cond([
          $.and([
            $.eq(['$receiverId', userId]),
            $.neq(['$status', 'read'])
          ]), 1, 0
        ]))
      })
      // 4. 查出对方昵称和头像
      .lookup({
        from: 'uni-id-users',
        localField: '_id',
        foreignField: '_id',
        as: 'partnerInfo'
      })
      .project({
        _id: 0,
        partnerId: '$_id',
        lastMessage: 1,
        lastMessageTime: 1,
        lastMessageType: 1,
        lastMessageId: 1,
        lastTaskId: 1,
        unread: 1,
        partnerNickname: { $arrayElemAt: ['$partnerInfo.nickname', 0] },
        partnerAvatar: {
          $cond: [
            { $gt: [ { $size: '$partnerInfo' }, 0 ] },
            { $arrayElemAt: ['$partnerInfo.avatar_file.url', 0] },
            '/static/images/default-avatar.png'
          ]
        }
      })
      .end();

    return {
      code: 200,
      data: result.data
    };
  } catch (error) {
    console.error('获取聊天列表失败:', error);
    return {
      code: 500,
      msg: '服务器内部错误',
      error: error.message
    };
  }
};