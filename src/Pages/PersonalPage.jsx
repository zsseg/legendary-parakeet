import React, { useState, useEffect } from 'react';
import './PersonalPage.css';

// 模拟用户数据库API
const userAPI = {
  // 初始化示例数据
  initializeSampleData() {
    const sampleUsers = {
      '12345': {
        id: '12345',
        userId: '12345',
        userName: '张三',
        avatar: null,
        password: '123456',
        messages: [
          {
            id: 1,
            text: '这是我的第一条留言！',
            time: new Date(Date.now() - 86400000).toISOString(),
            likes: 2,
            dislikes: 0,
            liked: false,
            disliked: false,
            fromUserId: '12345',
            toUserId: '12345',
            fromUserName: '张三'
          }
        ],
        books: [
          { id: 1, name: 'React实战指南', daysLeft: 7 },
          { id: 2, name: 'JavaScript高级程序设计', daysLeft: 14 }
        ]
      },
      '54321': {
        id: '54321',
        userId: '54321',
        userName: '李四',
        avatar: null,
        password: '123456',
        messages: [
          {
            id: 2,
            text: '大家好，我是新用户！',
            time: new Date(Date.now() - 172800000).toISOString(),
            likes: 3,
            dislikes: 0,
            liked: false,
            disliked: false,
            fromUserId: '54321',
            toUserId: '54321',
            fromUserName: '李四'
          }
        ],
        books: [
          { id: 1, name: 'CSS权威指南', daysLeft: 3 },
          { id: 2, name: 'Node.js实战', daysLeft: 21 }
        ]
      },
      '67890': {
        id: '67890',
        userId: '67890',
        userName: '王五',
        avatar: null,
        password: '123456',
        messages: [
          {
            id: 3,
            text: '欢迎来到留言板！',
            time: new Date(Date.now() - 432000000).toISOString(),
            likes: 5,
            dislikes: 1,
            liked: false,
            disliked: false,
            fromUserId: '67890',
            toUserId: '67890',
            fromUserName: '王五'
          }
        ],
        books: []
      }
    };

    if (!localStorage.getItem('userDatabase')) {
      localStorage.setItem('userDatabase', JSON.stringify(sampleUsers));
    }
  },

  // 生成不重复的随机用户ID (1-65536)
  generateUserId() {
    const users = JSON.parse(localStorage.getItem('userDatabase') || '{}');
    const existingIds = Object.keys(users).map(id => parseInt(id));

    if (existingIds.length >= 65536) {
      throw new Error('用户ID已用完');
    }

    let newId;
    let attempts = 0;
    const maxAttempts = 1000;

    do {
      newId = Math.floor(Math.random() * 65536) + 1;
      attempts++;
    } while (existingIds.includes(newId) && attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      for (let i = 1; i <= 65536; i++) {
        if (!existingIds.includes(i)) {
          newId = i;
          break;
        }
      }
    }

    return newId.toString();
  },

  // 检查用户名是否全数字
  isNumericString(str) {
    return /^\d+$/.test(str);
  },

  // 根据登录名获取用户信息（支持userId和userName）
  async getUserByLoginName(loginName) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const users = JSON.parse(localStorage.getItem('userDatabase') || '{}');

    // 首先尝试作为userId查找
    if (users[loginName]) {
      return users[loginName];
    }

    // 然后尝试作为userName查找
    const userByName = Object.values(users).find(user => user.userName === loginName);
    if (userByName) {
      return userByName;
    }

    throw new Error('用户不存在');
  },

  // 检查用户是否存在（支持userId和userName）
  async checkUserExists(loginName) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const users = JSON.parse(localStorage.getItem('userDatabase') || '{}');

    // 检查userId
    if (users[loginName]) {
      return true;
    }

    // 检查userName
    return Object.values(users).some(user => user.userName === loginName);
  },

  // 验证用户密码（支持userId和userName）
  async verifyPassword(loginName, password) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const users = JSON.parse(localStorage.getItem('userDatabase') || '{}');

    let user;

    // 首先尝试作为userId查找
    if (users[loginName]) {
      user = users[loginName];
    } else {
      // 然后尝试作为userName查找
      user = Object.values(users).find(u => u.userName === loginName);
    }

    if (!user) {
      throw new Error('用户不存在');
    }

    return user.password === password;
  },

  // 注册新用户
  async registerUser(userName, password) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const users = JSON.parse(localStorage.getItem('userDatabase') || '{}');

    // 检查用户名是否全数字
    if (this.isNumericString(userName)) {
      throw new Error('用户名不能为全数字');
    }

    // 检查用户名是否已存在
    const userNameExists = Object.values(users).some(user => user.userName === userName);
    if (userNameExists) {
      throw new Error('用户名已存在');
    }

    // 生成唯一用户ID
    const userId = this.generateUserId();

    const newUser = {
      id: userId,
      userId: userId,
      userName: userName,
      avatar: null,
      password: password,
      messages: [],
      books: []
    };

    users[userId] = newUser;
    localStorage.setItem('userDatabase', JSON.stringify(users));

    return newUser;
  },

  // 根据用户ID获取用户信息
  async getUserById(userId) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const users = JSON.parse(localStorage.getItem('userDatabase') || '{}');
    const user = users[userId];

    if (!user) {
      throw new Error('用户不存在');
    }

    return user;
  },

  // 更新用户信息
  async updateUser(userId, updates) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const users = JSON.parse(localStorage.getItem('userDatabase') || '{}');
    users[userId] = { ...users[userId], ...updates };
    localStorage.setItem('userDatabase', JSON.stringify(users));
    return users[userId];
  },

  // 发送留言给其他用户
  async sendMessageToUser(fromUserId, toUserId, content) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const users = JSON.parse(localStorage.getItem('userDatabase') || '{}');

    // 检查目标用户是否存在
    if (!users[toUserId]) {
      throw new Error('目标用户不存在');
    }

    const fromUser = users[fromUserId];
    const toUser = users[toUserId];
    const newMessage = {
      id: Date.now(),
      text: content,
      time: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      liked: false,
      disliked: false,
      fromUserId: fromUserId,
      toUserId: toUserId,
      fromUserName: fromUser?.userName || fromUserId,
      toUserName: toUser?.userName || toUserId
    };

    // 添加到接收者的留言列表
    if (!users[toUserId].messages) {
      users[toUserId].messages = [];
    }
    users[toUserId].messages.unshift(newMessage);

    // 也添加到发送者的留言列表（作为发送记录）
    if (!users[fromUserId].messages) {
      users[fromUserId].messages = [];
    }
    users[fromUserId].messages.unshift({
      ...newMessage,
      isSentMessage: true
    });

    localStorage.setItem('userDatabase', JSON.stringify(users));
    return newMessage;
  },

  // 获取所有用户列表
  async getAllUsers() {
    await new Promise(resolve => setTimeout(resolve, 200));
    const users = JSON.parse(localStorage.getItem('userDatabase') || '{}');
    return Object.values(users).map(user => ({
      id: user.id,
      userId: user.userId,
      userName: user.userName,
      avatar: user.avatar
    }));
  },

  // 管理员功能
  async setUserAsAdmin(userId) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const users = JSON.parse(localStorage.getItem('userDatabase') || '{}');

    if (users[userId]) {
      users[userId].isAdmin = true;
      localStorage.setItem('userDatabase', JSON.stringify(users));
      return users[userId];
    }

    throw new Error('用户不存在');
  },

  async checkUserIsAdmin(userId) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const users = JSON.parse(localStorage.getItem('userDatabase') || '{}');
    const user = users[userId];

    return user && user.isAdmin === true;
  },

  async deleteAnyMessage(messageId) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const users = JSON.parse(localStorage.getItem('userDatabase') || '{}');

    let deleted = false;

    Object.keys(users).forEach(userId => {
      if (users[userId].messages) {
        const initialLength = users[userId].messages.length;
        users[userId].messages = users[userId].messages.filter(
          msg => msg.id !== messageId
        );

        if (users[userId].messages.length !== initialLength) {
          deleted = true;
        }
      }
    });

    localStorage.setItem('userDatabase', JSON.stringify(users));

    if (!deleted) {
      throw new Error('留言不存在');
    }

    return { success: true };
  },

  async clearAllData(adminUserId) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const users = JSON.parse(localStorage.getItem('userDatabase') || '{}');

    const adminUser = users[adminUserId];

    const newDatabase = {};
    if (adminUser) {
      newDatabase[adminUserId] = {
        ...adminUser,
        messages: [],
        books: []
      };
    }

    localStorage.setItem('userDatabase', JSON.stringify(newDatabase));

    localStorage.removeItem('currentUserId');
    localStorage.removeItem('currentUserName');

    return { success: true, message: '数据清除完成，请重新登录' };
  },

  async searchUsers(query) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const users = JSON.parse(localStorage.getItem('userDatabase') || '{}');
    const userList = Object.values(users);

    if (!query.trim()) {
      return [];
    }

    const lowercaseQuery = query.toLowerCase();

    // 搜索匹配的用户
    const results = userList.filter(user => {
      const matchId = user.userId.toLowerCase().includes(lowercaseQuery);
      const matchName = user.userName.toLowerCase().includes(lowercaseQuery);
      return matchId || matchName;
    });

    return results.slice(0, 10); // 限制返回结果数量
  },

  // 新增：根据ID或用户名获取用户
  async getUserByIdOrName(identifier) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const users = JSON.parse(localStorage.getItem('userDatabase') || '{}');

    // 首先尝试作为ID查找
    if (users[identifier]) {
      return users[identifier];
    }

    // 然后尝试作为用户名查找
    const userByName = Object.values(users).find(user =>
      user.userName.toLowerCase() === identifier.toLowerCase()
    );

    if (userByName) {
      return userByName;
    }

    throw new Error('用户不存在');
  }
};

