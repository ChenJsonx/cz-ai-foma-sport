// ==================== 课程成绩获取（修正版）====================
(function courseScoreFetcher() {
  // 防重复执行
  if (window.__courseFetcherRunning) {
    console.log('⚠️ 课程任务已在运行，请勿重复启动');
    return;
  }
  window.__courseFetcherRunning = true;

  const TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; // ✅ 填入实际Token
  
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const formatTime = (date) => date.toLocaleTimeString('zh-CN', { hour12: false });
  
  // ✅ 修正：参数改为秒，更清晰
  const randomIntervalMs = (minSeconds, maxSeconds) => {
    const seconds = randomInt(minSeconds, maxSeconds);
    return seconds * 1000;
  };

  const results = [];
  const startId = 92;
  const endId = 109;
  const totalCourses = endId - startId + 1;
  
  // ✅ 修正：明确指定 90-165秒（1分30秒-2分45秒）
  const getCourseInterval = () => randomIntervalMs(90, 165);

  const headers = {
    "accept": "application/json",
    "authorization": TOKEN,
    "content-type": "application/json",
    "referrer": "https://fit.shangbanzugroup.com/h5/" // ✅ 去掉空格
  };

  console.log(`\n📚 [${formatTime(new Date())}] 开始执行：课程成绩获取`);
  console.log(`   课程范围: ${startId}-${endId} (共${totalCourses}个)`);
  console.log(`   间隔时间: 1分30秒 - 2分45秒 (随机)`);

  (async () => {
    for (let courseId = startId; courseId <= endId; courseId++) {
      try {
        const response = await fetch("https://fit.shangbanzugroup.com/front/v1/course/score", {
          method: "POST",
          headers: headers,
          body: JSON.stringify({ courseId }),
          credentials: "include"
        });
        
        if (!response.ok) {
          // ✅ Token 过期检测
          if (response.status === 401 || response.status === 403) {
            console.error(`🔴 Token 已过期，请更新后重试`);
            break;
          }
          throw new Error(`HTTP ${response.status}`);
        }
        
        // ✅ 安全解析 JSON
        const text = await response.text();
        const data = text ? JSON.parse(text) : {};
        results.push({ courseId, success: true, data });
        console.log(`   ✅ Course ${courseId} 完成`);
        
      } catch (err) {
        results.push({ courseId, success: false, error: err.message });
        console.error(`   ❌ Course ${courseId} 失败:`, err.message);
      }
      
      if (courseId < endId) {
        const intervalMs = getCourseInterval();
        const min = Math.floor(intervalMs / 60000);
        const sec = Math.floor((intervalMs % 60000) / 1000);
        console.log(`   ⏳ 等待 ${min}分${sec}秒...`);
        await sleep(intervalMs);
      }
    }
    
    console.log(`\n🎉 课程任务完成！成功: ${results.filter(r => r.success).length}/${totalCourses}`);
    window.__courseFetcherRunning = false;
    return results;
  })();
})();

