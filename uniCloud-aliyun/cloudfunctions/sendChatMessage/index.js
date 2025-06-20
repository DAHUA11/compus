'use strict';
const db = uniCloud.database();
const uniID = require('uni-id-common');

exports.main = async (event, context) => {
  const {
    taskId,
    content,
    type = 'text',
    receiverId: clientReceiverId, 
    title = '',
    status = 'pending' 
  } = event;

  if (!event.uniIdToken) {
    console.error('[sendChatMessage] Invocation failed, uniIdToken is missing.');
    return {
      code: 401,
      errCode: 'uni-id-token-required',
      msg: 'User not logged in or token is invalid'
    };
  }

  const uniIDIns = uniID.createInstance({ context });

  if (!taskId || !content) {
    return { code: 400, msg: 'Missing taskId or content' };
  }

  try {
    const { uid: senderId } = await uniIDIns.checkToken(event.uniIdToken);
    if (!senderId) {
      return { code: 401, msg: 'User not logged in' };
    }

    const user = await db.collection('uni-id-users').doc(senderId).field({
      _id: 1,
      nickname: 1,
      'avatar_file.url': 1
    }).get();
    
    if (!user.data || user.data.length === 0) {
        return { code: 404, msg: 'Sender user does not exist' };
    }
    const senderInfo = user.data[0];
    const senderAvatar = (senderInfo.avatar_file && senderInfo.avatar_file.url) ? senderInfo.avatar_file.url : '/static/images/default-avatar.png';


    let receiverId;
    if (clientReceiverId) {
        receiverId = clientReceiverId;
    } else {
        const task = await db.collection('tasks').doc(taskId).field({ userId: 1 }).get();
        if (!task.data || task.data.length === 0) {
            return { code: 404, msg: 'Associated task does not exist' };
        }
        receiverId = task.data[0].userId;
    }

    if (senderId === receiverId) {
        return { code: 200, msg: 'Message sent (no actual operation)' }; 
    }

    const messageData = {
      taskId,
      type,
      senderId,
      senderAvatar: senderAvatar,
      content,
      createTime: new Date().toISOString(),
      status: 'unread',
      receiverId
    };

    if (type === 'card') {
      messageData.title = title;
      messageData.status = status;
    }

    const result = await db.collection('chatMessages').add(messageData);

    return {
      code: 200,
      msg: 'Message sent successfully',
      data: {
        _id: result.id,
        ...messageData
      }
    };

  } catch (error) {
    console.error('Failed to send message:', error);
    if (error.code && error.code.startsWith('uni-id-')) {
        return { errCode: error.code, msg: error.message };
    }
    return {
      code: 500,
      msg: 'Server internal error',
      error: error.message
    };
  }
}; 