const PersonalPage = ({ onBackToMain, initialUserId }) => {
  // 状态管理
  const [currentTab, setCurrentTab] = useState('messages');
  const [messages, setMessages] = useState([]);
  const [myBooks, setMyBooks] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userAvatar, setUserAvatar] = useState(null);
  const [userName, setUserName] = useState('');
  const [userDisplayId, setUserDisplayId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 登录状态
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(initialUserId || '');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });
  const [loginStatus, setLoginStatus] = useState('');

  // 发送给其他用户的状态
  const [sendToUserId, setSendToUserId] = useState('');
  const [showSendToModal, setShowSendToModal] = useState(false);
  const [sendToUserInput, setSendToUserInput] = useState('');

  // 查看其他用户主页的状态
  const [viewingUserId, setViewingUserId] = useState(null);
  const [viewingUserData, setViewingUserData] = useState(null);
  const [viewHistory, setViewHistory] = useState([]);

  // 管理员状态
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminSecret, setAdminSecret] = useState('');
  const [showClearDataModal, setShowClearDataModal] = useState(false);
  const [clearDataConfirm, setClearDataConfirm] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);


  // 初始化数据库和登录状态
  useEffect(() => {
    userAPI.initializeSampleData();

    // 检查是否有已保存的登录状态
    const savedUserId = localStorage.getItem('currentUserId');
    const targetUserId = initialUserId || savedUserId;

    if (targetUserId) {
      setUserId(targetUserId);
      setIsLoggedIn(true);
      loadUserData(targetUserId);
      checkAdminStatus(targetUserId);
    }
  }, [initialUserId]);

  // 检查管理员状态
  const checkAdminStatus = async (id) => {
    try {
      const adminStatus = await userAPI.checkUserIsAdmin(id);
      setIsAdmin(adminStatus);
    } catch (err) {
      console.error('检查管理员状态失败:', err);
    }
  };

  // 根据用户ID加载数据
  const loadUserData = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const userData = await userAPI.getUserById(id);

      setMessages(userData.messages || []);
      setMyBooks(userData.books || []);
      setUserAvatar(userData.avatar);
      setUserName(userData.userName);
      setUserDisplayId(userData.userId);
    } catch (err) {
      setError('加载用户数据失败: ' + err.message);
      console.error('加载用户数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 加载查看的用户数据
  const loadViewingUserData = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const userData = await userAPI.getUserById(id);
      setViewingUserData(userData);

      // 只显示该用户收到的留言
      const userMessages = (userData.messages || []).filter(
        msg => msg.toUserId === id
      );
      setMessages(userMessages);
    } catch (err) {
      setError('加载用户数据失败: ' + err.message);
      console.error('加载用户数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 保存用户数据到数据库
  const saveUserData = async (updates) => {
    try {
      await userAPI.updateUser(userId, updates);
    } catch (err) {
      console.error('保存用户数据失败:', err);
      setError('保存数据失败: ' + err.message);
    }
  };

  // 处理登录/注册
  const handleLogin = async () => {
    const { username, password } = loginForm;

    if (!username || !password) {
      setLoginStatus('请输入用户名/用户ID和密码');
      return;
    }

    try {
      setLoading(true);
      setLoginStatus('');

      // 首先尝试登录
      try {
        const passwordCorrect = await userAPI.verifyPassword(username, password);

        if (passwordCorrect) {
          const userData = await userAPI.getUserByLoginName(username);

          setLoginStatus('登录成功！');

          setTimeout(() => {
            completeLogin(userData.userId, userData.userName);
          }, 1000);
          return;
        } else {
          setLoginStatus('密码错误！');
          setLoading(false);
          return;
        }
      } catch (loginErr) {
        if (loginErr.message.includes('用户不存在')) {
          if (userAPI.isNumericString(username)) {
            setLoginStatus('用户名不能为全数字，请使用非全数字的用户名');
            setLoading(false);
            return;
          }

          const shouldRegister = window.confirm(
            `用户 "${username}" 不存在，是否以此用户名和密码注册？\n\n系统将为您自动生成一个唯一的用户ID。`
          );

          if (shouldRegister) {
            try {
              const newUser = await userAPI.registerUser(username, password);
              setLoginStatus(`注册成功！您的用户ID是: ${newUser.userId}\n正在登录...`);

              setTimeout(() => {
                completeLogin(newUser.userId, newUser.userName);
              }, 1500);
            } catch (registerErr) {
              setLoginStatus('注册失败: ' + registerErr.message);
              setLoading(false);
            }
          } else {
            setLoginStatus('已取消注册');
            setLoading(false);
          }
        } else {
          setLoginStatus('登录失败: ' + loginErr.message);
          setLoading(false);
        }
      }
    } catch (err) {
      setLoginStatus('系统错误: ' + err.message);
      setLoading(false);
    }
  };

  // 完成登录流程
  const completeLogin = (id, name) => {
    setUserId(id);
    setUserName(name);
    setIsLoggedIn(true);
    setShowLoginModal(false);
    setLoginForm({ username: '', password: '' });
    setLoginStatus('');

    localStorage.setItem('currentUserId', id);
    localStorage.setItem('currentUserName', name);

    loadUserData(id);
    checkAdminStatus(id);
  };

  // 处理登出
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserId('');
    setUserName('');
    setUserDisplayId('');
    setMessages([]);
    setMyBooks([]);
    setUserAvatar(null);
    setViewingUserId(null);
    setViewingUserData(null);
    setViewHistory([]);
    setIsAdmin(false);

    localStorage.removeItem('currentUserId');
    localStorage.removeItem('currentUserName');
  };

  // 压缩图片函数
  const compressImage = (file, maxWidth = 150, maxHeight = 150, quality = 0.8) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  // 处理头像上传
  const handleAvatarChange = async (e) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件（JPEG、PNG等）');
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('图片太大，请选择小于2MB的图片');
      return;
    }

    try {
      setLoading(true);

      let newAvatar;
      if (file.size > 500000) {
        newAvatar = await compressImage(file, 150, 150, 0.7);
      } else {
        const reader = new FileReader();
        newAvatar = await new Promise((resolve) => {
          reader.onload = (event) => resolve(event.target.result);
          reader.readAsDataURL(file);
        });
      }

      setUserAvatar(newAvatar);
      await saveUserData({ avatar: newAvatar });
      setError(null);
    } catch (err) {
      console.error('头像上传失败:', err);
      if (err.message.includes('quota') || err.message.includes('exceeded')) {
        setError('存储空间不足，请尝试使用更小的图片');
      } else {
        setError('头像上传失败: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // 删除留言
  const handleDeleteMessage = async (id) => {
    if (window.confirm('确定要删除这条留言吗？')) {
      const updatedMessages = messages.filter(msg => msg.id !== id);
      setMessages(updatedMessages);
      await saveUserData({ messages: updatedMessages });
    }
  };

  // 点赞留言
  const handleLikeMessage = async (id) => {
    const updatedMessages = messages.map(msg => {
      if (msg.id === id) {
        const wasDisliked = msg.disliked;
        return {
          ...msg,
          likes: msg.liked ? msg.likes - 1 : msg.likes + 1,
          dislikes: wasDisliked ? msg.dislikes - 1 : msg.dislikes,
          liked: !msg.liked,
          disliked: false
        };
      }
      return msg;
    });

    setMessages(updatedMessages);
    await saveUserData({ messages: updatedMessages });
  };

  // 点踩留言
  const handleDislikeMessage = async (id) => {
    const updatedMessages = messages.map(msg => {
      if (msg.id === id) {
        const wasLiked = msg.liked;
        return {
          ...msg,
          dislikes: msg.disliked ? msg.dislikes - 1 : msg.dislikes + 1,
          likes: wasLiked ? msg.likes - 1 : msg.likes,
          disliked: !msg.disliked,
          liked: false
        };
      }
      return msg;
    });

    setMessages(updatedMessages);
    await saveUserData({ messages: updatedMessages });
  };

  // 归还书籍
  const handleReturnBook = async (id) => {
    const updatedBooks = myBooks.filter(book => book.id !== id);
    setMyBooks(updatedBooks);
    await saveUserData({ books: updatedBooks });
  };

  // 延期书籍
  const handleRenewBook = async (id) => {
    const days = parseInt(prompt('请输入要延期的天数：'));
    if (isNaN(days) || days <= 0) return;

    const updatedBooks = myBooks.map(book => {
      if (book.id === id) {
        return { ...book, daysLeft: book.daysLeft + days };
      }
      return book;
    });

    setMyBooks(updatedBooks);
    await saveUserData({ books: updatedBooks });
  };

  // 处理键盘事件
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handlePostMessage();
    }
  };

  // 处理头像点击
  const handleAvatarClick = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
    }
  };

  // 处理发送给其他用户
  const handleSendToUser = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    setShowSendToModal(true);
  };

  // 处理查看其他用户主页
  const handleViewUserProfile = async (targetUserId) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    if (!userAPI.isNumericString(targetUserId)) {
      try {
        targetUserId = userAPI.getUserByLoginName(targetUserId).userId;
      } catch (err) {
        setError('加载用户主页失败: ' + err.message);
      }
    }

    if (targetUserId === userId) {
      setCurrentTab('messages');
      return;
    }

    try {
      setViewHistory(prev => [...prev, {
        userId: viewingUserId || userId,
        userName: viewingUserData?.userName || userName,
        tab: currentTab
      }]);

      setViewingUserId(targetUserId);
      setCurrentTab('messages');
      await loadViewingUserData(targetUserId);
    } catch (err) {
      setError('加载用户主页失败: ' + err.message);
    }
  };

  // 处理返回上级
  const handleBackToPrevious = () => {
    if (viewHistory.length === 0) {
      setViewingUserId(null);
      setViewingUserData(null);
      loadUserData(userId);
      return;
    }

    const previous = viewHistory[viewHistory.length - 1];
    const newHistory = viewHistory.slice(0, -1);

    setViewHistory(newHistory);

    if (previous.userId === userId) {
      setViewingUserId(null);
      setViewingUserData(null);
      setCurrentTab(previous.tab);
      loadUserData(userId);
    } else {
      setViewingUserId(previous.userId);
      setCurrentTab('messages');
      loadViewingUserData(previous.userId);
    }
  };

  // 管理员认证
  const handleAdminAuth = async () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    if (adminSecret === 'Test') {
      try {
        await userAPI.setUserAsAdmin(userId);
        setIsAdmin(true);
        setShowAdminModal(false);
        setAdminSecret('');
        setError('管理员认证成功！');

        setTimeout(() => setError(null), 3000);
      } catch (err) {
        setError('管理员认证失败: ' + err.message);
      }
    } else {
      setError('密钥错误，请重新输入');
    }
  };

  // 管理员删除留言
  const handleAdminDeleteMessage = async (messageId) => {
    if (!isAdmin) {
      setError('需要管理员权限');
      return;
    }

    if (window.confirm('确定要删除这条留言吗？（管理员操作）')) {
      try {
        await userAPI.deleteAnyMessage(messageId);

        if (viewingUserId) {
          loadViewingUserData(viewingUserId);
        } else {
          loadUserData(userId);
        }

        setError('留言已删除');
        setTimeout(() => setError(null), 3000);
      } catch (err) {
        setError('删除留言失败: ' + err.message);
      }
    }
  };

  // 管理员清除数据
  const handleAdminClearData = async () => {
    if (!isAdmin) {
      setError('需要管理员权限');
      return;
    }

    if (clearDataConfirm === '我确定要清除站点信息') {
      try {
        const result = await userAPI.clearAllData(userId);
        setShowClearDataModal(false);
        setClearDataConfirm('');

        setIsLoggedIn(false);
        setIsAdmin(false);
        setUserId('');
        setUserName('');
        setUserDisplayId('');
        setMessages([]);
        setMyBooks([]);
        setUserAvatar(null);

        setError(result.message);
        setTimeout(() => setError(null), 5000);
      } catch (err) {
        setError('清除数据失败: ' + err.message);
      }
    } else {
      setError('请输入正确的确认文字');
    }
  };

  // 获取发送者名称
  const getSenderName = (message) => {
    if (message.fromUserId === (viewingUserId || userId)) {
      return message.isSentMessage ? `发送给 ${message.toUserName || message.toUserId}` : currentUserData.userName;
    }
    return message.fromUserName || message.fromUserId;
  };

  // 获取消息类型样式
  const getMessageType = (message) => {
    const currentUserId = viewingUserId || userId;

    if (message.fromUserId === currentUserId && message.toUserId !== currentUserId) {
      return 'sent';
    } else if (message.fromUserId !== currentUserId && message.toUserId === currentUserId) {
      return 'received';
    }
    return 'self';
  };
  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      setSearchLoading(true);
      const results = await userAPI.searchUsers(query);
      setSearchResults(results);
      setShowSearchResults(true);
    } catch (err) {
      console.error('搜索失败:', err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // 处理搜索框失去焦点
  const handleSearchBlur = () => {
    // 延迟隐藏搜索结果，以便用户能够点击
    setTimeout(() => {
      setShowSearchResults(false);
    }, 200);
  };

  // 处理选择搜索结果
  const handleSelectSearchResult = (user) => {
    setSearchQuery('');
    setShowSearchResults(false);
    handleViewUserProfile(user.id);
  };

  // 修改发送留言函数，支持ID和用户名
  const handlePostMessage = async () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    if (newMessage.trim() === '') return;

    // 如果是查看其他用户主页，直接发送给该用户
    if (viewingUserId) {
      try {
        await userAPI.sendMessageToUser(userId, viewingUserId, newMessage.trim());
        setNewMessage('');
        loadViewingUserData(viewingUserId);
        setError(null);
      } catch (err) {
        setError('发送失败: ' + err.message);
      }
      return;
    }

    // 如果是发送给其他用户（支持ID或用户名）
    if (sendToUserInput && sendToUserInput !== userId) {
      try {
        // 解析用户标识（ID或用户名）
        const targetUser = await userAPI.getUserByIdOrName(sendToUserInput);

        await userAPI.sendMessageToUser(userId, targetUser.id, newMessage.trim());
        setNewMessage('');
        setSendToUserInput('');
        setShowSendToModal(false);
        loadUserData(userId); // 重新加载数据，显示发送记录
        setError(null);
      } catch (err) {
        setError('发送失败: ' + err.message);
      }
      return;
    }

    // 普通留言（给自己）
    const newMsg = {
      id: Date.now(),
      text: newMessage,
      time: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      liked: false,
      disliked: false,
      fromUserId: userId,
      toUserId: userId,
      fromUserName: userName
    };

    const updatedMessages = [newMsg, ...messages];
    setMessages(updatedMessages);
    setNewMessage('');

    await saveUserData({ messages: updatedMessages });
  };


  // 渲染用户头像（可点击）
  const renderUserAvatar = (user, size = 'medium') => {
    const avatarClass = `user-avatar ${size} ${user.id === userId ? 'current-user' : ''}`;

    return (
      <div
        className={avatarClass}
        onClick={() => handleViewUserProfile(user.id)}
        title={`查看 ${user.userName} 的主页`}
      >
        {user.avatar ? (
          <img src={user.avatar} alt={`${user.userName}的头像`} />
        ) : (
          <div className="avatar-placeholder">
            {user.userName ? user.userName.charAt(0) : '?'}
          </div>
        )}
      </div>
    );
  };

  // 确保返回主站按钮有处理函数
  const handleBackToMain = () => {
    if (onBackToMain && typeof onBackToMain === 'function') {
      onBackToMain();
    } else {
      console.warn('onBackToMain 回调函数未提供');
      alert('返回主站功能需要父组件提供 onBackToMain 回调函数');
    }
  };

  if (loading) {
    return (
      <div className="personal-page">
        <div className="loading-state">加载中...</div>
      </div>
    );
  }

  // 当前显示的用户数据
  const currentUserData = viewingUserId ? viewingUserData : {
    id: userId,
    userName: userName,
    avatar: userAvatar,
    userId: userDisplayId
  };
  const isViewingOtherUser = !!viewingUserId;

  return (
    <div className="personal-page">
      {/* 顶部区域 */}
      <div className="page-header">
        <div className="user-section">
          <div className="avatar-area">
            <div className="avatar-container" onClick={handleAvatarClick}>
              {isLoggedIn ? (
                userAvatar ? (
                  <img src={userAvatar} alt="头像" className="avatar" />
                ) : (
                  <div className="avatar-placeholder">暂无头像</div>
                )
              ) : (
                <div className="login-prompt">点击登录/注册</div>
              )}
            </div>

            {isLoggedIn && (
              <>
                <label className="avatar-upload-btn">
                  <input type="file" accept="image/*" onChange={handleAvatarChange} />
                  上传头像
                </label>
                <div className="user-info">
                  <div className="user-name">
                    {userName}
                    {isAdmin && <span className="admin-badge">管理员</span>}
                  </div>
                  <div className="user-id">ID: {userDisplayId}</div>
                  <div className="user-actions">
                    {!isAdmin && (
                      <button
                        className="admin-auth-btn"
                        onClick={() => setShowAdminModal(true)}
                      >
                        管理员认证
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        className="clear-data-btn"
                        onClick={() => setShowClearDataModal(true)}
                      >
                        清除数据
                      </button>
                    )}
                    <button className="logout-btn" onClick={handleLogout}>
                      退出登录
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
          <button className="back-main-btn" onClick={handleBackToMain}>
            返回主站
          </button>
        </div>

        {/* 搜索框 */}
        <div className="search-section">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="查找用户 (ID 或 名字)..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onBlur={handleSearchBlur}
              onFocus={() => searchQuery && setShowSearchResults(true)}
            />
            {searchLoading && <div className="search-loading">搜索中...</div>}

            {/* 搜索结果下拉框 */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map(user => (
                  <div
                    key={user.id}
                    className="search-result-item"
                    onClick={() => handleSelectSearchResult(user)}
                  >
                    <div className="result-avatar">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.userName} />
                      ) : (
                        <div className="avatar-placeholder-small">
                          {user.userName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="result-info">
                      <div className="result-name">{user.userName}</div>
                      <div className="result-id">ID: {user.userId}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 无搜索结果提示 */}
            {showSearchResults && searchQuery && !searchLoading && searchResults.length === 0 && (
              <div className="search-results">
                <div className="no-results">未找到匹配的用户</div>
              </div>
            )}
          </div>
        </div>

        {isLoggedIn && !isViewingOtherUser && (
          <div className="tabs">
            <button
              className={`tab ${currentTab === 'messages' ? 'active' : ''}`}
              onClick={() => setCurrentTab('messages')}
            >
              留言
            </button>
            <button
              className={`tab ${currentTab === 'books' ? 'active' : ''}`}
              onClick={() => setCurrentTab('books')}
            >
              我的借阅
            </button>
          </div>
        )}

        {isViewingOtherUser && (
          <div className="viewing-user-info">
            <h3>
              {currentUserData.userName} 的主页
              <span className="viewing-user-id">(ID: {currentUserData.userId})</span>
            </h3>
            <button className="back-previous-btn" onClick={handleBackToPrevious}>
              返回上级
            </button>
          </div>
        )}
      </div>

      {/* 内容区域 */}
      <div className="page-content">
        {!isLoggedIn ? (
          <div className="welcome-section">
            <h2>欢迎来到个人中心</h2>
            <p>请先登录或注册以使用完整功能</p>
            <button
              className="login-prompt-btn"
              onClick={() => setShowLoginModal(true)}
            >
              点击登录/注册
            </button>
          </div>
        ) : currentTab === 'messages' ? (
          <div className="messages-tab">
            <div className="messages-header">
              <h3>
                {isViewingOtherUser ? (
                  <>
                    {renderUserAvatar(currentUserData, 'small')}
                    <span>{currentUserData.userName} 的留言板</span>
                  </>
                ) : (
                  '我的留言板'
                )}
              </h3>

              {!isViewingOtherUser && (
                <button
                  className="send-to-btn"
                  onClick={handleSendToUser}
                >
                  发送给其他用户
                </button>
              )}
            </div>

            <div className="messages-list">
              {messages.length === 0 ? (
                <div className="empty-state">
                  {isViewingOtherUser ?
                    `${currentUserData.userName} 还没有收到任何留言` :
                    '还没有留言，快来发布第一条吧！'
                  }
                </div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={`message-card ${getMessageType(msg)}`}>
                    <div className="message-header">
                      <div className="message-sender">
                        {renderUserAvatar({
                          id: msg.fromUserId,
                          userName: msg.fromUserName,
                          avatar: null
                        }, 'small')}
                        <span className="sender-name">{getSenderName(msg)}</span>
                      </div>
                      {getMessageType(msg) === 'sent' && (
                        <span className="message-type-tag">发送</span>
                      )}
                      {getMessageType(msg) === 'received' && (
                        <span className="message-type-tag">接收</span>
                      )}
                    </div>
                    <div className="message-content">
                      <div className="message-text">{msg.text}</div>
                      <div className="message-time">
                        {new Date(msg.time).toLocaleString()}
                      </div>
                      {!isViewingOtherUser && (
                        <div className="message-actions">
                          <button
                            className={`like-btn ${msg.liked ? 'active' : ''}`}
                            onClick={() => handleLikeMessage(msg.id)}
                          >
                            赞 ({msg.likes})
                          </button>
                          <button
                            className={`dislike-btn ${msg.disliked ? 'active' : ''}`}
                            onClick={() => handleDislikeMessage(msg.id)}
                          >
                            踩 ({msg.dislikes})
                          </button>
                        </div>
                      )}
                    </div>
                    {(isAdmin || (!isViewingOtherUser && msg.fromUserId === userId)) && (
                      <button
                        className="delete-btn"
                        onClick={() => isAdmin ?
                          handleAdminDeleteMessage(msg.id) :
                          handleDeleteMessage(msg.id)
                        }
                        title={isAdmin ? "管理员删除" : "删除"}
                      >
                        删除
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="message-input-area">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isViewingOtherUser ?
                    `给 ${currentUserData.userName} 留言...` :
                    '写下你想说的话...'
                }
                rows="3"
                className="message-input"
              />
              <div className="message-actions-row">
                {sendToUserId && !isViewingOtherUser && (
                  <div className="send-to-info">
                    发送给: {sendToUserId}
                    <button
                      className="cancel-send-to"
                      onClick={() => setSendToUserId('')}
                    >
                      取消
                    </button>
                  </div>
                )}
                <button
                  onClick={handlePostMessage}
                  disabled={!newMessage.trim()}
                  className="post-btn"
                >
                  {isViewingOtherUser ? '发送留言' : (sendToUserId ? '发送留言' : '发布留言')}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="books-tab">
            <div className="books-list">
              {myBooks.length === 0 ? (
                <div className="empty-state">你还没有借阅任何书籍</div>
              ) : (
                myBooks.map(book => (
                  <div key={book.id} className="book-card">
                    <div className="book-info">
                      <h3 className="book-title">{book.name}</h3>
                      <p className="days-left">
                        剩余天数: <span className={book.daysLeft <= 3 ? 'urgent' : ''}>
                          {book.daysLeft}天
                        </span>
                      </p>
                    </div>
                    <div className="book-actions">
                      <button
                        className="return-btn"
                        onClick={() => handleReturnBook(book.id)}
                      >
                        归还
                      </button>
                      <button
                        className="renew-btn"
                        onClick={() => handleRenewBook(book.id)}
                      >
                        延期
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* 登录模态框 */}
      {showLoginModal && (
        <div className="modal-overlay">
          <div className="login-modal">
            <h3>登录/注册</h3>
            <div className="login-form">
              <div className="form-group">
                <label>用户名/用户ID:</label>
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({
                    ...loginForm,
                    username: e.target.value
                  })}
                  placeholder="请输入用户名或用户ID"
                />
                <div className="input-hint">
                  可以使用自定义用户名或系统分配的用户ID登录
                </div>
              </div>
              <div className="form-group">
                <label>密码:</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({
                    ...loginForm,
                    password: e.target.value
                  })}
                  placeholder="请输入密码"
                />
              </div>
              {loginStatus && (
                <div className={`login-status ${loginStatus.includes('成功') ? 'success' : 'error'}`}>
                  {loginStatus.split('\n').map((line, index) => (
                    <div key={index}>{line}</div>
                  ))}
                </div>
              )}
              <div className="modal-actions">
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="login-btn"
                >
                  {loading ? '处理中...' : '登录/注册'}
                </button>
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    setLoginStatus('');
                    setLoginForm({ username: '', password: '' });
                  }}
                  className="cancel-btn"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* 发送给用户模态框 */}
      {showSendToModal && (
        <div className="modal-overlay">
          <div className="send-to-modal">
            <h3>发送给其他用户</h3>
            <div className="send-to-form">
              <div className="form-group">
                <label>目标用户 (ID 或 用户名):</label>
                <input
                  type="text"
                  value={sendToUserInput}
                  onChange={(e) => setSendToUserInput(e.target.value)}
                  placeholder="请输入用户ID或用户名"
                />
                <div className="input-hint">
                  可以输入用户ID或用户名
                </div>
              </div>
              <div className="modal-actions">
                <button
                  onClick={() => {
                    if (sendToUserInput) {
                      setShowSendToModal(false);
                    } else {
                      setError('请输入用户ID或用户名');
                    }
                  }}
                  className="confirm-btn"
                >
                  确定
                </button>
                <button
                  onClick={() => {
                    setShowSendToModal(false);
                    setSendToUserInput('');
                  }}
                  className="cancel-btn"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 管理员认证模态框 */}
      {showAdminModal && (
        <div className="modal-overlay">
          <div className="admin-modal">
            <h3>管理员认证</h3>
            <div className="admin-form">
              <div className="form-group">
                <label>请输入管理员密钥:</label>
                <input
                  type="password"
                  value={adminSecret}
                  onChange={(e) => setAdminSecret(e.target.value)}
                  placeholder="请输入密钥"
                />
                <div className="input-hint">
                  提示：请联系系统管理员获取密钥
                </div>
              </div>
              <div className="modal-actions">
                <button
                  onClick={handleAdminAuth}
                  className="confirm-btn"
                >
                  认证
                </button>
                <button
                  onClick={() => {
                    setShowAdminModal(false);
                    setAdminSecret('');
                  }}
                  className="cancel-btn"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 清除数据确认模态框 */}
      {showClearDataModal && (
        <div className="modal-overlay">
          <div className="clear-data-modal">
            <h3>⚠️ 清除站点数据</h3>
            <div className="clear-data-form">
              <div className="warning-message">
                <p>此操作将<strong>永久删除</strong>除您账号外的所有数据：</p>
                <ul>
                  <li>所有其他用户账号</li>
                  <li>所有留言记录</li>
                  <li>所有借阅记录</li>
                </ul>
                <p>此操作<strong>不可撤销</strong>！</p>
              </div>
              <div className="form-group">
                <label>请输入 "<strong>我确定要清除站点信息</strong>" 以确认：</label>
                <input
                  type="text"
                  value={clearDataConfirm}
                  onChange={(e) => setClearDataConfirm(e.target.value)}
                  placeholder="我确定要清除站点信息"
                />
              </div>
              <div className="modal-actions">
                <button
                  onClick={handleAdminClearData}
                  disabled={clearDataConfirm !== '我确定要清除站点信息'}
                  className="danger-btn"
                >
                  确认清除
                </button>
                <button
                  onClick={() => {
                    setShowClearDataModal(false);
                    setClearDataConfirm('');
                  }}
                  className="cancel-btn"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="error-toast">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
    </div>
  );
};

export default PersonalPage;