// ==================== 运动数据提交（先查询，避免重复版）====================
(function exerciseSubmitter() {
  if (window.__exerciseSubmitterRunning) {
    console.log('⚠️ 运动任务已在运行，请勿重复启动');
    return;
  }
  window.__exerciseSubmitterRunning = true;

  // 从 localStorage 获取 Token
  const rawToken = localStorage.getItem('Front-Token');
  if (!rawToken) {
    console.error('❌ 错误：localStorage 中没有找到 Front-Token');
    window.__exerciseSubmitterRunning = false;
    return;
  }
  
  const TOKEN = `Bearer ${rawToken}`;
  console.log(`✅ Token 获取成功`);

  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const formatTime = (date) => date.toLocaleTimeString('zh-CN', { hour12: false });
  
  const randomIntervalMs = (minSeconds, maxSeconds) => {
    const seconds = randomInt(minSeconds, maxSeconds);
    return seconds * 1000;
  };

  // 获取今天的日期字符串 YYYY-MM-DD
  const getTodayStr = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const exerciseConfigs = [
    { type: 'jump-rope', name: '跳绳', countRange: [100, 168], durationRange: [92, 156] },
    { type: 'crunch', name: '卷腹', countRange: [20, 47], durationRange: [38, 86] },
    { type: 'high-knee', name: '高抬腿', countRange: [100, 157], durationRange: [78, 134] },
    { type: 'push-up', name: '俯卧撑', countRange: [20, 41], durationRange: [54, 97] },
    { type: 'jumping-jack', name: '开合跳', countRange: [30, 67], durationRange: [41, 79] },
    { type: 'squat-up', name: '深蹲', countRange: [30, 53], durationRange: [58, 96] },
    { type: 'sit-up', name: '仰卧起坐', countRange: [30, 52], durationRange: [61, 99] },
    { type: 'plank', name: '平板支撑', countRange: [0, 0], durationRange: [124, 187] }
  ];

  const headers = {
    "accept": "application/json",
    "authorization": TOKEN,
    "content-type": "application/json",
    "referrer": "https://fit.shangbanzugroup.com/h5/"
  };

  // ✅ 查询今天是否已做过该运动
  async function checkTodayExercise(type) {
    try {
      const response = await fetch(`https://fit.shangbanzugroup.com/front/v1/fit-record/stats?type=${type}`, {
        method: "GET",
        headers: headers,
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      
      // 判断 today 中的 sumCount 和 sumDuration
      const today = data?.data?.today;
      const sumCount = today?.sumCount || 0;
      const sumDuration = today?.sumDuration || 0;
      
      // 如果都是0，说明今天没做过
      const hasDoneToday = sumCount > 0 || sumDuration > 0;
      
      return {
        hasDoneToday,
        todayData: today,
        stats: data?.data?.stats
      };
      
    } catch (err) {
      console.error(`   ⚠️ 查询 ${type} 失败:`, err.message);
      // 查询失败时，默认认为没做过（避免漏做）
      return { hasDoneToday: false, todayData: null, stats: null, error: err.message };
    }
  }

  // 生成运动数据
  const exercises = exerciseConfigs.map(cfg => ({
    ...cfg,
    actualCount: cfg.type === 'plank' ? 0 : randomInt(...cfg.countRange),
    actualDuration: randomInt(...cfg.durationRange)
  }));

  // 间隔时间 4-5分钟（240-300秒）
  const getExerciseInterval = () => randomIntervalMs(240, 300);

  const results = [];
  const todayStr = getTodayStr();

  console.log(`\n🏋️ [${formatTime(new Date())}] 开始执行：运动数据提交`);
  console.log(`   日期: ${todayStr}`);
  console.log(`   共${exercises.length}项运动`);
  console.log(`   策略: 先查询，今日未做才执行`);
  console.log(`   间隔时间: 4分00秒 - 5分00秒 (随机)\n`);

  (async () => {
    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`[${i + 1}/${exercises.length}] 🎯 ${ex.name} (${ex.type})`);
      
      // ✅ Step 1: 查询今天是否已做过
      console.log(`   🔍 查询今日记录...`);
      const checkResult = await checkTodayExercise(ex.type);
      
      if (checkResult.hasDoneToday) {
        console.log(`   ⏭️  今日已做过，跳过`);
        console.log(`   📊 今日数据: ${checkResult.todayData?.sumCount || 0}个, ${checkResult.todayData?.sumDuration || 0}秒`);
        results.push({ name: ex.name, skipped: true, reason: '今日已做过', todayData: checkResult.todayData });
        continue;
      }
      
      console.log(`   ✅ 今日未做，准备执行`);
      
      // Step 2: 构造 remark
      let remark;
      if (ex.type === 'plank') {
        remark = `性别男，体重65kg，身高175cm，${ex.name}${ex.actualDuration}秒，`;
      } else {
        remark = `性别男，体重65kg，身高175cm，${ex.name}${ex.actualDuration}秒，计数${ex.actualCount}个，`;
      }

      // Step 3: 执行提交
      try {
        console.log(`   🚀 开始提交...`);
        
        const response = await fetch("https://fit.shangbanzugroup.com/front/v1/fit-record", {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            type: ex.type,
            count: ex.actualCount,
            duration: ex.actualDuration,
            remark
          }),
          credentials: "include"
        });
        
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            console.error(`   🔴 Token 已过期，请重新登录`);
            break;
          }
          throw new Error(`HTTP ${response.status}`);
        }
        
        const text = await response.text();
        const data = text ? JSON.parse(text) : {};
        results.push({ name: ex.name, success: true, data });
        
        if (ex.type === 'plank') {
          console.log(`   ✅ 提交成功 (${ex.actualDuration}秒)`);
        } else {
          console.log(`   ✅ 提交成功 (${ex.actualDuration}秒, ${ex.actualCount}个)`);
        }
        
      } catch (err) {
        results.push({ name: ex.name, success: false, error: err.message });
        console.error(`   ❌ 提交失败:`, err.message);
      }
      
      // Step 4: 等待间隔（最后一项不等待）
      if (i < exercises.length - 1) {
        const intervalMs = getExerciseInterval();
        const min = Math.floor(intervalMs / 60000);
        const sec = Math.floor((intervalMs % 60000) / 1000);
        console.log(`   ⏳ 等待 ${min}分${sec}秒...`);
        await sleep(intervalMs);
      }
    }
    
    // 统计结果
    const executed = results.filter(r => r.success).length;
    const skipped = results.filter(r => r.skipped).length;
    const failed = results.filter(r => r.success === false).length;
    
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🎉 运动任务处理完成！`);
    console.log(`   已执行: ${executed} 项`);
    console.log(`   已跳过(今日已做): ${skipped} 项`);
    console.log(`   失败: ${failed} 项`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    window.__exerciseSubmitterRunning = false;
    return results;
  })();
})();


//油猴脚本
// ==UserScript==
// @name         工家云 - 一键运动打卡（带实时日志）
// @namespace    http://tampermonkey.net/
// @version      2026-02-07
// @description  在工家云页面添加一键启动运动打卡的按钮，并显示实时日志
// @author       You
// @match        https://fit.shangbanzugroup.com/h5/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=shangbanzugroup.com
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  let logPanel = null;
  let logContent = null;

  // ========== 创建日志面板 ==========
  function createLogPanel() {
    if (logPanel) return;

    logPanel = document.createElement('div');
    logPanel.id = 'exercise-log-panel';
    logPanel.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 20px;
      width: 320px;
      max-height: 400px;
      background: #2d2d2d;
      color: #f0f0f0;
      font-family: Consolas, monospace;
      font-size: 12px;
      border: 1px solid #444;
      border-radius: 6px;
      z-index: 99999;
      display: none;
      flex-direction: column;
    `;

    const header = document.createElement('div');
    header.textContent = '📊 运动打卡日志';
    header.style.cssText = `
      padding: 8px 12px;
      background: #1e1e1e;
      font-weight: bold;
      border-bottom: 1px solid #444;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;

    const closeBtn = document.createElement('span');
    closeBtn.textContent = '×';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.fontSize = '18px';
    closeBtn.onclick = () => { logPanel.style.display = 'none'; };
    header.appendChild(closeBtn);

    logContent = document.createElement('div');
    logContent.style.cssText = `
      padding: 10px;
      overflow-y: auto;
      flex-grow: 1;
      line-height: 1.4;
    `;

    logPanel.appendChild(header);
    logPanel.appendChild(logContent);
    document.body.appendChild(logPanel);
  }

  // ========== 日志输出函数（同时写入控制台和面板）==========
  function logToPanel(message, isError = false) {
    console.log(message); // 保留控制台输出

    if (!logPanel) createLogPanel();
    logPanel.style.display = 'flex';

    const line = document.createElement('div');
    line.textContent = message;
    line.style.color = isError ? '#ff9999' : '#cccccc';
    line.style.whiteSpace = 'pre-wrap';
    logContent.appendChild(line);
    logContent.scrollTop = logContent.scrollHeight; // 自动滚动到底部
  }

  // ========== 创建启动按钮 ==========
  function createStartButton() {
    const button = document.createElement('button');
    button.textContent = '🚀 一键运动打卡';
    button.style.position = 'fixed';
    button.style.bottom = '40px';
    button.style.right = '20px';
    button.style.zIndex = '9999';
    button.style.padding = '12px 20px';
    button.style.fontSize = '16px';
    button.style.backgroundColor = '#4CAF50';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '8px';
    button.style.cursor = 'pointer';
    button.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    button.addEventListener('click', exerciseSubmitter);
    document.body.appendChild(button);
  }

  // ========== 运动数据提交逻辑（带日志面板输出）==========
  async function exerciseSubmitter() {
    if (window.__exerciseSubmitterRunning) {
      logToPanel('⚠️ 运动任务已在运行，请勿重复启动', true);
      return;
    }
    window.__exerciseSubmitterRunning = true;

    const rawToken = localStorage.getItem('Front-Token');
    if (!rawToken) {
      alert('❌ 错误：未登录或 Front-Token 不存在，请先登录工家云！');
      logToPanel('❌ 错误：localStorage 中没有找到 Front-Token', true);
      window.__exerciseSubmitterRunning = false;
      return;
    }

    const TOKEN = `Bearer ${rawToken}`;
    logToPanel('✅ Token 获取成功');

    const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const formatTime = (date) => date.toLocaleTimeString('zh-CN', { hour12: false });
    const randomIntervalMs = (minSeconds, maxSeconds) => randomInt(minSeconds, maxSeconds) * 1000;
    const getTodayStr = () => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    };

    const exerciseConfigs = [
      { type: 'jump-rope', name: '跳绳', countRange: [100, 168], durationRange: [92, 156] },
      { type: 'crunch', name: '卷腹', countRange: [20, 47], durationRange: [38, 86] },
      { type: 'high-knee', name: '高抬腿', countRange: [100, 157], durationRange: [78, 134] },
      { type: 'push-up', name: '俯卧撑', countRange: [20, 41], durationRange: [54, 97] },
      { type: 'jumping-jack', name: '开合跳', countRange: [30, 67], durationRange: [41, 79] },
      { type: 'squat-up', name: '深蹲', countRange: [30, 53], durationRange: [58, 96] },
      { type: 'sit-up', name: '仰卧起坐', countRange: [30, 52], durationRange: [61, 99] },
      { type: 'plank', name: '平板支撑', countRange: [0, 0], durationRange: [124, 187] }
    ];

    const headers = {
      "accept": "application/json",
      "authorization": TOKEN,
      "content-type": "application/json",
      "referrer": "https://fit.shangbanzugroup.com/h5/"
    };

    async function checkTodayExercise(type) {
      try {
        const response = await fetch(`https://fit.shangbanzugroup.com/front/v1/fit-record/stats?type=${type}`, {
          method: "GET", headers, credentials: "include"
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const today = data?.data?.today;
        return { hasDoneToday: (today?.sumCount || 0) > 0 || (today?.sumDuration || 0) > 0 };
      } catch (err) {
        logToPanel(`   ⚠️ 查询 ${type} 失败: ${err.message}`, true);
        return { hasDoneToday: false };
      }
    }

    const exercises = exerciseConfigs.map(cfg => ({
      ...cfg,
      actualCount: cfg.type === 'plank' ? 0 : randomInt(...cfg.countRange),
      actualDuration: randomInt(...cfg.durationRange)
    }));

    const results = [];
    const todayStr = getTodayStr();

    logToPanel(`\n🏋️ [${formatTime(new Date())}] 开始执行：运动数据提交`);
    logToPanel(`   日期: ${todayStr}`);
    logToPanel(`   共${exercises.length}项运动`);

    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      logToPanel(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      logToPanel(`[${i + 1}/${exercises.length}] 🎯 ${ex.name} (${ex.type})`);

      logToPanel(`   🔍 查询今日记录...`);
      const checkResult = await checkTodayExercise(ex.type);

      if (checkResult.hasDoneToday) {
        logToPanel(`   ⏭️  今日已做过，跳过`);
        results.push({ name: ex.name, skipped: true });
        continue;
      }

      logToPanel(`   ✅ 今日未做，准备执行`);

      let remark = `性别男，体重65kg，身高175cm，${ex.name}${ex.actualDuration}秒`;
      if (ex.type !== 'plank') remark += `，计数${ex.actualCount}个`;
      remark += '，';

      try {
        logToPanel(`   🚀 开始提交...`);
        const response = await fetch("https://fit.shangbanzugroup.com/front/v1/fit-record", {
          method: "POST",
          headers,
          body: JSON.stringify({ type: ex.type, count: ex.actualCount, duration: ex.actualDuration, remark }),
          credentials: "include"
        });

        if (!response.ok) {
          if ([401, 403].includes(response.status)) {
            alert('🔴 Token 已过期，请重新登录工家云！');
            logToPanel(`   🔴 Token 已过期，请重新登录`, true);
            break;
          }
          throw new Error(`HTTP ${response.status}`);
        }

        results.push({ name: ex.name, success: true });
        logToPanel(`   ✅ 提交成功 (${ex.actualDuration}秒${ex.type !== 'plank' ? `, ${ex.actualCount}个` : ''})`);

      } catch (err) {
        results.push({ name: ex.name, success: false, error: err.message });
        logToPanel(`   ❌ 提交失败: ${err.message}`, true);
      }

      if (i < exercises.length - 1) {
        const intervalMs = randomIntervalMs(240, 300);
        const min = Math.floor(intervalMs / 60000);
        const sec = Math.floor((intervalMs % 60000) / 1000);
        logToPanel(`   ⏳ 等待 ${min}分${sec}秒...`);
        await sleep(intervalMs);
      }
    }

    const executed = results.filter(r => r.success).length;
    const skipped = results.filter(r => r.skipped).length;
    const failed = results.filter(r => r.success === false).length;

    logToPanel(`\n🎉 运动任务完成！执行: ${executed}, 跳过: ${skipped}, 失败: ${failed}`);

    window.__exerciseSubmitterRunning = false;

    if (failed > 0) {
      alert(`运动打卡完成！\n✅ 成功: ${executed}\n⏭️ 跳过: ${skipped}\n❌ 失败: ${failed}`);
    } else {
      alert(`🎉 运动打卡全部成功！\n✅ 执行: ${executed} 项\n⏭️ 跳过: ${skipped} 项`);
    }
  }

  // ========== 初始化 ==========
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createStartButton);
  } else {
    createStartButton();
  }
})();